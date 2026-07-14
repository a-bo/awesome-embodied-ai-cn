# 中文导读

这里整理具身智能方向的中文论文 / 项目笔记，优先收录那些既有研究代表性、又能连接工程复现路径的资源。

## 已有笔记

### RT-1

- Link: [rt1-cn.md](rt1-cn.md)
- Topic: Robot Transformer, large-scale real-world control
- Why read: 理解后续 RT-2、RT-X、OpenVLA 之前，先建立“机器人控制为什么要 Transformer 化”的基础。

### RT-2

- Link: [rt2-cn.md](rt2-cn.md)
- Topic: VLA, web knowledge transfer, robot control
- Why read: 看清楚“把 VLM 的知识迁移到机器人动作”到底意味着什么，以及它为什么成为 VLA 热潮的重要拐点。

### Open X-Embodiment

- Link: [open-x-embodiment-cn.md](open-x-embodiment-cn.md)
- Topic: cross-embodiment dataset, RT-X, generalist robot policy
- Why read: 适合理解为什么通用机器人策略最终会回到“跨平台数据”和“多机器人共同训练”。

### OpenVLA

- Link: [openvla-cn.md](openvla-cn.md)
- Topic: open-source Vision-Language-Action model
- Why read: 适合从“能不能真的开始复现 VLA”这个角度进入具身智能工程实践。

### Octo

- Link: [octo-cn.md](octo-cn.md)
- Topic: open generalist robot policy
- Why read: 适合理解通用策略、跨平台微调和开放机器人基座模型在工程上怎么落地。

### openpi / pi0

- Link: [pi0-cn.md](pi0-cn.md)
- Topic: next-generation VLA, flow matching, general robot control
- Why read: 适合理解新一代 VLA 如何从论文热点走向公开工程入口。

### SmolVLA

- Link: [smolvla-cn.md](smolvla-cn.md)
- Topic: affordable VLA, efficient robotics, low-cost reproduction path
- Why read: 适合从“普通开发者到底能不能做具身智能复现”这个角度理解一条更现实的工程路径。

## 推荐阅读顺序

```text
RT-1 -> RT-2 -> Open X-Embodiment -> OpenVLA -> Octo -> pi0 -> SmolVLA
```

如果你偏研究，先看模型路线差异。  
如果你偏工程，优先关注数据来源、微调入口、硬件要求和复现门槛。
