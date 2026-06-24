# 具身智能中文学习路线

这条路线面向希望从 AI / 软件开发进入具身智能和机器人方向的人。

## Stage 1: 基础能力

需要掌握：

- Python
- PyTorch
- 基础深度学习
- 计算机视觉
- 强化学习基础
- Linux / Git / Docker

建议目标：

```text
能读懂模型训练代码，能运行一个简单的 RL / imitation learning demo。
```

## Stage 2: 机器人基础

需要理解：

- 机器人坐标系
- 运动学
- 控制基础
- 传感器
- ROS / ROS2 基础
- 机械臂 / 移动机器人基本概念

建议目标：

```text
能理解机器人状态、动作空间、控制频率和仿真环境。
```

## Stage 3: 仿真环境

建议从这些项目入手：

- ManiSkill
- robosuite
- LIBERO
- Isaac Sim / Isaac Lab

建议目标：

```text
能跑通一个 pick-and-place 或 navigation demo。
```

## Stage 4: 模仿学习和强化学习

重点理解：

- Behavior Cloning
- Diffusion Policy
- Offline RL
- Imitation Learning
- Demonstration Data
- Evaluation Protocol

建议目标：

```text
能使用公开数据训练一个简单策略，并在仿真环境中评估。
```

## Stage 5: VLA / Robot Foundation Models

重点阅读：

- RT-1
- PaLM-E
- RT-2
- Open X-Embodiment
- OpenVLA
- Octo

建议目标：

```text
理解图像、语言和动作如何统一到一个机器人策略中。
```

## Stage 6: 项目实践

推荐项目：

### 1. Robot Paper Notes

整理具身智能论文笔记，按 VLA、Manipulation、Navigation、World Model 分类。

### 2. Robot Simulation Lab

基于 ManiSkill / robosuite 跑通多个机器人操作任务。

### 3. Robot Agent Lab

用 LLM 做任务规划，用机器人策略执行低层动作。

### 4. ROS2 AI Robot Kit

基于 ROS2 做一个 AI 机器人开发模板，接入视觉识别、语音指令和任务规划。

## 方向建议

如果你偏工程：

```text
ROS2 + AI / 仿真环境 / Robot Agent / 工程部署
```

如果你偏算法：

```text
VLA / Imitation Learning / Diffusion Policy / Sim2Real
```

如果你偏内容和开源：

```text
awesome-embodied-ai-cn / embodied-ai-paper-notes / robot-projects
```
