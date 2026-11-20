# ManiSkill 首个 episode 复查路线：先固定任务语义，再比较策略

更新：2026-11-20。本文面向第一次用 ManiSkill 做机器人操作仿真的开发者，目标不是“尽快跑出 reward”，而是在执行任何训练、批量 benchmark 或对外比较前，留下能回答“到底跑了什么”的最小 episode 记录。本文没有安装 ManiSkill、下载资产、启动渲染、执行随机动作或训练；所有命令都是待操作者在自己的环境中执行的模板。

## 适合谁、环境与硬件边界

适合已经会使用 Python、想从 `PickCube-v1` 等任务建立可复查基线的开发者。建议先选单环境、状态观测和不渲染的路径；它降低了首轮的变量数量，但不等于策略有效。

| 路径 | 适合场景 | 前提 / 限制 |
| --- | --- | --- |
| CPU 状态路径 | 先核对 API、任务、seed 与记录格式 | 仍需完成目标平台的依赖安装；不产生视觉观测或真实机器人结论 |
| 单环境视觉路径 | 检查 `rgbd` 或相机观测字段 | 渲染需要目标平台支持的 Vulkan/图形链路；不要把截图当作评估 |
| GPU 向量化路径 | 已固定单环境契约后再扩展吞吐 | `num_envs > 1` 会带来 batch 维度、设备和并行 reset 语义；不能与单环境结果直接混写 |

ManiSkill 官方文档说明：任务通过 Gym/Gymnasium 接口创建，`reset(seed=...)` 可固定首次 episode 的随机性；观测模式与控制模式共同决定 observation/action space。任务卡还会标出支持的机器人、随机化、成功/失败条件、演示数据和资产要求。先读任务卡再选任务，不要只根据任务名推断成功条件。

## E0–E4：一个可复查 episode 的最小门禁

| 阶段 | 必须记录 | 通过条件 | 不通过时做什么 |
| --- | --- | --- | --- |
| E0 版本与资产 | ManiSkill/Python/Torch、任务 ID、robot UID、资产来源与状态 | 版本和任务卡链接可回查 | 标为 `blocked`，不要代填版本 |
| E1 接口契约 | `obs_mode`、`control_mode`、`num_envs`、设备、`observation_space`、`action_space` 摘要 | 模式与空间摘要来自同一次创建 | 模式或维度不清楚时停止，不开始训练 |
| E2 reset | seed、reset options、返回观测的类型/shape、episode 序号 | reset 返回成功且记录 batch 语义 | 资产缺失或 reset 异常只记错误摘要，不猜测原因 |
| E3 step | 每一步的 action 来源、step 序号、reward、`terminated`、`truncated`、info 摘要 | 明确哪个信号结束 episode | 不把 reward 非零称为成功 |
| E4 收尾 | 最大步数、最终结束原因、成功字段（若任务实际暴露）、日志/代码修订 | 结论只引用 E0–E3 已有字段 | 缺少成功字段时写 `unknown` |

建议将 `terminated` 与 `truncated` 分开保存。前者和任务终止条件有关，后者常来自时间限制或外部包装；二者合并成一个“成功”布尔值会破坏后续比较。官方快速入门示例也将两者分开，并以二者的逻辑或决定循环是否结束。

## 待执行模板：先打印契约，不训练

以下模板用于**本地预览接口**。请在隔离环境安装目标版本后再运行，并把版本号、输出和实际命令写入 E0–E4；仓库没有执行过它。

```python
import gymnasium as gym
import mani_skill.envs

env = gym.make(
    "PickCube-v1",
    num_envs=1,
    obs_mode="state",
    control_mode="pd_ee_delta_pose",
)
print("observation_space:", env.observation_space)
print("action_space:", env.action_space)

obs, info = env.reset(seed=0)
print("reset type:", type(obs), "info keys:", sorted(info.keys()))

for step in range(5):
    action = env.action_space.sample()  # 仅接口探针，不是策略评估
    obs, reward, terminated, truncated, info = env.step(action)
    print(step, reward, terminated, truncated, sorted(info.keys()))
    if terminated or truncated:
        break

env.close()
```

