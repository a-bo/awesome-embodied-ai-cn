# LeRobot HIL 纠错记录校验器：先检查交接证据，再讨论训练

更新：2026-11-13。本文是 [LeRobot 人机接管纠错记录路线](lerobot-hil-correction-record.md) 的离线后续：提供一个零依赖 Node.js 校验器、完全合成的 `aborted / corrections_only` 样例和 10 个验收测试。它不安装 LeRobot、不连接机器人、不读取视频或日志，更不会启动 rollout、暂停、接管或训练。

## 适合谁与运行前提

适合已经用既有路线定义了 HIL 记录字段，想在上传或交接前阻止明显不完整记录的团队。运行校验器只需 Node.js 20+；真实 HIL 仍要求现场安全审批、急停、兼容 robot / teleoperator、已固定的 LeRobot 版本和独立数据审查。

```bash
node examples/lerobot-hil-correction-record/validate-hil-record.mjs \
  examples/lerobot-hil-correction-record/hil-correction.synthetic.json
node examples/lerobot-hil-correction-record/test.mjs
```

- [校验器](../examples/lerobot-hil-correction-record/validate-hil-record.mjs)
- [合成样例](../examples/lerobot-hil-correction-record/hil-correction.synthetic.json)
- [验收测试](../examples/lerobot-hil-correction-record/test.mjs)

预期第一条命令输出 `VALID ... aborted / corrections_only`。这只证明合成 JSON 满足本页的结构规则，**不是**任何机器人、策略、HIL 采集或训练成功的证据。

## 最小记录契约

| 字段 / 关系 | 离线规则 | 不能从中推断 |
| --- | --- | --- |
| `status` | 仅 `not_run`、`blocked`、`aborted`、`completed` | policy 成功或安全 |
| `recording_mode` | 仅 `corrections_only` 或 `continuous` | 两种数据语义可互换 |
| `evidence` | 必须非空，拒绝常见 token 形态 | 引用的日志或视频真的存在 |
| `segments` | 每段有 UTC 秒级起止，后一段起点等于前一段终点 | 时间戳来自真实设备 |
| policy → human | human correction 前必须出现 policy 段；human 段需意图和审查状态 | human 动作适合训练 |
| paused policy 段 | 必须写触发原因 | 暂停机制或急停已验证 |
| `completed` | 最后一个 segment 必须是 `completed` | 全 episode 的任务质量或可泛化性 |

`not_run` 不允许带 segment；不要为了通过校验而虚构时间线。`aborted` 和 `blocked` 是可以交接的真实结果类别，前提是原因和证据由现场人员如实补齐。

## 实施与审查步骤

1. 先按 [HIL 接管路线](lerobot-hil-correction-record.md) 固定 release/commit、policy revision、硬件身份、停止条件和审查人。
2. 只在授权的现场尝试结束后，导出经脱敏的记录副本；端口、真实地址、身份影像、token 与私有数据集 ID 不要放进该 JSON。
3. 运行离线校验器，修正结构错误或保留 `blocked` / `aborted` 原因；不要把 `VALID` 当成准许重新动作的指令。
4. 由独立审查者人工打开原始视频/日志，核对 segment、时间、trigger、审查状态和数据集 revision。
5. 只有审查结论、原始证据与数据集卡都完整时，才能由负责人与训练流程决定 `approved_for_review` 段后续如何处理。

## 验收标准与边界

本次离线验收应覆盖：有效合成样例、未知状态、缺模式、空证据、token 形态、断裂时间线、缺暂停 trigger、无先前 policy 的 human 段、非法审查状态和 `completed` 末段不匹配。随附 `test.mjs` 覆盖以上 10 项。

本仓库只执行过合成样例的 Node.js 校验和这 10 个离线测试。未安装 LeRobot、连接硬件、校准、执行策略、暂停/接管、采集视频、上传数据集、训练或评估。因此不能由本工具推断系统安全性、策略提升、训练收益或复现成功。

## 一手资料（2026-11-13 核验）

- [LeRobot Human-in-the-Loop Data Collection](https://huggingface.co/docs/lerobot/main/hil_data_collection)：说明在真实机器人部署中记录人工 intervention 与 recovery/correction，并与 autonomous 段形成训练数据；实际命令和流程以目标版本为准。
- [LeRobot Policy Deployment (`lerobot-rollout`)](https://huggingface.co/docs/lerobot/main/inference)：说明 rollout CLI 的部署用途及 HIL 相关策略；不把文档示例当作本仓库已经执行。
- [LeRobotDataset v3.0](https://huggingface.co/docs/lerobot/main/lerobot-dataset-v3)：说明多模态时序、视频与元数据的标准化数据集背景；本校验器并不解析该格式。
- [LeRobot 官方源代码](https://github.com/huggingface/lerobot)：用于固定 release/commit 与检查当前支持边界。

每次真实运行前必须重新查看目标 release 的官方文档及设备安全要求；`main` 文档当前提示其对应从源码安装的版本，稳定安装应切换到相应稳定版本页面。
