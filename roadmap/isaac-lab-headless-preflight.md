# 先验收环境，再启动训练：Isaac Lab 无界面训练前检查路线

更新：2026-10-21。面向准备在远程 Linux 工作站或容器中，用 Isaac Lab 开始第一个强化学习训练任务的开发者。

**交付状态：这是基于 Isaac Lab 官方文档与官方仓库核验的训练前检查路线，不是本仓库已经安装、训练或复现成功的记录。本文没有安装 Isaac Lab / Isaac Sim、拉取容器、启动仿真、训练策略或产生 checkpoint。所有命令和结果都必须由执行者在目标版本和自己的设备上复核。**

强化学习任务的第一类失败常常不是 reward，而是版本、显卡、驱动、容器权限与可视化选择混在一起。下面的路线把“能否开始一次可审计的无界面小训练”拆成可停止、可记录的门禁；它刻意不把“进程启动”当作“任务学会了”。

## 1. 先选路径：开发环境、容器和云端不是同一件事

| 路径 | 适合谁 | 先验条件 | 本路线中的最小目标 |
| --- | --- | --- | --- |
| 官方开发环境 | 要阅读或修改任务、脚本的人 | 受支持的 OS、Python / Isaac Sim 对应版本、NVIDIA 驱动 | 跑通一个官方最小任务 |
| 官方容器 | 希望固定依赖、隔离宿主机的人 | Docker Engine、Docker Compose、NVIDIA Container Toolkit、可写挂载目录 | 进入正确镜像并保留日志 |
| 云端工作站 | 没有本地 GPU 或需要临时容量的人 | 云账户、预算与远程桌面 / SSH 安全策略 | 先完成环境检查，不直接开长训练 |

不要把这三条路径的命令混用。官方安装页说明容器依赖 Docker Engine、Docker Compose 和 NVIDIA Container Toolkit；标准 Isaac Lab 容器还依赖 Isaac Sim 镜像及相应软件许可。云端只是部署位置，不会自动解决 GPU、驱动、存储或版本兼容问题。

## 2. 硬件与环境边界：先记录事实，不要猜可用性

在选定 **具体发布版本** 后，建立一张本地运行记录，至少写入：

```text
run_id:
isaac_lab_ref_or_image_tag:
isaac_sim_version:
host_os_and_kernel:
gpu_model:
nvidia_driver:
docker_engine_and_compose:            # 容器路径才填写
nvidia_container_toolkit:             # 容器路径才填写
python_version:
visualization_mode: headless | offscreen-video | interactive
task_id:
command:
started_at:
```

当前官方 develop 安装文档把完整 Isaac Sim 工作流标为 Python 3.12、Ubuntu 22.04+ 或 Windows 11、至少 32 GB RAM / 16 GB GPU VRAM，并要求核对兼容的 NVIDIA 驱动；这些是**文档中的当前要求，不是任何机器已经达标的证明**。使用 stable release 时应优先以该 release 的安装页、镜像 tag 和 release notes 为准，而不是抄 main / develop 命令。

无桌面的远程机器可以用 headless；官方训练教程说明 `--headless` 不渲染画面，适合远程服务器，通常只执行物理仿真。若要录制视频，需明确开启相机 / 视频选项；这会改变资源消耗，不能和纯 headless 吞吐直接比较。

## 3. 容器路径的两个常见门禁

### 3.1 GPU 是否真的进入了容器

在未启动训练前，执行者应先在自己选择的官方镜像和命令下保存以下证据：

1. 容器镜像的**显式版本 tag**，而不是浮动 tag；
2. 宿主机与容器内 GPU / 驱动可见性的命令输出；
3. 容器内工作目录、日志目录与 checkpoint 目录的实际写入位置；
4. 容器启动命令和退出码。

官方文档给出 pre-built 镜像与 Docker Compose 工作流，也说明默认没有选择可视化器，因此训练会是 headless，除非显式选择可视化方式。没有这些记录时，不能从“Docker 容器能启动”推断 GPU 被训练进程使用。

### 3.2 UID 1000 与挂载目录权限

官方 3.0 系列文档说明基础、cuRobo 和 kit-less 镜像以 uid/gid 1000 的非 root 用户运行；宿主机 bind mount 若由 root 创建，运行时可能因目录不可写失败。门禁不是盲目 `sudo chown`，而是先确认：

| 要检查的路径 | 为什么要检查 | 通过证据 |
| --- | --- | --- |
| logs / runs | 训练日志与 TensorBoard 事件能否写入 | 目标用户可创建测试文件 |
| checkpoints | 长任务是否会在结束时丢失权重 | 可写且在容器外可定位 |
| dataset / assets | 数据是否被意外下载到临时层 | 来源与挂载点明确 |
| cache | 首次启动会不会因权限失败 | 容器日志无 PermissionError |

