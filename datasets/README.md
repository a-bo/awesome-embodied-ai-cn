# Datasets

具身智能的数据集通常包括机器人轨迹、视觉观察、语言指令、动作序列和任务标签。数据规模和跨平台多样性会直接影响模型泛化能力。

## Open X-Embodiment

- Paper: https://arxiv.org/abs/2310.08864
- Project: https://robotics-transformer-x.github.io
- Description: 来自多个机构、多个机器人平台的大规模机器人学习数据集合。
- Use case: 训练和评估跨机器人策略、VLA、通用机器人模型。

## BridgeData V2

- Paper: https://arxiv.org/abs/2308.12952
- Project: https://rail-berkeley.github.io/bridgedata
- Description: 大规模机器人操作数据集，包含多环境、多任务轨迹。
- Use case: 模仿学习、离线强化学习、语言条件机器人操作。

## DROID

- Paper: https://arxiv.org/abs/2403.12945
- Project: https://droid-dataset.github.io/
- Description: 大规模 in-the-wild 机器人操作数据集，强调真实世界采集、多任务、多场景和跨环境泛化。
- Use case: VLA 训练、真实机器人模仿学习、跨场景操作泛化。

## AgiBot World

- Paper: https://arxiv.org/abs/2503.06669
- Description: 面向通用机器人学习的大规模真实世界数据集，强调多机器人、多任务和真实操作场景覆盖。
- Use case: 通用策略训练、真实世界模仿学习、跨任务泛化评测。

## LIBERO

- Paper: https://arxiv.org/abs/2306.03310
- Project: https://libero-project.github.io
- Code: https://github.com/Lifelong-Robot-Learning/LIBERO
- Description: 面向 lifelong robot learning 的任务套件和示范数据。
- Use case: 持续学习、知识迁移、顺序任务学习。

## RoboMimic Datasets

- Code: https://github.com/ARISE-Initiative/robomimic
- Description: 模仿学习基准和相关数据集工具。
- Use case: 行为克隆、离线策略学习、机器人操作算法评估。

## BEHAVIOR

- Project: https://behavior.stanford.edu/
- Description: 面向家庭环境长时程任务和日常活动的大规模 benchmark，强调 embodied agents 在复杂场景中的评估。
- Use case: household activity benchmark、具身 agent 评测、复杂任务规划与执行。

## Dataset Checklist

选择数据集时建议检查：

- 是否有语言指令
- 是否有多视角图像
- 是否包含真实机器人数据
- 动作空间是什么
- 机器人平台是什么
- 是否有训练 / 验证拆分
- License 是否允许研究或商用
