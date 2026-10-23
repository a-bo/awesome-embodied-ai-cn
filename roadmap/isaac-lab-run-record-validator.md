# Isaac Lab 运行记录校验器：把“能启动”与“有证据”分开

更新：2026-10-23。本文为 [无界面训练前检查](isaac-lab-headless-preflight.md) 的后续小工具：一个零依赖 Node.js 18+ JSON 校验器和 E0 样例记录。它只校验**记录结构**，不安装 Isaac Lab、不会启动容器或仿真，也不能证明训练、收敛、复现或真机能力。

## 适合谁

- 要在远程工作站或容器执行 Isaac Lab 的个人开发者；
- 想把环境信息、命令、退出码和日志路径交接给同伴的人；
- 希望在开长 GPU 任务前先阻止“版本不明但声称已跑通”的项目。

需要 Node.js 18+。不需要 GPU、Docker、Isaac Lab 或 Isaac Sim 才能运行本校验器；但实际运行目标任务仍需要遵循官方版本与硬件要求。

## 文件与运行方式

```bash
node examples/isaac-lab-run-record/validate-run-record.mjs \
  examples/isaac-lab-run-record/e0-example.json
```

- [校验器](../examples/isaac-lab-run-record/validate-run-record.mjs)
- [E0 样例记录](../examples/isaac-lab-run-record/e0-example.json)

样例会输出 `VALID ... E0 / blocked`：它是结构正确的“被阻塞”记录，而非环境通过的证明。开始真实检查前，替换所有 `replace-with-*` 值，并把真实命令输出保存到 `evidence` 指向的日志位置。

## 最小记录契约

| 字段 | 要回答的问题 | 校验器规则 |
| --- | --- | --- |
| `run_id` | 这一次尝试是哪一次？ | 必填 |
| `execution_phase` | 对应 E0–E5 的哪一步？ | 只能是 `E0`…`E5` |
| 版本与设备字段 | 使用什么 Lab / Sim、GPU 与 driver？ | `isaac_lab_ref_or_image_tag`、`isaac_sim_version`、`gpu_model`、`nvidia_driver` 必填 |
| `visualization_mode` | 使用哪种可视化策略？ | `headless`、`offscreen-video` 或 `interactive` |
| `task_id`、`command`、`started_at` | 运行的对象与时间是否可追溯？ | 必填 |
| `outcome`、`exit_code` | 结果是通过、阻塞还是失败？ | `passed` 必须是退出码 0 |
| `evidence` | 证据在哪里？ | 非空；`passed` 必须含带 `path` 的 `log` 项 |

`blocked` 并不是坏结果：缺少 GPU 可见性、不可写日志目录或版本未固定时，先保存阻塞原因比开训练更有价值。校验器不判断路径是否真的存在，因为它设计为离线检查格式；实际执行者仍必须人工打开日志、确认时间、命令和目标版本彼此匹配。

## 推荐的最小流程

1. 依照[前检查路线](isaac-lab-headless-preflight.md)选定 release / image tag、路径和停止条件。
2. 仅做 E0，记录主机与容器的 GPU 可见性、目录可写性和实际命令。
3. 将记录交给校验器；不通过时修复记录或环境，而不是启动长训练。
4. E1–E5 每次只扩大一个变量，仍保存独立 JSON 与日志路径。
5. 只有 E3/E5 有实际日志、固定配置、seed 与 checkpoint 后，才讨论“训练可复跑”；仍不能由此推导真机能力。

## 验收边界

本次实际运行了 Node.js 校验器，对随附 E0 合成样例输出 `VALID`；同时确认无输入文件会以用法错误退出。**没有**安装 Isaac Lab / Isaac Sim、运行 Docker、检查真实 GPU、启动任务、产生日志或 checkpoint。因此，这个工具只证明“样例记录的格式可被检查”，并不证明任何 Isaac Lab 环境已通过。

## 一手来源

- [Isaac Lab Installation](https://isaac-sim.github.io/IsaacLab/main/source/isaaclab/installation.html)：开发与容器安装、镜像和运行用户。
- [Training with an RL Agent](https://isaac-sim.github.io/IsaacLab/main/source/how-to/run_rl_training.html)：headless、可视化和日志相关训练入口。
- [IsaacLab 官方仓库](https://github.com/isaac-sim/IsaacLab)：目标 release 与变更记录入口。

文档版本会变化；每次真实运行前，都应重新核对目标 release 的官方页面与自己的硬件环境。
