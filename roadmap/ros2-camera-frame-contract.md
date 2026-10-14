# 视觉抓取之前：ROS 2 相机坐标与时间戳检查路线

更新：2026-10-14。面向已能发布相机话题、准备把“识别到目标”接到仿真抓取或导航动作的 ROS 2 开发者。

**交付状态：本文是一份基于 ROS 2 官方文档和消息定义核验的接口与检查路线，不是已经运行的仿真或真机复现记录。本文没有安装 ROS 2、启动 Gazebo/RViz、标定相机、运行检测模型或控制机器人。命令、话题名和成功条件须在你的发行版、机器人驱动与仿真场景中实际验证。**

“模型检测到了杯子”还不是可执行动作。执行器需要知道：检测结果属于哪个坐标系、来自哪个时刻、能否转换到 `base_link`，以及转换失败时能否安全停下。本路线把这四件事写成一个小而可检查的契约，适合在接入 VLM、检测器、抓取规划器之前完成。

## 1. 适用边界与最小环境

适合：ROS 2 初学者、做桌面抓取/室内导航仿真的工程师、需要让感知节点与执行节点独立演进的团队。

最小环境是 Linux + 一个与你项目匹配的 ROS 2 发行版（本文命令以 Jazzy 风格展示）+ 已发布图像、`CameraInfo` 和 TF 的仿真或机器人系统。只做话题和 TF 检查不需要实体机械臂；若要执行抓取或移动，仍需要对应的仿真控制器或经校准、具备急停措施的真实硬件。不要把 RViz 中可见的坐标轴当成真机安全证明。

## 2. 先约定输入与输出，而不是先接模型

把一个“目标检测结果”最少约束为以下字段。二维检测框本身不能直接生成三维抓取点；需要深度、点云、已知平面或其他几何模块补齐 `point_camera`。

```yaml
header:
  stamp: <与源图像同一采集时刻>
  frame_id: camera_color_optical_frame
label: red_cup
score: 0.91
point_camera: [0.42, -0.08, 0.71]  # 米；明确属于 header.frame_id
source:
  image_topic: /camera/color/image_raw
  camera_info_topic: /camera/color/camera_info
  model_version: detector-2026-10-14
```

执行侧只接受经过转换的命令，并保留原始证据：

```yaml
target_frame: base_link
point_base: [0.31, 0.12, 0.18]
source_stamp: <复制 detection.header.stamp>
tf_lookup: ok
decision: candidate_only  # 不是直接运动命令
```

这里的关键不是字段名称，而是两个不变量：`frame_id` 不能缺失，转换查询必须使用感知消息的 `stamp`，不能用“现在”。TF2 的官方教程把坐标变换作为带时间的坐标帧关系处理；这正是移动底盘、相机或机械臂运动时避免把旧观测当作新位置的基础。

## 3. 先做三项只读检查

以下命令不会控制机器人；它们只检查你已经启动的系统。具体话题与 frame 名称必须替换为你的实际名称。

```bash
# 记录图像、相机内参和 TF 是否真的存在。
ros2 topic list | rg 'camera|tf'
ros2 topic echo --once /camera/color/camera_info
ros2 topic echo --once /tf

# 检查从感知坐标系到机器人基座的变换能否解析。
ros2 run tf2_ros tf2_echo base_link camera_color_optical_frame

# 输出当前 TF 图；只用于诊断，不能证明历史时刻的 transform 可用。
ros2 run tf2_tools view_frames
```

每一项至少留下命令、运行时间、发行版、话题名与输出片段。`CameraInfo` 中的内参、畸变模型和其 `header.frame_id` 应与图像流的约定一致；官方 `sensor_msgs/CameraInfo` 定义明确指出其坐标系是相机的 optical frame。若检测节点引用的是另一个 frame（例如传感器外壳 frame），应记录静态变换来源和发布者。

## 4. 把 TF 查询做成显式门禁

感知到执行的最小状态机不应是“检测成功就移动”，而应是：