这个片段只适合确认接口和记录字段：随机 action 不是控制策略；单个 seed、最多五步、未读取任务实际 success 字段，均不能证明任务完成、环境正确、性能可比或训练可行。

## 推荐记录结构

可以保存为脱敏 JSON；路径、令牌、内部镜像地址与真实主机信息不要写入仓库。

```json
{
  "record_version": "maniskill-episode-v1",
  "status": "not_run",
  "environment": {
    "task_id": "PickCube-v1",
    "robot_uid": "unknown",
    "obs_mode": "state",
    "control_mode": "pd_ee_delta_pose",
    "num_envs": 1,
    "device": "unknown"
  },
  "provenance": {
    "maniskill_version": "unknown",
    "python_version": "unknown",
    "task_card_url": "https://maniskill.readthedocs.io/en/latest/tasks/index.html"
  },
  "reset": { "seed": 0, "options": {}, "observation_summary": "not_recorded" },
  "steps": [],
  "outcome": {
    "terminated": "unknown",
    "truncated": "unknown",
    "success": "unknown",
    "evidence": []
  }
}
```

`not_run` 是诚实的起点，不应用虚构的 step 补齐它。真正执行后，`steps` 中至少应保留 action 来源（例如 `random_probe` / 策略 revision）、reward、两个结束标志与必要 info 的白名单摘要；完整视觉帧、隐私数据或超大日志应放在受控存储，并记录可审核引用。

## 复现步骤与验收

1. 在目标 OS/GPU 条件下阅读 [安装文档](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html)，确认 CPU/GPU/渲染路径，而非复制另一台机器的配置。
2. 从 [任务卡](https://maniskill.readthedocs.io/en/latest/tasks/index.html) 选择一个任务，记录支持机器人、随机化、成功/失败条件和资产需求。
3. 仅创建单环境并打印 E1；在日志中保留任务 ID、模式、空间摘要与版本。
4. 用固定 seed 执行一次 reset；保存 E2 返回摘要，确认单环境与 batch tensor 的实际语义。
5. 最多执行预先声明步数的接口探针；分别记录 `terminated`/`truncated`，不得用 reward 推断 success。
6. 只有 E0–E4 完整时，才把该记录作为未来策略或配置比较的基线；更换任务、robot、模式、版本、资产或并行数都应新建记录。

验收不要求 reward 阈值。一个合格的首轮记录至少能让独立审查者回答：使用什么任务、接口契约是什么、如何 reset、哪一个结束信号出现、成功是否真的被任务报告、以及哪些信息仍未知。

## 常见误读与停止条件

- **把 `num_envs=16` 当成单环境的放大版**：并行环境会改变 shape、设备和部分 reset 处理；先分别验证。
- **把 `render_mode="human"` 当成默认可用**：GUI 需要显示与图形依赖，远程/headless 场景应先走不渲染路径。
- **把随机 action 的完成判为 benchmark**：它最多是 API 探针，不是策略质量。
- **把单 seed 的结果写成可复现**：一个 seed 只能标识一次初始化，不能覆盖随机化、资产或版本差异。
- **E0 或 E1 缺失仍开始训练**：停止并补齐来源；训练日志无法补救不明确的任务契约。

## 一手资料（2026-11-20 核验）

- [ManiSkill 官方 Quickstart](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/quickstart.html)：任务创建、`reset(seed=...)`、`step` 返回值、观测/控制模式与单/多环境接口。
- [ManiSkill 官方安装说明](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html)：CPU/GPU 与渲染依赖边界。
- [ManiSkill 官方任务卡索引](https://maniskill.readthedocs.io/en/latest/tasks/index.html)：任务、随机化、成功/失败条件、数据和资产标注。
- [ManiSkill 官方仓库](https://github.com/mani-skill/ManiSkill)：当前代码、release 与问题追踪入口。

每次实际运行前，请对目标版本重新核对文档。本文只是记录与审查路线；未安装 ManiSkill、未运行仿真、未训练策略、未生成视频，也未控制任何硬件。
