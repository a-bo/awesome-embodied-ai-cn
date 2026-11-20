# 首个 ManiSkill 结果，先别急着看 reward

很多仿真记录只有一句“PickCube 跑通了”。但别人没法判断：是哪个任务版本？什么 observation/control mode？seed 是多少？结束是成功、超时，还是脚本提前停了？

这次补了一条 [ManiSkill 首个 episode 复查路线](../roadmap/maniskill-first-episode-record.md)，把首轮工作压缩为 E0–E4：

1. 固定版本、任务卡与资产来源；
2. 打印 observation/action space，而不是凭任务名猜；
3. 用 seed 记录 reset；
4. 把 `terminated` 和 `truncated` 分开；
5. 只有任务实际给出 success 字段时才写成功。

它适合 CPU 状态路径、单环境视觉路径或后续 GPU 向量化前的第一份基线。随机 action 只是一种接口探针，不是策略评估；单个 seed 也不是“已经可复现”。

文中没有声称跑过 ManiSkill、装过 Vulkan、执行了仿真或训练。代码片段是待操作者在目标环境执行的模板，初始 JSON 用 `not_run` 明确未运行状态。

一手资料来自 ManiSkill 官方 [Quickstart](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/quickstart.html)、[安装说明](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html) 和[任务卡索引](https://maniskill.readthedocs.io/en/latest/tasks/index.html)。

先有一份别人能复查的 episode 记录，再讨论 reward、success rate 或不同策略之间的比较。
