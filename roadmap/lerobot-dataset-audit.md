# 训练之前先审计数据：LeRobot 数据集检查路线

更新：2026-10-08。面向准备使用 LeRobot 数据集训练、微调或评估机器人策略的开发者。

**交付状态：这是基于 LeRobot 官方仓库文档核验的训练前数据审计路线，不是本仓库已经下载、可视化或训练成功的复现记录。本文没有安装 LeRobot、下载数据集、打开可视化器或运行训练。所有命令和检查结果均须由实际执行者在自己的环境中验证。**

训练失败时，问题常常不在模型，而在数据是否可用：相机流是否和动作同步、任务文字是否与视频一致、失败轨迹是否混进训练集、动作量纲是否匹配机器人。本路线把这些问题前置到一次只读审计中。它先用浏览器检查公开数据，再在本地用官方工具复查单个 episode；确认数据、许可证与硬件边界后，才值得投入训练资源。

## 1. 先选一个低风险的审计对象

推荐从官方文档示例 `lerobot/pusht` 或 `lerobot/svla_so101_pickplace` 的公开 episode 开始。前者适合熟悉工具，后者可在浏览器中同时观察相机、任务文字、状态和动作。不要把“能看到视频”误认为数据可以直接训练：你仍需检查动作定义、episode 覆盖范围和许可证。

本路线不要求实体机器人；浏览器检查只需现代浏览器和网络。若使用本地可视化，运行 LeRobot 的 Python 环境与图形查看器是额外要求。若后续要把轨迹回放到机器人上，则需要**同型号且已校准的硬件**；仅凭本路线不能推断某条轨迹可安全回放到别的机械臂。

## 2. 浏览器做第一轮：看一条轨迹是否自洽

