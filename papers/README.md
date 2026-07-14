# Papers

这里整理具身智能和机器人学习方向的重要论文。建议按时间线理解：从机器人 Transformer，到 VLM/VLA，再到跨机器人数据和通用策略。

## Vision-Language-Action

### RT-1: Robotics Transformer for Real-World Control at Scale

- Link: https://arxiv.org/abs/2212.06817
- Topic: Robot Transformer, large-scale real-world robot control
- Why it matters: 把 Transformer 用在真实机器人控制中，是理解后续 RT-2 / RT-X 的基础。

### PaLM-E: An Embodied Multimodal Language Model

- Link: https://arxiv.org/abs/2303.03378
- Topic: Embodied multimodal language model
- Why it matters: 将语言、视觉和具身任务结合起来，是 LLM 进入机器人任务的重要代表。

### RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control

- Link: https://arxiv.org/abs/2307.15818
- Topic: VLA, web-scale knowledge transfer, robot control
- Why it matters: 代表 VLM 到 VLA 的关键路线，将网络知识迁移到机器人控制。

### OpenVLA: An Open-Source Vision-Language-Action Model

- Link: https://arxiv.org/abs/2406.09246
- Code: https://github.com/openvla/openvla
- Topic: open-source VLA, robot manipulation
- Why it matters: 开源 VLA 代表工作之一，适合做复现和微调实验。

### SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics

- Link: https://arxiv.org/abs/2506.01844
- Project: https://huggingface.co/blog/smolvla
- Topic: lightweight VLA, efficient robotics, community-scale reproduction
- Why it matters: 比大型 VLA 更强调低成本和高效率，适合作为个人开发者和小团队进入具身智能实践的新入口。

### pi0: A Vision-Language-Action Flow Model for General Robot Control

- Link: https://arxiv.org/abs/2410.24164
- Code: https://github.com/Physical-Intelligence/openpi
- Topic: VLA, flow matching, general robot control
- Why it matters: 代表新一代 VLA 路线，兼具论文价值和开源工程入口，适合连接模型理解、微调和真实机器人实践。

## Generalist Robot Policy

### Open X-Embodiment: Robotic Learning Datasets and RT-X Models

- Link: https://arxiv.org/abs/2310.08864
- Project: https://robotics-transformer-x.github.io
- Topic: cross-embodiment robot dataset, RT-X
- Why it matters: 提出跨机器人数据和策略训练，是通用机器人策略的重要基础。

### Octo: An Open-Source Generalist Robot Policy

- Link: https://arxiv.org/abs/2405.12213
- Code: https://github.com/octo-models/octo
- Topic: open generalist robot policy
- Why it matters: 开源通用机器人策略，适合研究微调和跨平台泛化。

## Multimodal Prompting

### VIMA: General Robot Manipulation with Multimodal Prompts

- Link: https://arxiv.org/abs/2210.03094
- Project: https://vimalabs.github.io
- Topic: multimodal prompts, tabletop manipulation
- Why it matters: 用文本和视觉 prompt 描述机器人任务，是理解多模态任务规范的重要工作。

## Policy Learning

### ACT: Action Chunking with Transformers

- Link: https://arxiv.org/abs/2304.13705
- Project: https://tonyzhaozh.github.io/aloha/
- Topic: behavior cloning, action chunking, bimanual manipulation
- Why it matters: 是 ALOHA / Mobile ALOHA 路线的重要基础工作，补齐了当前列表里低成本真实机器人操作的经典方法线。

### Diffusion Policy: Visuomotor Policy Learning via Action Diffusion

- Link: https://arxiv.org/abs/2303.04137
- Project: https://diffusion-policy.cs.columbia.edu/
- Topic: visuomotor policy learning, action diffusion, manipulation
- Why it matters: 是现代机器人操作策略学习的重要基线之一，理解它有助于连接模仿学习、生成式策略和操作任务复现。

## Lifelong / Continual Robot Learning

### LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning

- Link: https://arxiv.org/abs/2306.03310
- Project: https://libero-project.github.io
- Code: https://github.com/Lifelong-Robot-Learning/LIBERO
- Topic: lifelong robot learning benchmark
- Why it matters: 提供持续学习和任务迁移场景，适合评估机器人策略泛化。

## Reading Tips

建议阅读顺序：

```text
RT-1 -> PaLM-E -> RT-2 -> Open X-Embodiment -> OpenVLA -> Octo -> pi0 -> SmolVLA -> ACT -> LIBERO
```

如果目标是工程实践，优先看：

```text
LeRobot / OpenVLA / Octo / openpi / SmolVLA / ManiSkill / LIBERO
```