如果团队不允许改变目录属主，就改用预先创建、由运行用户可写的目录或命名 volume，并把选择写进记录。不要把权限报错误诊为 CUDA 或任务配置问题。

## 4. 从最小任务到短训练：每步只扩大一个变量

以下是文档化的执行顺序，不是本仓库运行过的命令清单。请从目标 release 的官方安装/训练页复制对应命令和 task 名称。

| 阶段 | 只验证什么 | 需要保存的证据 | 失败时先做什么 |
| --- | --- | --- | --- |
| E0 环境 | 版本、GPU、目录、镜像可识别 | 上节运行记录 | 停止，不下载数据或开长任务 |
| E1 启动 | Isaac Lab / Isaac Sim 能初始化 | 退出码、前 200 行日志、版本 | 区分安装失败与任务失败 |
| E2 单步任务 | 小型官方任务能被加载 | task ID、配置、日志路径 | 固定 task，勿先调 reward |
| E3 headless 短跑 | 训练循环可产生结构化日志 | 步数、随机种子、输出目录 | 检查资源与错误堆栈 |
| E4 可视检查 | 必要时生成短视频或打开交互窗口 | 视频/截图路径、相同 checkpoint | 不用视频代替指标 |
| E5 可复跑 | 同一固定配置能重新启动 | 完整命令、版本、seed、产物 hash | 再考虑延长训练 |

官方教程以 Cartpole 示例展示带 `--headless` 的训练，并将视频产物放入对应日志目录；它也强调交互模式会打开 Isaac Sim 窗口且更慢。本文不指定 `num_envs`、总步数、reward 阈值或训练时长，因为这些取决于版本、任务、GPU 和算法，不能由文档路线替代实测。

## 5. 何时可以说“跑通”，何时只能说“启动过”

| 说法 | 需要的最低证据 | 本路线能否提供 |
| --- | --- | --- |
| “环境检查完成” | E0 记录与可保存的命令输出 | 仅在执行者实际保存后 |
| “最小任务启动” | E1/E2 的成功退出码与日志 | 仅在实际运行后 |
| “训练可复跑” | E3/E5：固定版本、配置、seed、日志与 checkpoint | 仅在至少两次实际运行后 |
| “策略学会任务” | 明确成功判定、评测协议、多种 seed / 失败样本 | 不能由启动日志证明 |
| “可迁移到真机” | 独立的安全审查、传感器/控制契约、真机试验记录 | 本路线完全不提供 |

尤其要避免把“headless 没有报错”“loss 下降”或“生成了视频”写成机器人技能成功。它们分别只说明进程、优化曲线或某段可视化存在。

## 6. 停止条件与成本边界

遇到下列任一情况，先停止训练并补证据：

- 不能指明 Isaac Lab ref / image tag、Isaac Sim 版本或 GPU driver；
- 容器内没有可写日志与 checkpoint 路径；
- headless 与 off-screen rendering 的资源选择不清楚；
- 任务 ID、训练脚本与输出目录不是同一次运行；
- 因为“先试试”而打算下载未估算容量的大数据或连续开 GPU；
- 准备把仿真日志描述为真实机器人表现。

容器的缓存、资产和 checkpoint 都可能占用大量空间；云端还涉及镜像传输、存储与实例计费。开始前应设置最大运行时长、磁盘上限、预算告警与显式停止条件。本文不对训练成本、吞吐或收敛时间作承诺。

## 7. 一手来源与核验范围

以下链接于 2026-10-21 查阅，均为 NVIDIA / Isaac Lab 官方文档或官方仓库：

- [Isaac Lab Installation](https://isaac-sim.github.io/IsaacLab/main/source/isaaclab/installation.html)：开发环境、容器、镜像、Docker 前提和运行用户说明。
- [当前系统要求（develop）](https://isaac-sim.github.io/IsaacLab/develop/source/setup/installation/index.html)：当前完整工作流的 OS、Python、RAM、VRAM、驱动与兼容性表述；仅作版本核对起点。
- [Training with an RL Agent](https://isaac-sim.github.io/IsaacLab/main/source/tutorials/03_envs/run_rl_training.html)：headless、off-screen video、交互可视化与 Cartpole 训练示例。
- [IsaacLab 官方仓库](https://github.com/isaac-sim/IsaacLab)：release、变更与目标 revision 的入口。

文档和镜像版本持续变化。执行前，请固定并记录目标 release；不要直接把本文中的界面、版本或硬件表述当作永久兼容性保证。本仓库未安装 Isaac Lab / Isaac Sim、启动容器或训练仿真，因此没有任何运行、性能、复现或机器人控制结论。