打开 [LeRobot Dataset Visualizer](https://huggingface.co/spaces/lerobot/visualize_dataset)，输入数据集 ID，再选择一个 episode。也可以把数据集 ID 与 episode 编号放进可分享 URL，例如：

```text
https://huggingface.co/spaces/lerobot/visualize_dataset?path=/lerobot/svla_so101_pickplace/episode_0
```

按下表逐项记录；任何一项不清楚，都把该数据集标为“待核验”，而不是直接训练。

| 检查项 | 要看什么 | 通过的最小证据 | 常见误判 |
| --- | --- | --- | --- |
| 任务语义 | 语言指令和视频是否描述同一件事 | 指令、起点、目标物和结束状态一致 | 只凭标题判断任务 |
| 同步性 | 视频变化是否能与 state/action 曲线对应 | 选取一个明显动作，曲线在相近时间变化 | 把不同摄像头的延迟当成控制失效 |
| 动作空间 | action 的维度、单位、关节顺序 | 记录 feature 名称、shape、范围和机器人型号 | 假设两个“6 DoF”机械臂可互换 |
| 结束与失败 | 是否有掉落、遮挡、碰撞或半途停止 | 为每个 episode 标记成功、失败或不确定 | 把每条示范都当成成功样本 |
| 覆盖范围 | 物体、背景、起始姿态和指令是否过于单一 | 至少列出可见变化与缺失变化 | 用单一场景宣称泛化 |

可视化器能同步展示多路相机、任务文字、状态与动作曲线；官方文档也说明 v3.0 数据集可在支持的机器人上进行 3D replay。3D 动画是记录的关节状态可视化，不是碰撞安全或真机复现证明。

## 3. 本地做第二轮：只检查，不改数据

在已按 LeRobot 官方安装说明准备好的环境中，对一个公开数据集执行：

```bash
lerobot-dataset-viz   --repo-id lerobot/pusht   --episode-index 0
```

预期是本地查看器打开并显示该 episode 的相机流、state 与 action；这不是本仓库的执行结果。若数据集位于本地目录，官方工具支持添加 `--root` 与 `--mode local`；私有或 gated 数据需要先通过 `hf auth login` 或 `HF_TOKEN` 完成访问授权。

初次检查不要运行会改写、删除或上传数据集的命令。官方编辑工具的 `info` 操作可先打印数据集摘要与 feature：

```bash
lerobot-edit-dataset   --repo_id lerobot/pusht_image   --operation.type info   --operation.show_features true
```

把输出保存到实验目录，并和数据集 revision、工具版本、命令、日期一同记录。不要使用 `--push_to_hub true`，除非你确认目标仓库、权限与副本策略；审计阶段的目标是产生证据，不是修改原始数据。

## 4. v2.1 与 v3.0 不能混为一谈

LeRobot v3.0 将多个 episode 放入分块 Parquet/MP4 文件，并以 `meta/episodes` 等元数据定位边界；旧 v2.1 则常见“一条 episode 一组文件”的布局。不要用文件名推断 v3.0 的 episode 边界，也不要把 v2.1 脚本直接套到 v3.0 数据集上。

若你维护旧数据，官方提供 v2.1 到 v3.0 的转换脚本，但转换是数据变更操作，应先在副本上做，并比较 episode 数、帧数、任务表和可视化结果。大数据集还可能有大量存储与计算需求；例如官方 DROID 迁移文档把 2 TB 存储和集群访问列为前提之一。本文不提供容量或耗时承诺。

## 5. 训练前门禁：没有证据就不启动长任务

以下清单可作为一次小规模训练前的门禁。全部通过并不保证策略会成功，但任一关键项缺失时，先补数据理解而不是增加 GPU 时长。

| 门禁 | 必须留下的证据 | 未通过时动作 |
| --- | --- | --- |
| 格式与版本 | 数据集 ID、revision、LeRobot 版本、v2.1/v3.0 判断 | 固定版本或隔离转换副本 |
| 数据可读 | 至少一个 episode 的浏览器或本地查看截图/日志 | 检查权限、网络、视频 codec、metadata |
| 语义抽检 | 至少 10 条轨迹的成功/失败/不确定标注 | 剔除、分层或单独报告失败数据 |
| 动作兼容 | action feature、单位、控制频率、目标机器人说明 | 不训练或添加明确适配层与安全审查 |
| 划分泄漏 | train/validation/test 的任务、场景、episode 规则 | 重做切分并记录规则 |
| 权限与许可证 | 数据集卡、license、访问限制与派生发布计划 | 联系维护者或改用合规数据 |
| 可复盘性 | 命令、配置、随机种子、输出位置 | 把它们写入实验记录再开始 |

**停止条件：** 发现动作单位未知、任务标签和视频矛盾、机器人型号不明、数据许可证不清楚，或无法确认训练/评测切分时，停止训练。不要以“模型能收敛”替代这些基础证据。

## 6. 从审计到最小训练的边界

通过审计后，下一步是挑选少量已标注的 episode，固定数据 revision 和训练配置，先跑一个短任务并只报告可复核的 loss、样本数和评测协议。不要把离线 loss 下降表述为机器人任务成功；真机或仿真成功需要独立的执行日志、环境版本、任务成功判定和失败样本。

本仓库的数据集清单可用于选择方向，开源项目清单提供 LeRobot 与仿真工具入口。若准备做真实机器人，先阅读对应硬件的官方安全、校准与急停说明；本文不构成操作安全指南。

## 7. 一手来源与核验范围

以下链接均为 2026-10-08 查阅的 LeRobot 官方仓库或官方 Hugging Face 文档：

- [Using Dataset Tools](https://github.com/huggingface/lerobot/blob/main/docs/source/using_dataset_tools.mdx)：浏览器与本地可视化、`lerobot-dataset-viz`、只读 `info` 操作、私有数据认证。适合首次审计。
- [LeRobotDataset v3.0](https://github.com/huggingface/lerobot/blob/main/docs/source/lerobot-dataset-v3.mdx)：v3.0 的文件组织、元数据与视频约束。适合需要判断格式或迁移的人。
- [Porting Large Datasets to LeRobot Dataset v3.0](https://github.com/huggingface/lerobot/blob/main/docs/source/porting_datasets_v3.mdx)：v2.1/v3.0 差异、转换脚本及大数据集前提。适合维护旧数据的人。
- [官方数据集加载示例](https://github.com/huggingface/lerobot/blob/main/examples/dataset/load_lerobot_dataset.py)：`LeRobotDataset` 元数据、指定 episode 与帧数的读取方式。适合准备写审计脚本的人。

链接指向持续演进的官方 `main` 分支，因此具体命令、数据集格式和兼容性可能更新。执行前请在目标 revision 的文档中复核参数；本文没有声称任何数据集、环境或真机已由本仓库运行成功。
