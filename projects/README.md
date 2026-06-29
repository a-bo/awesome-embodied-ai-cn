# Projects

这里整理具身智能相关开源项目、工具和仿真环境。优先收录能跑代码、能复现、能作为项目基础的资源。

## Robot Learning Frameworks

### LeRobot

- Link: https://github.com/huggingface/lerobot
- Type: end-to-end robot learning library
- Why it matters: Hugging Face 推出的机器人学习工具链，适合做数据、训练和部署实践。

### OpenVLA

- Link: https://github.com/openvla/openvla
- Type: open-source Vision-Language-Action model
- Why it matters: 适合学习 VLA 模型结构、微调和部署。

### Octo

- Link: https://github.com/octo-models/octo
- Type: open generalist robot policy
- Why it matters: 适合研究通用机器人策略和跨平台 fine-tuning。

### openpi

- Link: https://github.com/Physical-Intelligence/openpi
- Type: open-source VLA stack and checkpoints
- Why it matters: 提供 pi0、pi0-FAST、pi0.5 等模型和 DROID / ALOHA / LIBERO 相关示例，是理解和复现新一代 VLA 的直接入口。

## Simulation / Benchmark

### ManiSkill

- Link: https://github.com/haosulab/ManiSkill
- Type: robot manipulation benchmark and simulation environment
- Why it matters: 适合做机械臂操作、强化学习和模仿学习实验。

### Isaac Lab

- Link: https://github.com/isaac-sim/IsaacLab
- Type: GPU-accelerated robotics research framework
- Why it matters: 适合做大规模仿真、RL、模仿学习和 sim-to-real 工作流，补齐了当前列表在工业级仿真工具上的空白。

### robosuite

- Link: https://github.com/ARISE-Initiative/robosuite
- Type: robot simulation framework
- Why it matters: 常用机器人操作仿真环境，适合学习 manipulation 任务。

### robomimic

- Link: https://github.com/ARISE-Initiative/robomimic
- Type: imitation learning benchmark
- Why it matters: 适合做模仿学习算法和离线数据训练实验。

### LIBERO

- Link: https://github.com/Lifelong-Robot-Learning/LIBERO
- Type: lifelong robot learning benchmark
- Why it matters: 适合做持续学习、任务迁移和知识迁移实验。

### RoboCasa

- Link: https://robocasa.ai/
- Type: large-scale household manipulation benchmark
- Why it matters: 聚焦家庭场景操作任务，适合研究通用机器人在复杂 household 环境中的训练与评测。

## Suggested Starter Projects

### 1. Run a Robot Manipulation Demo

使用 ManiSkill 或 robosuite 跑通一个 pick-and-place 任务。

### 2. Fine-tune a Robot Policy

使用 LeRobot / OpenVLA / Octo / openpi 在公开数据集上做小规模微调。

### 3. Build a Robot Agent

把 LLM/VLM 用作任务规划器，输出机器人执行步骤，再由底层策略执行。

### 4. ROS2 + AI Robot Kit

用 ROS2 接入语音指令、视觉识别和基础导航，做一个 AI 机器人开发模板。
