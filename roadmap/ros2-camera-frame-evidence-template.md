# ROS 2 感知—执行门禁：可审计 JSONL 证据模板

更新：2026-10-16。本文是对[相机坐标与时间戳检查路线](ros2-camera-frame-contract.md)的实用补充：把“没有触发运动的失败”保存成可检查的 JSONL 记录。它适合准备接入检测器、抓取规划或导航的 ROS 2 开发者。

**交付状态：这是数据结构、样例与验收模板，不是已经在 ROS 2、Gazebo、RViz 或真实机器人上运行的日志。下面的时间、坐标、哈希和状态码均为合成样例；不能据此宣称标定、TF、规划或硬件已验证。**

## 为什么要先存证据

一条“检测到目标”的日志不足以判断系统是否安全：它可能没有 `frame_id`，也可能把旧图像套用了当前 TF。把每次候选点的输入、查询参数和最终决定放在同一行，才能在更换相机、检测器或规划器后重放门禁判断。

JSONL（每行一个 JSON 对象）便于追加、过滤和脱敏；不要把完整图像、访问令牌、真实地图或人员信息直接写入该文件。图像可只记录不可逆的 `image_digest`，原始数据由项目自己的访问控制保存。

## 1. 最小事件契约

建议在感知节点输出候选点时写 `candidate_received`，在 TF 查询后写 `tf_gate`，在任何拒绝或交给规划器时写 `decision`。同一个 `event_id` 串起三条记录。

```json
{"event_id":"evt-20261016-0007","kind":"candidate_received","recorded_at":"2026-10-16T09:15:03Z","source_stamp":"2026-10-16T09:15:02.840Z","source_frame":"camera_color_optical_frame","image_digest":"sha256:example","label":"red_cup","score":0.91,"point_camera_m":[0.42,-0.08,0.71],"point_source":"depth"}
{"event_id":"evt-20261016-0007","kind":"tf_gate","recorded_at":"2026-10-16T09:15:03Z","target_frame":"base_link","source_frame":"camera_color_optical_frame","lookup_stamp":"2026-10-16T09:15:02.840Z","lookup_result":"ok","transform_age_ms":12}
{"event_id":"evt-20261016-0007","kind":"decision","recorded_at":"2026-10-16T09:15:03Z","decision":"candidate_only","point_base_m":[0.31,0.12,0.18],"motion_command_sent":false,"reason_code":"AWAIT_PLANNER_GATES"}
```

字段最小含义：

| 字段 | 规则 | 为什么 |
| --- | --- | --- |
| `source_stamp` | 来自图像/感知消息，不是写日志的当前时间 | TF 查询必须对应观测时刻 |
| `source_frame` | 非空且可追溯到消息 `header.frame_id` | 禁止把相机点静默当成 `base_link` 点 |
| `lookup_stamp` | 与 `source_stamp` 完全相同 | 发现“当前 TF 替代历史 TF” |
| `lookup_result` | `ok`、`unavailable`、`extrapolation` 或项目定义的有限枚举 | 让失败可统计、可测试 |
| `motion_command_sent` | 在候选阶段必须为 `false` | 防止诊断代码绕过规划与急停门禁 |

`CameraInfo` 的 optical frame 定义、TF2 的带时间 transform 以及 `tf2_tools` 的诊断范围，见原路线中的[官方来源清单](ros2-camera-frame-contract.md#7-一手来源与核验范围)。`view_frames` 能说明当前 frame tree，不应被记录为某个历史 `lookup_stamp` 成功的证据。

## 2. 四条拒绝样例：应记录，且绝不发运动

下面的合成样例覆盖最容易被“自动兜底”掩盖的问题。真实系统可增加 `robot_id`、发行版、节点版本和校准版本，但不要删除原始原因。

```json
{"event_id":"evt-frame-missing","kind":"decision","source_frame":"","decision":"reject_input","motion_command_sent":false,"reason_code":"FRAME_ID_MISSING"}
{"event_id":"evt-tf-old","kind":"tf_gate","source_stamp":"2026-10-16T09:00:00Z","lookup_stamp":"2026-10-16T09:00:00Z","lookup_result":"extrapolation","decision":"wait_or_reject","motion_command_sent":false,"reason_code":"TF_AT_SOURCE_TIME_UNAVAILABLE"}
{"event_id":"evt-no-depth","kind":"decision","label":"cup","point_camera_m":null,"decision":"reject_input","motion_command_sent":false,"reason_code":"THREED_POINT_UNAVAILABLE"}
{"event_id":"evt-outside-workspace","kind":"decision","point_base_m":[2.4,0.1,0.2],"decision":"candidate_rejected","motion_command_sent":false,"reason_code":"OUTSIDE_WORKSPACE"}
```

不要通过补一个默认 frame、把时间改成“现在”、给二维框硬填 z 值，或裁剪工作空间外的点来让样例“通过”。这些是应被显式拒绝的输入，不是成功路径。

## 3. 不控制机器人的离线检查

将样例保存为 `evidence/camera-gate.jsonl` 后，可用标准库只检查语义。不需要 ROS 2、相机、仿真器或机械臂：

```bash
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const rows = readFileSync('evidence/camera-gate.jsonl', 'utf8')
  .trim().split('\n').filter(Boolean).map(JSON.parse);
for (const row of rows) {
  if (row.kind === 'tf_gate' && row.source_stamp !== row.lookup_stamp) {
    throw new Error(`${row.event_id}: TF must use source_stamp`);
  }
  if (row.motion_command_sent !== false) {
    throw new Error(`${row.event_id}: gate evidence must not send motion`);
  }
}
console.log(`checked ${rows.length} evidence rows; no motion commands recorded`);
NODE
```

这只验证文本记录满足两条规则；它不验证 ROS 消息真的来自相机，也不验证 TF、碰撞检查或急停在运行时存在。要把离线检查接入 CI，应再为每个拒绝码写一条固定 fixture，并让运行节点在集成测试中生成同结构日志。

## 4. 本周验收表

| 项目 | 通过条件 | 本仓库本次状态 |
| --- | --- | --- |
| 契约 | 一条候选记录同时保留 source frame、source stamp 与最终决定 | 已提供模板与合成样例 |
| 时间门禁 | TF 查询记录使用同一 `source_stamp` | 已提供离线规则，未接入运行节点 |
| 安全边界 | 四类拒绝样例均 `motion_command_sent: false` | 已提供合成样例，未运行 |
| 运行证据 | 有真实 ROS 2/仿真/硬件日志及版本信息 | 未提供 |

下一步是在目标发行版和仿真/硬件驱动中生成第一份真实 JSONL，再把命令、环境、原始输出位置和失败样例对应起来。只有那时，才能把“模板已准备好”升级为“门禁在该环境中运行过”。