# 不买机器人，先练 ROS2 动作闭环：turtlesim 实践路线

更新：2026-09-16。适合会使用 Linux 终端、准备把 Agent 接入 ROS2 的开发者。

**交付状态：本文是基于官方文档与源码核验的操作指南和扩展设计，不是本仓库已运行的 Robot Agent 实现。本次没有安装 ROS2、运行仿真或测量成功率。下文输出均为预期，验收表需由实际执行者填写。**

现有 [ROS2 + AI 路线](ros2-ai-robot-track.md) 覆盖感知、规划与执行。本练习先缩小到一个可观察任务：让屏幕上的海龟转到指定朝向，记录目标、反馈、终态以及最终姿态。之后再把自然语言解析器接到同一接口。

## 1. 环境与边界

- 基线：Ubuntu 24.04、ROS 2 Jazzy、Bash，具备桌面显示环境。按照文末官方安装文档先完成软件源和 ROS 安装。
- 硬件：能运行上述桌面环境的普通电脑；本练习没有训练模型、CUDA 或实体机器人依赖。不提供未经测试的最低内存或性能保证。
- macOS/Windows 用户可准备 Ubuntu 桌面虚拟机；资源分配与图形加速取决于宿主机，本文未验证该组合。纯 SSH 或无显示容器需要另行解决 GUI，不能直接假定窗口可用。
- MVP 只有二维朝向控制；没有相机、抓取、导航避障、动力学验证或大模型推理。turtlesim 适合学习通信语义，不能据此宣称真机可用。

## 2. 跑通一条可观察的成功路径

已按官方安装指南配置 ROS 软件源后，安装练习包：

```bash
sudo apt update
sudo apt install ros-jazzy-turtlesim
```

