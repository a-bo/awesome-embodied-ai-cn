# HIL 纠错记录离线校验样例

需要 Node.js 20+（测试使用 JSON module import）；校验器本身不读取设备、不会连接 LeRobot、不会发送机器人动作。

```bash
node validate-hil-record.mjs hil-correction.synthetic.json
node test.mjs
```

`hil-correction.synthetic.json` 是完全合成的 `aborted / corrections_only` 示例。`VALID` 只表示记录的字段、时间线、接管顺序和审查状态符合这个小型离线契约，**不**表示机器人、策略、暂停或人工纠错已发生。

校验器检查：模式和状态、非空证据、常见 token 形态、连续 UTC 时间线、policy 后才允许 human correction、暂停触发原因，以及 `completed` 的末段结果。它不会检查文件路径是否存在，不会判断现场安全，也不会决定任何片段可用于训练；这些仍需要经授权的现场人员和独立审查者完成。
