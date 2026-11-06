# 策略失手时，别只说“我接管了一下”

机器人策略快要偏离任务时，人工接管并不只是一次临场补救。它其实是未来训练数据、故障归因和安全审查的分岔点：接管前发生了什么、谁在控制、恢复了什么、为什么结束，决定了这段数据能不能被理解。

这次给 [Awesome Embodied AI CN](../README.md) 补了一条 [LeRobot 人机接管纠错记录路线](../roadmap/lerobot-hil-correction-record.md)。

它刻意把三个概念拆开：

- **暂停安全**：软件 pause 不是物理急停；有不确定就先停。
- **采集语义**：LeRobot 的 corrections-only 默认只记录人工纠错段；连续模式才会保留 autonomous 与人工段，不能混称“同一种示范”。
- **训练资格**：被人救回来的片段不天然是正样本。异常、遮挡、标定漂移和不完整时间线应先隔离、审查，而不是直接微调。

路线提供了 S0–S6 现场流程、segment 化 JSON 记录、模式选择表、硬件/teleoperator 前提、停止条件与训练前审查规则。核心是让每次 policy → human → policy 的交接都能回到原始日志和视频证据。

适合已经完成基本部署门禁、拥有兼容 robot 与 teleoperator 的小团队；不适合没有急停、现场隔离或配置身份不清的场地。文中的 LeRobot 命令与参数仅作官方资料的核对卡，**未在本仓库安装、运行或连接任何硬件**，也没有产生训练数据、rollout、成功率或性能结论。

一手来源包括官方 [HIL data collection](https://huggingface.co/docs/lerobot/main/hil_data_collection)、[policy rollout](https://huggingface.co/docs/lerobot/main/inference)、[Robots API](https://huggingface.co/docs/lerobot/main/api/robots) 与 [LeRobot source](https://github.com/huggingface/lerobot)。实际执行前请固定目标 release，并让拥有现场权限的人重新核对 CLI 帮助、硬件与安全流程。