```text
IMAGE + CAMERA_INFO
        |
        v
DETECTION (frame_id, stamp, point_camera)
        |
        +-- frame_id / stamp / 深度缺失 --> REJECT_INPUT
        |
        v
LOOKUP_TF(base_link <- camera_frame, detection.stamp)
        |
        +-- unavailable / extrapolation --> WAIT_OR_REJECT (不发运动)
        |
        v
TRANSFORM_POINT --> WORKSPACE / 碰撞 / 置信度检查
        |
        +-- 未通过 --> CANDIDATE_REJECTED
        |
        v
CANDIDATE_ONLY --> 交给规划器或人工确认
```

推荐先把 `CANDIDATE_ONLY` 写入日志或在 RViz 标记，不直接调用机械臂 action。只有当项目另行定义了工作空间、碰撞、速度、急停与成功判定，才可由规划器把候选点转为动作。TF2 官方教程也提供了监听与查询 transform 的示例；复用该模式时，应对查不到 transform 和时间外推错误建立可观察的失败路径。

## 5. 四个必须主动制造的失败样本

| 故障注入 | 预期系统反应 | 不应发生的事 |
| --- | --- | --- |
| `frame_id` 为空或未知 | 标记 `REJECT_INPUT`，记录原始消息 | 默认猜测为 `base_link` |
| 使用过旧图像时间戳 | TF 查询失败或被 freshness 门禁拒绝 | 用当前 TF 静默替代历史 TF |
| 只有 2D box、无深度/平面 | 标记“不可定位” | 伪造 z 值后移动 |
| `point_base` 超出工作空间 | 标记 `CANDIDATE_REJECTED` | 把点裁剪到边界并执行 |

建议把每个失败样本的输入、状态码、TF 查询参数和处理决定保存为 JSONL。这样后续更换 VLM、相机或规划器时，可以检查接口是否仍然守住同一条安全边界。

## 6. 可复核的验收标准

本路线完成的标准是接口和证据，而不是“机械臂抓到了物体”。在一个实际环境中，至少应能提供：

1. 一条图像和对应 `CameraInfo` 的采样记录，两个消息的 `frame_id` 与时间关系明确；
2. 一条以源 `stamp` 查询 `base_link <- camera_*_optical_frame` 的成功或失败日志；
3. 一条从 `point_camera` 到 `point_base` 的候选转换记录，含单位与目标 frame；
4. 上表四类至少各一条失败样本，且均未触发执行动作；
5. 单独的执行侧文档，定义碰撞、工作空间、速度、急停和任务成功判定。

这些证据通过后，才适合把候选点交给 MoveIt、导航栈或特定机器人控制器。它们不证明标定精度、抓取成功率、模型鲁棒性或真机安全性。

## 7. 一手来源与核验范围

以下均为 2026-10-14 查阅的 ROS 官方文档或官方消息定义：

- [tf2 introduction](https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Tf2/Introduction-To-Tf2.html)：坐标帧与带时间的 transform 概念。适合首次理解 TF2。
- [Writing a static broadcaster (C++)](https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Tf2/Writing-A-Static-Broadcaster-Cpp.html)：静态坐标变换发布方式。适合核查传感器安装 frame。
- [Writing a listener (C++)](https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Tf2/Writing-A-Listener-Cpp.html)：查询和监听 transform 的官方范式。适合实现转换门禁。
- [sensor_msgs/CameraInfo](https://docs.ros.org/en/ros2_packages/jazzy/api/sensor_msgs/msg/CameraInfo.html)：内参、畸变参数及 optical frame 的消息定义。适合核查相机契约。
- [tf2_tools](https://docs.ros.org/en/ros2_packages/jazzy/api/tf2_tools/)：`view_frames` 等 TF 诊断工具。适合排查 frame tree。

ROS 2 文档与包版本会更新；执行前请按你的发行版复核命令和 API。本文没有声称任何 Gazebo、RViz、检测模型、MoveIt、真机或仿真流程已在本仓库运行成功。