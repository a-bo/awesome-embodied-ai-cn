# 从 OpenVLA 到 pi0：2026 年最值得补的 5 个具身智能开源资源

## 选题定位

这篇内容适合发在 GitHub README 更新、公众号、即刻、知乎或 X 线程里。目标不是罗列名词，而是告诉读者：

- 现在补哪些 embodied AI 资源最值
- 每个资源分别补的是哪一块能力
- 中文开发者应该先读什么、先跑什么

## 标题

从 OpenVLA 到 pi0：2026 年最值得补的 5 个具身智能开源资源

## 开头

很多具身智能资源库的问题，不是条目太少，而是缺少“能跑、能复现、能拿来比较”的关键节点。  
如果只补论文标题，仓库很快会变成收藏夹；如果补的是模型、数据、仿真和 benchmark 之间的连接点，仓库才会变成真正的学习入口。

## 正文结构

### 1. Diffusion Policy

- 它补的是：现代机器人操作策略学习基线
- 为什么重要：帮助读者理解生成式 policy 为什么会成为 manipulation 里的主线之一
- 适合谁：想从 imitation learning 切入的人

### 2. openpi / pi0

- 它补的是：新一代 VLA 的开源工程入口
- 为什么重要：把“论文强”推进到“社区能复现和微调”
- 适合谁：想看 modern VLA、又不想只停留在论文摘要的人

### 3. DROID

- 它补的是：大规模真实世界机器人操作数据
- 为什么重要：很多 VLA 训练讨论最终都会回到数据规模和采集方式
- 适合谁：关心数据集和泛化能力的人

### 4. Isaac Lab

- 它补的是：现代 GPU 加速仿真与 research workflow
- 为什么重要：补齐 sim-to-real 和大规模训练工具链
- 适合谁：偏工程和仿真的开发者

### 5. RoboCasa

- 它补的是：家庭场景操作 benchmark
- 为什么重要：让资源库不只停留在 tabletop manipulation
- 适合谁：关心 household tasks 和 generalist robot benchmark 的读者

## 结尾

如果只想用两周快速入门，可以照这个顺序：

1. 读 `Diffusion Policy`
2. 看 `openpi / pi0`
3. 了解 `DROID`
4. 跑一个 `Isaac Lab` 或 `ManiSkill` 环境
5. 用一篇中文笔记把这些资源串起来

## 可复用短句

- 具身智能资源库最缺的不是标题数量，而是可复现路径。
- 从 OpenVLA 到 pi0，VLA 正在从“概念热点”变成“工程入口”。
- 没有数据集、仿真和 benchmark 的论文清单，很难支撑真正的学习路线。
