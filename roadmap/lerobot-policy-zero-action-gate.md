# LeRobot 真机策略部署前的“零动作”验收路线

> 面向准备把已有策略接到真实机械臂的开发者：先证明设备、观察和策略契约可追溯，再允许第一次受控动作。本页是准备与验收路线，不是可直接操作机器人的教程；其中命令均未在本仓库执行。

LeRobot 将控制设备抽象为读取 observation、发送 action 的 Robot 接口；部署入口是 `lerobot-rollout`。这意味着“能加载 checkpoint”并不等于“可以让真实机器人动”：机器人类型、端口、相机键、标定、任务语义与策略期望都要能对上。

## 适用人群与边界

适合：

- 已有 LeRobot 支持的 follower robot、相机和一个可访问 policy checkpoint 的个人或小团队；
- 能在断电、清空工作区、有人在旁监控的情况下做首次部署；
- 想把一次真机试验记录成可复查证据，而不是只保存终端截图的人。

不适合：

- 没有物理急停、工作区隔离或能安全断开执行器的环境；
- 不清楚机械臂负载、关节范围或夹爪行为时；
- 试图把别人的 checkpoint 直接用于不同机器人、相机布局或任务。

硬件、接线、负载、碰撞和急停由现场负责人决定；软件的 `pause` / position hold 不能替代物理安全措施。官方部署文档也明确要求在真实机械臂上验证加载臂和夹爪的行为。

## 官方资料与版本选择

本路线只依据 LeRobot 一手资料，实际执行前应重新打开并锁定所用 release 的页面：

