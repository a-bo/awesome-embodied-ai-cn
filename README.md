# Awesome Embodied AI CN

> 中文具身智能资源库：论文、课程、开源项目、数据集、仿真环境、机器人平台和学习路线。

具身智能正在从“大模型会说话”走向“大模型能行动”。这个仓库关注机器人智能系统中的关键问题：

- 如何让机器人理解视觉、语言和任务目标
- 如何把 VLM / LLM 扩展成 VLA / Robot Policy
- 如何用仿真环境、数据集和机器人平台训练可泛化策略
- 如何从论文、开源项目和工程实践进入具身智能方向

## 适合谁

- 想入门具身智能 / 机器人学习的开发者
- 想做 VLA、Robot Agent、ROS2 + AI 项目的工程师
- 想做具身智能方向论文阅读和项目复现的学生
- 关注机器人、仿真、模仿学习、强化学习和大模型结合的人

## 快速入口

| 分类 | 内容 |
| --- | --- |
| [学习路线](roadmap/embodied-ai-roadmap-cn.md) | 从 AI 基础到具身智能项目实践 |
| [论文](papers/README.md) | VLA、Manipulation、Navigation、World Model 等方向 |
| [开源项目](projects/README.md) | LeRobot、OpenVLA、Octo、SmolVLA、ManiSkill 等 |
| [数据集](datasets/README.md) | Open X-Embodiment、BridgeData V2、LIBERO 等 |
| [课程](courses/README.md) | 机器人学习、深度强化学习、具身 AI 相关课程 |
| [中文导读](notes/README.md) | RT-1、RT-2、Open X、OpenVLA、Octo、pi0、SmolVLA、Embodied-R1.5 中文笔记 |
| [内容选题：低成本路线](content/act-mobile-aloha-smolvla-outline.md) | 一篇聚焦低成本具身智能复现路线的内容大纲 |
| [内容选题：闭环智能](content/openvla-pi0-embodied-r1-5-outline.md) | 一篇聚焦具身智能从动作预测走向闭环纠错的大纲 |

## 方向地图

```text
Embodied AI
├── Vision-Language-Action
├── Robot Learning
├── Imitation Learning
├── Reinforcement Learning
├── Manipulation
├── Navigation
├── Simulation
├── Sim2Real
├── ROS / ROS2
└── Robot Agent
```

## 推荐入门顺序

1. 先理解具身智能是什么，以及它和 LLM / VLM 的区别。
2. 阅读 RT-1、RT-2、PaLM-E、Open X-Embodiment、OpenVLA、Octo 等代表工作。
3. 跑通一个仿真环境，例如 ManiSkill、robosuite、LIBERO。
4. 使用 LeRobot 或 OpenVLA 体验端到端机器人学习流程。
5. 选择一个小项目：机械臂抓取、桌面物体操作、导航、机器人指令理解。

## 第一批重点资源

### 论文 / 模型

- RT-1: Robotics Transformer for Real-World Control at Scale
- PaLM-E: An Embodied Multimodal Language Model
- RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control
- Open X-Embodiment: Robotic Learning Datasets and RT-X Models
- OpenVLA: An Open-Source Vision-Language-Action Model
- Octo: An Open-Source Generalist Robot Policy
- VIMA: General Robot Manipulation with Multimodal Prompts
- ACT: Action Chunking with Transformers
- Diffusion Policy: Visuomotor Policy Learning via Action Diffusion
- pi0: A Vision-Language-Action Flow Model for General Robot Control
- SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics
- Embodied-R1.5: Evolving Physical Intelligence via Embodied Foundation Models
- Embodied.cpp: A Portable Inference Runtime of Embodied AI Models on Heterogeneous Robots
- Uni-LaViRA: Language-Vision-Robot Actions Translation for Unified Embodied Navigation

### 开源项目 / 工具

- [LeRobot](https://github.com/huggingface/lerobot)
- [OpenVLA](https://github.com/openvla/openvla)
- [Octo](https://github.com/octo-models/octo)
- [robosuite](https://github.com/ARISE-Initiative/robosuite)
- [robomimic](https://github.com/ARISE-Initiative/robomimic)
- [ManiSkill](https://github.com/haosulab/ManiSkill)
- [LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [openpi](https://github.com/Physical-Intelligence/openpi)
- [SmolVLA](https://huggingface.co/blog/smolvla)
- [AhaRobot](https://aha-robot.github.io/)
- [Isaac Lab](https://github.com/isaac-sim/IsaacLab)
- [Mobile ALOHA](https://mobile-aloha.github.io/)
- [NVIDIA Isaac GR00T](https://developer.nvidia.com/isaac/gr00t)
- [RoboCasa](https://robocasa.ai/)

## 本周新增

- 新增论文：ACT、SmolVLA、Embodied-R1.5、Embodied.cpp、Uni-LaViRA
- 新增项目：SmolVLA、Mobile ALOHA、NVIDIA Isaac GR00T、AhaRobot、EmbodiedEvalKit
- 新增数据集：AgiBot World、SABER、Embodied-R1.5 Datasets
- 新增课程：MIT Underactuated Robotics、MIT Robotic Manipulation
- 新增中文导读：[SmolVLA](notes/smolvla-cn.md)、[Embodied-R1.5](notes/embodied-r1.5-cn.md)
- 新增内容选题：[从 ACT、Mobile ALOHA 到 SmolVLA](content/act-mobile-aloha-smolvla-outline.md)、[从 OpenVLA、pi0 到 Embodied-R1.5](content/openvla-pi0-embodied-r1-5-outline.md)

## 后续计划

- 整理 100+ 具身智能资源
- 增加中文论文导读
- 增加复现难度和硬件需求标注
- 增加 ROS2 + AI 项目路线
- 增加机器人 Agent 项目案例

## 贡献

欢迎提交新的论文、课程、开源项目、数据集和复现笔记。

请优先补充：

- 资源链接
- 一句话说明
- 适合人群
- 难度
- 是否有代码 / 数据 / demo

贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
