# LeRobot 人机接管纠错：把一次“暂停”变成可训练的证据

> 面向已有 LeRobot 支持的机器人、teleoperator 与策略 checkpoint 的实践者：在策略出现失误征兆时，先安全暂停、人工恢复并记录纠错段，再决定是否把数据用于微调。本页是可执行的记录与审查路线；所有命令均未在本仓库或真实机器人上运行。

零动作部署门禁解决“能否开始第一次受控尝试”；本页处理另一个问题：**一次策略尝试中，人工何时接管、接管前后发生了什么、哪些片段可以被训练使用？** 把“我手动救了一下”留在口头说明里，后续很难判断失败模式、数据边界和训练来源。

LeRobot 的 DAgger / human-in-the-loop（HIL）流程允许 policy 与人工在同一 episode 内交替；默认 corrections-only 只记录人工纠错窗口，而连续记录模式还能保留 autonomous 段。两种模式产生的数据语义不同，不能混写成“同样的示范”。

## 适用人群、环境与硬件

适合：

- 已完成机器人现场、身份、标定与静态 observation 的部署前门禁；
- 有兼容的 follower robot、相机、可暂停的 policy rollout，以及可明确职责的现场操作者；
- 使用能由程序使能/禁用扭矩并能与机器人对齐的 teleoperator，例如官方列出的 SO-100/SO-101 leader 或 bi_openarm_mini；
- 愿意把每次 intervention 的触发、动作和结果写成可审查记录的人。

不适合：

- 没有物理急停、工作区隔离、旁站人员或明确停止权的场地；
- checkpoint、相机键、机器人型号或 calibration 身份尚不清楚；
- 把 HIL 数据采集理解为可跳过部署验证或替代硬件安全评审。

软件的 pause / position hold 不是物理急停，也不保证夹爪保持或机械臂绝对静止。先遵循机器人厂商、现场负责人和 LeRobot 目标版本的安全说明。

## 一手资料与版本固定

执行前请锁定 LeRobot release/commit，并重新核对下列一手资料，而不是照抄本文参数：