- [Policy deployment / `lerobot-rollout`](https://huggingface.co/docs/lerobot/main/inference)：真实机器人策略部署、策略模式、暂停及 cadence 报告。
- [Robots API](https://huggingface.co/docs/lerobot/main/api/robots)：`connect → get_observation → send_action → disconnect` 的硬件抽象。
- [Imitation learning on real-world robots](https://huggingface.co/docs/lerobot/main/il_robots)：数据采集、训练与评估的整体链路。
- [Human-in-the-loop data collection](https://huggingface.co/docs/lerobot/main/hil_data_collection)：人工接管、恢复与 correction 记录的前提。
- [LeRobot source repository](https://github.com/huggingface/lerobot)：release、硬件支持与变更的最终代码来源。

不要把本文的参数名当成长期稳定 API；先运行目标版本的 `lerobot-rollout --help`，并把输出、commit/release 和 Python 环境一起写入记录。

## 首次部署的最小门禁

将每个阶段的结论写为 `pass`、`blocked` 或 `not_run`。未达到 `pass` 时，不进入下一阶段。

| 阶段 | 要回答的问题 | 最小证据 | 失败时的动作 |
| --- | --- | --- | --- |
| R0 现场 | 谁能急停、工作区是否清空、起始姿态是否可恢复？ | 现场负责人、急停检查时间、无遮挡照片/文字记录 | 标记 `blocked`，不接电或不使能 |
| R1 身份 | checkpoint、LeRobot 版本、robot type、端口和相机键是否明确？ | release/commit、policy path、设备映射、相机配置 | 只修正配置，不尝试 rollout |
| R2 硬件 | robot/teleoperator 是否能连接且已校准？ | 校准 ID、连接日志、固件/端口记录 | 断开后排查，不发送策略 action |
| R3 观察 | observation 的相机键、分辨率、FPS 与策略所需输入是否一致？ | 一次静态 observation 清单与时间戳 | 重新配置相机或换兼容 checkpoint |
| R4 策略 | checkpoint 的任务、训练数据、机器人与当前任务是否有已知匹配依据？ | 模型卡/训练记录、任务文本、未知项清单 | 保留 `unknown`，不以“可加载”推断可执行 |
| R5 首动 | 受限时长、低风险姿态、人在急停旁的单次尝试是否记录完整？ | 命令、开始/结束时间、cadence、退出码、异常与人工判断 | 任一异常立刻停止，保留原始日志 |

R2 与 R3 是“零动作”阶段：设备连接或读取 observation 不授权发送策略 action。R5 也不等于成功完成任务；它只说明一次受控尝试留下了足够证据。

## 一份可复查的部署记录

每次尝试建立一个 JSON 或 Markdown 记录，最少包含：

```json
{
  "attempt_id": "2026-11-02T0900Z-so101-pick-v1",
  "status": "blocked",
  "release_or_commit": "unknown",
  "policy": {"path": "owner/checkpoint", "revision": "unknown"},
  "robot": {"type": "so101_follower", "port": "redacted", "calibration_id": "unknown"},
  "cameras": [{"key": "top", "resolution": "unknown", "fps": "unknown"}],
  "task": "将积木放入盒中",
  "gates": {
    "R0": "pass",
    "R1": "pass",
    "R2": "not_run",
    "R3": "not_run",
    "R4": "blocked",
    "R5": "not_run"
  },
  "stop_reason": "checkpoint 与当前相机/任务的匹配关系尚无证据",
  "evidence": ["terminal-log-path-or-redacted-note"]
}
```

不要记录串口完整路径、家庭/实验室地址、视频中不应公开的人脸或设备密钥。若日志要公开，先做脱敏并保留原始私有副本。

## 命令只作核对模板

官方示例以 `lerobot-rollout` 传入策略、robot、port、camera、task 与 duration。以下不是建议直接复制运行的命令，而是一张字段核对卡：

```bash
lerobot-rollout \
  --strategy.type=base \
  --policy.path=OWNER_OR_LOCAL_POLICY \
  --robot.type=TARGET_FOLLOWER \
  --robot.port=REDACTED_OR_CONFIRMED_PORT \
  --robot.cameras='{"camera_key": {"type": "opencv", "index_or_path": "CONFIRMED_DEVICE", "width": 0, "height": 0, "fps": 0}}' \
  --task="CONFIRMED_TASK" \
  --duration=CONFIRMED_SECONDS
```

在填上任何真实值前逐项复核：

1. `camera_key` 与 policy/checkpoint 期望键完全相同，而非“画面看起来类似”。
2. 目标版本的 CLI 确实接受所填 flag；命令帮助文本已存档。
3. `duration` 是预先批准的短窗口，不是默认无限运行。
4. 执行者、旁站人员和急停位置已记入 R0。
5. 输出日志、cadence 摘要、退出码和人工观察有明确保存位置。

## 人工接管不是事后补救

如果计划使用 human-in-the-loop / DAgger，先确认 teleoperator 能以程序方式使能/禁用扭矩并到达目标位置；这是官方文档列出的前提。键盘暂停、人工接管、恢复和终止应当事先演练，并把每段 autonomous / intervention 片段与原因记录下来。

遇到以下任何一种情况，应停止而非“再试一次”：

- camera key、分辨率、帧率或时间来源不明确；
- checkpoint 的机器人、任务或训练数据匹配关系只靠猜测；
- 标定失败、端口漂移、读数异常或关节/夹爪行为非预期；
- cadence 明显低于目标且没有分析原因；
- 操作者无法确认物理急停可用，或工作区出现人/障碍物。

## 验收标准与声明边界

| 项目 | 可以据此声明 | 不能据此声明 |
| --- | --- | --- |
| R0–R4 完整为 pass | 已完成部署前配置/观察门禁 | 策略已在真机成功 |
| R5 有命令、日志、cadence 与人工记录 | 完成一次受控尝试 | 已达成任务成功率或可复现表现 |
| 多次带明确成功判据的试验 | 有对应条件下的观测结果 | 可泛化到别的桌面、相机、物体或机器人 |
| 本文档 | 有一份可执行的准备路线 | 已安装 LeRobot、连上设备或运行任何策略 |

## 下一步

先在不发送 action 的前提下完成 R0–R4，并只记录事实与未知项。若现场负责人批准 R5，使用一项低风险、可停止、可复位的任务，保存原始日志和失败原因。之后再决定是否值得引入远程推理、实时 action chunk 或 human-in-the-loop；这些是性能/连续性优化，不是绕过基础门禁的理由。
