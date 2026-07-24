# ROS2 + AI 机器人项目路线

这条路线面向希望把 `ROS2`、视觉模型、语音交互、任务规划和机器人执行串起来的开发者。

目标不是一开始就做完整机器人系统，而是先做一个能跑通的最小闭环：

```text
用户输入 -> 感知理解 -> 任务规划 -> ROS2 节点调度 -> 执行动作 -> 返回结果
```

## 适合谁

- 已经有软件开发经验，想进入机器人 / 具身智能方向的人
- 想做 `Robot Agent`、`ROS2 + VLM`、`语音控制机器人` 项目的工程师
- 想把仿真、模型和真实机器人控制串起来的学生或独立开发者

## 先补哪些基础

建议先具备这些能力：

- Python / Linux / Docker / Git
- ROS2 基础：topic、service、action、launch、tf2
- 计算机视觉或多模态模型的基本使用
- 机器人仿真基础

如果基础还不稳，先回到 [具身智能中文学习路线](embodied-ai-roadmap-cn.md) 的前四个阶段。

## 推荐项目分层

### Layer 1: ROS2 基础闭环

目标：

```text
能发布消息、订阅状态、调用 action，并把一个简单任务拆成多个节点。
```

建议任务：

- 小车前进 / 停止 / 转向
- 机械臂移动到指定位置
- 摄像头图像订阅和可视化

建议工具：

- ROS2 Humble / Jazzy
- RViz2
- Gazebo 或 Isaac Sim

### Layer 2: 感知接入

目标：

```text
把图像、语音或文本输入变成机器人可消费的结构化信息。
```

建议任务：

- 摄像头识别桌面物体类别
- 语音命令转文本
- 将自然语言命令解析成结构化任务

建议模块：

- VLM / OCR / ASR
- object detection / segmentation
- command parser

输出形式示例：

```json
{
  "task": "pick_and_place",
  "target_object": "red cup",
  "target_location": "table B"
}
```

### Layer 3: 任务规划

目标：

```text
让 LLM 或规则系统把高层命令拆成机器人可执行步骤。
```

建议任务：

- 把“把红杯子放到桌子右边”拆成感知、定位、抓取、放置步骤
- 把“巡检会议室并汇报异常”拆成导航、观察、总结步骤

可选实现：

- 纯规则 planner
- LLM planner
- LLM + tool calling / MCP

建议输出：

- step list
- required sensors
- fallback action
- completion criteria

### Layer 4: 执行层

目标：

```text
让规划结果真正映射到 ROS2 节点、action 或底层控制器。
```

典型节点：

- navigation node
- manipulation node
- perception node
- speech node
- supervisor node

建议先做：

- 1 个 supervisor 节点
- 2 到 3 个可复用功能节点
- 1 条清晰的成功 / 失败回传链路

### Layer 5: 闭环与纠错

目标：

```text
不是只发一次动作，而是在执行中检查结果、判断失败、重新规划。
```

建议能力：

- 超时重试
- 感知失败 fallback
- 执行失败后重新定位 / 重新规划
- 简单日志和事件记录

这是从“能演示”走向“更像真实机器人系统”的关键一步。

## 三条推荐项目路线

### 1. 语音指令机器人

项目闭环：

```text
语音输入 -> ASR -> LLM 解析命令 -> ROS2 调度 -> 执行动作 -> 语音反馈
```

适合：

- 想快速做出可演示 demo 的人
- 想把 Agent 能力接到机器人交互上的人

### 2. 视觉抓取机器人

项目闭环：

```text
摄像头图像 -> 目标识别 -> 抓取点估计 -> 机械臂执行 -> 成功检测
```

适合：

- 想做 manipulation / VLA 入口项目的人
- 想把 `OpenVLA`、`SmolVLA`、`ACT` 等路线和工程系统接起来的人

### 3. 巡检 / 导航机器人

项目闭环：

```text
任务目标 -> 路径规划 -> 场景观察 -> 异常总结 -> 回传报告
```

适合：

- 想做 navigation / embodied agent loop 的人
- 想把 perception + planning + reporting 串起来的人

## 推荐资源搭配

基础框架：

- `ROS2`
- `RViz2`
- `Gazebo`
- `Isaac Sim / Isaac Lab`

操作 / manipulation：

- `LeRobot`
- `OpenVLA`
- `SmolVLA`
- `Mobile ALOHA`

仿真 / benchmark：

- `ManiSkill`
- `robosuite`
- `LIBERO`
- `RoboCasa`

规划 / Agent：

- `LLM tool calling`
- `MCP`
- task planner
- state machine / behavior tree

## 最小 MVP 建议

如果你只做一个版本，建议先做：

### MVP A: 语音 + 视觉 + 抓取

- 输入一句自然语言命令
- 识别目标物体
- 输出抓取步骤
- 通过 ROS2 调用执行节点
- 返回成功或失败状态

### MVP B: 导航 + 观察 + 报告

- 输入一个巡检任务
- 导航到指定区域
- 读取摄像头图像
- 用模型总结异常
- 返回一份结构化报告

## 做这条路线时最容易踩的坑

- 一开始就想接太多模型和节点
- 没有定义统一任务 schema
- 感知输出和执行输入之间没有稳定接口
- 只演示一次成功路径，没有失败处理
- 过早绑定真实硬件，导致调试成本过高

更稳的方式是：

```text
先仿真 -> 再小规模真实设备 -> 最后再考虑复杂任务编排
```

## 推荐 2 周推进节奏

### Week 1

- 跑通 ROS2 基础节点通信
- 选 1 个仿真环境
- 选 1 条任务链路
- 定义统一任务 schema

### Week 2

- 接入 1 个感知模块
- 接入 1 个 planner
- 打通 supervisor -> executor -> feedback 闭环
- 录一段 demo，沉淀 README 和架构图

## 下一步可以接什么

当这条路线跑通后，再继续做：

- `Robot Agent` 项目案例
- `ROS2 + MCP` 工具调用实践
- `OpenVLA / SmolVLA` 的工程化接入示例
- 低成本真实机器人复现路线
