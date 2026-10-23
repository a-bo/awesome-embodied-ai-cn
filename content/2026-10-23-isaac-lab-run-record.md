# GPU 训练前，先让运行记录经得起追问

本周为 Isaac Lab 无界面预检补了一个很小但实用的后续：用零依赖 Node.js 校验 `run_id`、版本、GPU/driver、命令、退出码和日志证据是否齐全。

重点不是“校验器跑通了就等于 Isaac Lab 跑通”。随附样例刻意是 `E0 / blocked`：记录被阻塞也可以是有效产物，前提是后续的人能知道卡在什么地方、日志在哪里、没有偷偷把一次启动写成训练成功。

完整工具、字段说明和验收边界见：[Isaac Lab 运行记录校验器](../roadmap/isaac-lab-run-record-validator.md)。本次只运行了 Node.js 格式校验；没有安装 Isaac Lab、拉取镜像、运行仿真或训练策略。
