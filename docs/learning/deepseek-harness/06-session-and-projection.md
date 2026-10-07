# 6. Session、日志与投影：什么是持久事实？

本章解释数据关系。学完后，你应能分别回答：模型看见了什么、UI 怎样恢复状态、什么在进程退出后还存在。

## Session 不等于 messages 数组

Session 持有追加式事件日志。事件包括模型消息、工具调用与结果、turn/step 边界、Inbox 更新和插件业务事实。并不是每条事件都进入模型历史。`deriveMessages()` 根据消息与相关投影规则得到模型所需的 Message 序列。

可以把这一关系写为 `modelHistory = derive(sessionEvents)`。学习解释：这是事件记录与派生状态的分离，和 Python 中对记录列表做 fold/reduce 有关系。不要把它等同于简单的全文拼接，当前实现还处理消息 surface、替换和插件投影。

## 三种“事件”不要混淆

| 类型 | 例子 | 主要用途 |
|---|---|---|
| 持久 Session 事件 | `user/message`、`tool/result`、`todo/write` | 重建、恢复、业务状态 |
| 运行中 Agent 事件 | `agent/pre-step`、`agent/request` | 接纳、路由、协调 |
| 能力事件 | `tools/execute`、`fs/*` | 适配、策略、观察 |

`session/event` 是通知“某条 Session 事实被追加了”的运行时事件，不是日志中每条事实的名字。类似地，运行时 `tools/result` 观察最终工具结果，日志中的 `tool/result` 则保存对应模型可见结果；一个是复数域，一个是单数事实。

## 模型可见意味着有日志依据

用户和系统消息、工具结果以及请求配置都有对应的记录。`request/header` 记录请求配置、工具描述等信息；`request/context` 记录解析后的请求上下文；系统提示词通过 `system/message` 进入模型消息历史。不要套用“每次发送独立 system 字段”的其他框架模型。

“已记录”不保证恢复时仍有原执行环境、网络端点或附件内容可用，也不等于保证模型服务位级重现。日志可重建请求的逻辑输入；外部对象与协议仍有自己的条件。

## 两类投影

消息投影决定哪些记录如何成为模型历史。状态投影从事件计算工具列表、Inbox 状态、turn 边界等业务视图。`ctx.sessionProjections` 注册状态单元，典型结构包括 `init`、`apply`、状态 schema、stateVersion 和可选客户端 wire 视图。schema 在反序列化等边界验证，版本描述该投影的缓存状态，不是 Session 格式版本。

```text
初始状态 = init()
新状态 = apply(旧状态, 事件)
客户端值 = wire.view(新状态)
```

这里是伪代码。关键要求是同样的事实序列能确定性地产生相同状态。不能在恢复时依赖已经不存在的闭包变量、随机数或当前时间。

## 真实例子：todo/write

`tool-todo` 的工具体追加完整 todo 列表快照；`types.ts` 扩展 `SessionEventMap`。投影遇到 `todo/write` 使用其完整列表，遇到新的 `turn/start` 则清空显示状态。由此可见，“最新列表”不仅由最近一次 write 决定，还受轮次规则影响。

新业务如“收藏一个词条”，应先定义持久事实、身份和恢复规则，再决定 UI。只在工具闭包里保存收藏列表，会在重启时丢失；只画 UI 卡片，也不会创建持久业务状态。

## 实时流与持久 settlement

实时 `agent/assistant-stream` 提供 transient frame；已结束的 `assistant/message` 与失败等 `assistant/attempt` 嵌入紧凑的 stream。失败 attempt 保存证据但不加入普通模型消息历史。UI 可以即时增量显示，历史读取则以持久 settlement 为据。

当前取舍是：如果进程在 settlement 前硬中断，尚未提交的 attempt stream 不会成为持久日志。实时显示不等于已经保存。这一选择减少每个 token 都生成顶层事件的成本，但牺牲了 settlement 前的持久证据，详见[设计理由](reference/design-decisions.md)。

## 保存与迁移

Session 服务的内存日志与持久化后端是不同责任。贯穿示例验证内存 Session 和导出追踪，没有挂载磁盘持久化提供方。生产恢复由 SessionPersistence 提供方承担。

历史格式通过相邻迁移转换为当前逻辑格式；只读 open 不发布后继，写 open 在成功验证后旁置版本命名的后继文件，不覆盖已提交前代。自定义持久事件还涉及读取器识别、schema 和格式生成/审查；声明一个 TS 类型不等于完成持久化兼容工作。用[格式状态文档](../../session-format-status.zh.md)核对，不能用产品包版本推断 Session 格式版本。

## 自检与来源

为什么 `todo/write` 会出现在日志里，却不是给模型读的自然语言消息？实时 UI 已显示的内容是否必定可从磁盘恢复？来源：[Session](../../../packages/core/session/README.zh.md)、[todo 源码](../../../packages/todo/tool-todo/src/index.ts)、[session projection](../../../packages/session/session-projection/README.zh.md)。下一章：[工具](07-tools.md)。