在每个新终端先执行以下两行；四个终端必须使用相同配置。42 只是本练习选定的域编号，若与其他练习冲突应统一更换。

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=42
```

终端 A 启动仿真并保留服务端日志：

```bash
ros2 run turtlesim turtlesim_node 2>&1 | tee turtlesim-server.log
```

终端 B 检查接口，然后持续观察朝向；最后一条命令会持续运行：

```bash
ros2 action list -t
ros2 action info /turtle1/rotate_absolute
ros2 interface show turtlesim/action/RotateAbsolute
ros2 topic echo /turtle1/pose
```

预期能找到 `/turtle1/rotate_absolute`，类型为 `turtlesim/action/RotateAbsolute`。接口中的 `theta` 是目标绝对朝向（弧度），反馈 `remaining` 是剩余转角，结果 `delta` 是相对起始姿态的角位移，不能把它当作最终朝向。

终端 C 发送目标并保存 CLI 输出：

```bash
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute '{theta: 1.57}' --feedback 2>&1 | tee goal-success.log
```

验收时分别检查：目标被接受、出现反馈、最终状态为 `SUCCEEDED`，以及终端 B 中完成后的 `theta` 接近 1.57。定义角误差为 `atan2(sin(theta_actual-theta_goal), cos(theta_actual-theta_goal))`；本练习建议绝对值小于 0.03 rad。它是练习验收阈值，并非真机精度承诺。不要用“命令退出了”或“模型说完成了”代替这些证据。

## 3. 主动制造失败，区分取消与中止

每个场景独立执行，先等待上个目标结束；必要时重启终端 A，使初始朝向回到 0。

### 取消：由发起目标的 teleop 客户端演示

终端 C 启动：

```bash
ros2 run turtlesim turtle_teleop_key
```

保持键盘焦点在该终端。按 `G` 等待回到右侧朝向，再按 `D`，在转动结束前立即按 `F`。预期终端 A 出现取消日志。若动作已结束，再次制造较大角差重试。`F` 用于此 teleop 客户端发起的旋转，不能把它当成其他 CLI 目标的通用取消键。完成后按 `q` 退出 teleop。

### 中止：速度命令打断旋转

确认无其他控制器运行。重启终端 A 后，在终端 C 执行：

```bash
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute '{theta: 3.0}' --feedback 2>&1 | tee goal-aborted.log
```

在旋转尚未完成时，终端 D 执行：

```bash
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist '{linear: {x: 0.0}, angular: {z: 0.0}}'
```

预期原目标得到 `ABORTED`；这是所核验 turtlesim 源码的行为，其他机器人 action server 不一定相同。如果命令到达太晚而仍为成功，本次失败注入无效，不能填为通过；应重置后重试。

### 服务端不可用：验证等待不会变成假成功

停止终端 A，再从终端 C 发送同样目标。预期客户端等待服务器；记录现象后用 Ctrl+C 退出 CLI。**退出客户端进程不等于确认远端目标取消**；本场景没有运行中的服务端，不用于证明取消语义。

## 4. 下一步接 AI：先约定任务契约

以下为待实现的接口设计，不是现有程序。先以规则把“朝向 90 度”转换为弧度，验证执行层后再替换成模型解析。绝对朝向和“相对左转 90 度”是两种任务；后者还需要读取当前姿态并处理过期状态，本 MVP 先拒绝。

```json
{
  "task_id": "rotation-001",
  "operation": "rotate_absolute",
  "theta_rad": 1.5708,
  "deadline_ms": 5000
}
```

模块划分：输入解析器 → 参数校验 → 单目标执行器 → 事件记录器。只允许 `rotate_absolute`，角度须为有限数值且位于 [-π, π]，超时须为正且有上限；忙碌时拒绝新任务。`task_id` 需防重复执行，并与 ROS goal UUID 关联。非法 JSON、NaN、未知操作不能到达 ROS。

建议状态流：`VALIDATED → WAITING_SERVER → GOAL_PENDING → EXECUTING → SUCCEEDED / ABORTED / CANCELED`；另设 `REJECTED` 与 `UNCONFIRMED`。应用截止时间建议从校验完成后用单调时钟计时，覆盖等待服务器、接收目标及执行过程。已发送但尚未获知是否接受时也可能存在远端动作，不能直接宣布失败后重试。

执行超时后，如已持有 goal handle，发出取消请求并等待终态；收到取消响应不代表已经停止。若接受响应迟到，应跟踪并取消该目标。无法确认时标记 `UNCONFIRMED`、阻止自动重试，人工检查服务端。本文没有提供上述客户端实现，CLI 练习不会自动拥有这些能力。

## 5. 验收记录与可分享材料

所有行初始为“未执行”。保留环境版本、命令、goal UUID、时间、服务端日志与客户端输出；发布截图时不要填入虚构耗时。

| 场景 | 通过条件 | 本次状态 |
| --- | --- | --- |
| 正常旋转 | 接受目标、反馈、成功终态与最终角度一致 | 未执行 |
| teleop 取消 | 在结束前取消，服务端日志确认取消 | 未执行 |
| 速度命令打断 | 原目标返回 ABORTED，保留客户端与服务端日志 | 未执行 |
| 服务端停止 | 观察到不可用/等待，没有记录为成功 | 未执行 |
| AI 输入校验（扩展） | 非法参数不产生 ROS goal | 未实现 |
| 超时与迟到响应（扩展） | 未确认时不盲目重试，跟踪远端终态 | 未实现 |

建议附上 `lsb_release -ds`、`printenv ROS_DISTRO`、`dpkg-query -W ros-jazzy-turtlesim` 的实际输出。源码核验版本不等于本机安装包版本，若行为不同，应连同版本与复现步骤记录。

下一阶段交付物可以是一个有上述状态机的 Python action client，加一段正常、取消、失败各一次的录屏。在这些证据齐全前，只称为方案或教程，不称为复现成功。现有路线 Issue #2 还包含语音、视觉与硬件替代方案，本练习仅补执行反馈部分，不代表该 Issue 已全部完成。

## 6. 一手来源与核验范围

2026-09-16 已通过 GitHub API 读取下列官方源码。docs.ros.org 网页在本次访问中被防护页拦截，因此提供固定提交链接，避免把拦截页当作验证成功。

- [Jazzy Ubuntu 安装文档源码](https://github.com/ros2/ros2_documentation/blob/4d73330f15b192bb412032427489147a27cc3dbd/source/Installation/Ubuntu-Install-Debs.rst)：Ubuntu 24.04、安装包与环境加载入口。类型：官方安装文档；适合初学。
- [turtlesim 入门文档源码](https://github.com/ros2/ros2_documentation/blob/4d73330f15b192bb412032427489147a27cc3dbd/source/Tutorials/Beginner-CLI-Tools/Introducing-Turtlesim/Introducing-Turtlesim.rst)：启动、teleop 与 GUI 前提。类型：官方教程；适合初学。
- [ROS2 Actions 官方教程源码](https://github.com/ros2/ros2_documentation/blob/4d73330f15b192bb412032427489147a27cc3dbd/source/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Actions/Understanding-ROS2-Actions.rst)：目标/反馈/结果结构、发送命令与取消演示。类型：官方教程；适合初学。
- [turtlesim 动作服务端实现](https://github.com/ros/ros_tutorials/blob/c83136eb8d0d3ed52eb0906183dd86ca309a4ed2/turtlesim/src/turtle.cpp)：速度命令中止旋转、取消处理与完成阈值。类型：官方代码；适合进阶核验。

本文没有新增论文条目，也没有把 ROS2 通信练习当作 VLA 论文复现。任务契约、验收表与扩展状态机为本仓库的工程设计建议。