- [Human-in-the-loop data collection](https://huggingface.co/docs/lerobot/main/hil_data_collection)：接管顺序、corrections-only 与连续记录、teleoperator 要求。
- [Policy inference and rollout](https://huggingface.co/docs/lerobot/main/inference)：`lerobot-rollout` 的 DAgger 模式、键盘/脚踏输入与暂停语义。
- [Robots API](https://huggingface.co/docs/lerobot/main/api/robots)：observation / action 的硬件接口边界。
- [LeRobot dataset v3](https://github.com/huggingface/lerobot/blob/main/docs/source/lerobot-dataset-v3.mdx)：episode、元数据与视频的格式背景。
- [LeRobot source](https://github.com/huggingface/lerobot)：release、支持设备与当前实现。

先保存 `lerobot-rollout --help`、Python / LeRobot 版本、policy revision、robot / teleoperator type 和相机配置。本文不保证 main 分支参数在目标版本中仍相同。

## 两种采集模式，先选清楚再开始

| 模式 | 记录什么 | 适合回答的问题 | 不应据此声称 |
| --- | --- | --- | --- |
| corrections-only（默认） | 人工 recovery / correction，每段通常成为独立 episode | 人在何种失败迹象下如何纠正 | policy 全程表现、完整自主轨迹 |
| continuous（`record_autonomous=true`） | policy 与人工片段在同一连续轨迹中交替 | 接管前后状态与纠错的关系 | 该轨迹天然就是“成功示范” |
| 不记录，仅排练暂停 | 不产生训练数据 | 急停、交接、站位是否可理解 | 已采集可训练数据 |

每一条记录必须写 `recording_mode`。没有它，后续审阅者无法判断缺失的 autonomous 段是刻意省略还是日志丢失。

## 最小现场流程：先停，再判断，再记录

以下是必须由现场负责人批准的**流程卡**，不是可直接执行的机器人命令。

1. **S0：开场核对。** 确认急停、旁站人、工作区、policy revision、robot / teleoperator identity、camera keys 与保存目录；缺一项即为 `blocked`。
2. **S1：只读观察。** 在不发送新策略 action 的前提下，确认 observation 有效、画面和任务语义一致，并记录开始时间与基线姿态。
3. **S2：受控 autonomous 段。** 仅在既有部署门禁通过后开始短窗口；操作者持续观察，不把“正在运行”记成成功。
4. **S3：暂停与接管。** 任何接近碰撞、目标脱离视野、非预期关节/夹爪行为、控制频率异常或操作者不确定时，先暂停；记录触发原因，再把控制权交给人工。不要为了“收集更多数据”延迟停止。
5. **S4：恢复与纠正。** 人工将机器人恢复到明确状态并完成必要纠正；记录纠正的起止、意图和是否出现二次异常。若无法安全恢复，结束 episode 并记录 `aborted`。
6. **S5：交还或结束。** 只有现场负责人认可且当前状态可解释时才交还 policy；否则结束、保存证据、断开设备。停止不是失败的掩饰，而是一次有效结果。
7. **S6：离线审查。** 在训练前由另一位审查者核对视频、状态/action、干预标签、时间线与隐私脱敏；不通过就隔离，不混入训练集。

官方 HIL 说明指出，暂停时 leader 会与 robot 对齐，以降低交接跳变进入纠错数据的风险；这不等于免除对真实设备的验证。每次接管都应仍以现场安全为准。

## 一条最小 intervention 记录

将操作日志、视频路径和本记录存为同一个 attempt 的不可变附件。串口路径、地址、可识别影像、token 和私有数据集 ID 不应直接公开。

```json
{
  "attempt_id": "2026-11-06T0930Z-so101-block-v1",
  "status": "aborted",
  "recording_mode": "corrections_only",
  "release_or_commit": "to-be-pinned",
  "policy": {"path": "redacted-or-reference", "revision": "to-be-pinned"},
  "hardware": {
    "robot_type": "so101_follower",
    "teleoperator_type": "so101_leader",
    "calibration_id": "recorded-privately",
    "camera_keys": ["top"]
  },
  "task": "将积木放入容器",
  "segments": [
    {
      "segment_id": "s01",
      "controller": "policy",
      "started_at": "2026-11-06T09:30:10Z",
      "ended_at": "2026-11-06T09:30:18Z",
      "outcome": "paused",
      "trigger": "object_left_camera_view"
    },
    {
      "segment_id": "s02",
      "controller": "human",
      "started_at": "2026-11-06T09:30:18Z",
      "ended_at": "2026-11-06T09:30:31Z",
      "outcome": "aborted",
      "correction_intent": "restore_safe_pose",
      "review_state": "exclude_pending_review"
    }
  ],
  "evidence": ["redacted-log-path", "private-video-reference"],
  "stop_reason": "target visibility could not be confirmed"
}
```

字段规则：

- `controller` 只能是 `policy` 或 `human`；不能用“自动/手动”这种模糊自由文本替代。
- 每次 controller 切换都要有相邻时间边界、触发原因和人工判断；时间未知时标 `unknown`，不要补写。
- `review_state` 与任务结果分开：一次成功恢复不自动代表该片段适合训练。
- `status: aborted`、`blocked` 与 `not_run` 都是有效记录值；比伪造 success 更有价值。
- 训练集的 episode ID、数据集 revision 与此 attempt 必须能回链；否则只可当现场笔记，不能当可复盘训练证据。

## 可复现实操步骤与停止条件

如果目标环境、版本和现场授权都明确，可按下表完成一次**由现场执行者自行验证**的最小尝试：

| 步骤 | 执行者应留下的证据 | 立刻停止的条件 |
| --- | --- | --- |
| 固定版本与配置 | release/commit、policy revision、CLI help、robot / camera / teleoperator 映射 | 任一身份或参数只靠推测 |
| 排练 pause / handover | 旁站记录、低风险姿态、停止流程确认 | 急停不可用或交接动作非预期 |
| 短 autonomous 窗口 | 起止时间、cadence、观察者判断 | 视野丢失、异常动作、频率异常、操作者不确定 |
| human recovery | intervention 开始/结束、意图、视频/日志引用 | 恢复路径不能解释或出现二次风险 |
| 结束后离线审查 | 数据集 revision、segment 标签、审查结论 | 时间线、标签或隐私处理不完整 |
| 决定是否训练 | 进入 / 隔离 / 排除清单及理由 | 把未审查片段默认加入训练 |

不要在本页给出的占位信息上直接补真实端口后运行。应先用目标版本的官方帮助文本和受控环境逐项替换，并由拥有现场权限的人批准。

## 训练数据审查：纠正不等于正样本

建议将每个 human 段分为：

- **recoverable correction**：失败原因明确、恢复路径可解释、传感器和动作证据齐全；
- **ambiguous**：发生了接管，但触发或状态缺失；只保留调查，不进入训练；
- **safety abort**：因安全或设备异常终止；保留事故/运维证据，默认排除；
- **operator artifact**：误触、遮挡、通信抖动或标定漂移导致；先修环境，不把噪声教给 policy。

训练前抽查每类的原始证据和比例，并将规则写入数据集卡。仅从 HIL 记录中看见 human intervention，不能推出策略性能提升、泛化或安全性。

## 验收与声明边界

| 已有证据 | 可以说明 | 不能说明 |
| --- | --- | --- |
| S0–S1 记录完整 | 已准备一份 HIL 前置清单 | 已完成真机 rollout |
| 有 segment 化、可回链的人工记录 | 交接过程可被审查 | 数据已经适合训练 |
| 多次按预先定义协议审查的数据 | 在该协议下有可追溯数据 | policy 已提升或泛化 |
| 本文档 | 有一条 HIL 纠错记录路线 | 已安装 LeRobot、接通硬件或执行任何命令 |

## 下一步

先将这份 schema 用在一次不产生训练数据的暂停/接管排练中，由现场负责人确认风险边界；再做一个短、低风险、可中止的 HIL 尝试。只有在原始记录、标签和审查结论都齐全时，才把明确通过的 episode 送入后续训练/微调流程。