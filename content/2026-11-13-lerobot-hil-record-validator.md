# 接管记录不能只写“人工纠正过”

一次 HIL 接管至少要回答：策略为什么暂停、人工何时接手、纠正意图是什么、这段数据能否进入后续审查。否则即使有视频，也很难区分真正的 recoverable correction、现场安全中止和操作噪声。

本周给 [LeRobot 人机接管纠错路线](../roadmap/lerobot-hil-correction-record.md) 加了一个可离线运行的 [纠错记录校验器](../roadmap/lerobot-hil-correction-record-validator.md)。它检查 `recording_mode`、状态、证据是否为空、常见 token 形态、连续时间线、policy → human 顺序、暂停 trigger、人工审查状态和完成态末段；并附完全合成的 `aborted / corrections_only` 样例与 10 个验收测试。

重点不是把 JSON “刷绿”。`VALID` 只说明这份合成记录符合小型结构契约；它不会打开视频、验证日志、连接 LeRobot 或判断真实硬件安全，更不会让机器人运动。真正进入训练前，仍需要现场授权、原始证据核对、脱敏和独立审查。

适合已有现场 HIL 流程、但想先把交接证据规范化的人。先保存一次诚实的 `blocked` 或 `aborted`，通常比补一条看似成功、却没有接管上下文的轨迹更有用。
