# 9. 全部扩展方向：如何从需求选择机制？

本页是参考地图。你尚未确定插件方向，因此保留所有主要路径，但不要求先掌握每个后端的实现。先描述期望改变的行为，再选扩展点。

## 三个入口的选择

| 入口 | 适合什么 | 需要承担什么 |
|---|---|---|
| 原生 Cordis 插件 | 参与 Harness 服务、事件、上下文与 UI | TypeScript/Node、生命周期、版本与接口 |
| MCP 服务器 | 用外部进程或服务提供协议工具/资源 | MCP 协议与部署、连接、取消、凭据 |
| Python/TS SDK | 从应用侧创建、驱动、观察 agent | 进程协议、会话身份、运行时配置与错误 |

Python 能实现外部 MCP 服务，也能通过 SDK 驱动 Harness；它不是当前项目同进程 Cordis 插件的语言接口。原生插件可以再调用 Python 子进程，但进程生命周期、取消和执行环境都需要明确设计。

## 工具、指令与策略方向

| 需求 | 接入机制 | 前置章节 | 进一步查阅 |
|---|---|---|---|
| 给模型新增动作 | `ctx.tools.register()`、`defineTool` | 3、5、7 | [添加工具](../../cookbook/adding-a-tool.zh.md) |
| 指导模型完成一类任务 | skill 提供方和按需加载 | 8 | [skills](../../subsystems/skills.zh.md) |
| 固定指令、动态工作区内容 | section/context、接纳通道 | 5、6、8 | [system-prompt](../../../packages/core/system-prompt/README.zh.md) |
| 前置允许/拒绝/批准 | pre-execute、approval | 3、7 | [approval](../../subsystems/approval.zh.md) |
| 最终拒绝、保密约束 | guard、结果 value/content 规则 | 7 | [tools](../../../packages/core/tools/README.zh.md) |
| 执行指标、超时和重试 | execute 包装、result 观察 | 3、7 | [扩展实操](../../cookbook/extension-cookbook.zh.md) |
| 无需模型轮次的用户命令 | `ctx.commands` | 3、5 | [commands](../../subsystems/commands.zh.md) |

例如“让模型知道项目术语”可能是 skill/context；“按参数精确查询术语”是 tool；“禁止某类查询”是 policy。三项可以组合，不宜全部写进工具 description 后期待模型自行承担约束。

## 提供方与执行环境方向

| 需求 | 主要服务 | 首先要厘清的事项 |
|---|---|---|
| 新模型后端 | `ctx.llm` adapter | 消息转换、stream、确切模型能力、取消与错误 |
| 新文件后端 | `ctx.fs` | 路径世界、读写意图、与进程工作区一致 |
| shell/远程执行 | shell、subprocess、SSH 提供方 | request/spec、进程树、输出和范围终止 |
| 持久交互终端 | `ctx.terminals` | PTY 所有权、后续读写与回收 |
| 进程限制 | `ctx.sandbox` | OS 实现与执行提供方的启动接线 |
| 浏览器/电脑交互 | browserUse、computerUse | 提供方身份、操作词汇、会话资源 |
| LSP | LSP service/provider/tool | stdio 子进程、根路径、诊断和请求取消 |
| 新会话存储 | SessionPersistence | 句柄、只读/写入、格式校验与迁移 |

选择新 backend 时，先读服务定义，再对照一个已有提供方。不要让 Consumer import 本地提供方的私有类型，否则换后端时就会打破接口分离。需要深挖的拥有者都在[子系统地图](reference/subsystems.md)。

## agent 行为、长期状态与编排方向

持久记忆或业务收藏涉及 Session 事件、投影、外部存储和向模型注入的选择。长期共享知识不一定属于某一个 Session；跨会话存储可由 storage 提供方拥有，再把检索结果通过已记录通道交给模型。

自动压缩使用 compaction seam。后续目标、定时跟进分别由 goals/schedule 及 agent 的公开输入通道驱动。subagent 把工作委派给可替换提供方；workflow 则提供脚本运行和编排，运行句柄由调用方负责 dispose。Agent Teams 处在 experimental 组，为 roster、任务板和 mailbox 提供可选协调能力，不把它当作所有工作流都必须依赖的基础。

这类插件最需要明确“谁拥有正在运行的工作”：调用者、会话、父 agent、后台 job 还是 profile。没有所有权模型，取消与卸载很容易出现残留或误终止。

## UI 与产品集成方向

Host 执行业务并拥有权威状态；Client 通过 RPC/流取得投影并呈现。第三方业务节点需要稳定 id 的事件族、ConversationNodeDefinition 和 keyed renderer。变化要能从持久事件重放，不能假定“最近的未完成节点”就是更新对象。

```text
Host 持久事件
→ Remote 历史/跟随
→ Client 事件窗口
→ Conversation 业务 Context
→ 目标 View 的快照
→ Slot/renderer
```

简单工具可以采用已有 generic 卡片；复杂新业务才需要自己的节点、面板或设置页。Node 服务类型不能直接混入浏览器程序；纯类型 outlet、host/client 独立编译面和 UI locale 都有项目约定。参考[Conversation](../../subsystems/conversation.zh.md)、[Slots](../../subsystems/slots.zh.md)、[设置页指南](../../cookbook/adding-a-settings-card.zh.md)。

## MCP 与 SDK 的数据关系

MCP client 每个服务器一个实例，把发现的工具接入同一个工具流水线；stdio 与 Streamable HTTP 是不同传输。namespace、重连、启动失败与工具刷新属于连接插件；资源使用共享注册服务。本地服务和独立 HTTP 服务都可以提供能力，具体配置见[MCP](../../subsystems/mcp.zh.md)。

Python SDK 在子进程中启动 `dsh --profile sdk`，通过按行 JSON-RPC 通信，必须显式指定 Harness home。低层 prompt 返回入队回执，高层 `Session.run()` 等到整个 agent 下一次 idle，并汇总所拥有的活动区间；不要把一个 `turn/end` 简单视为某条用户 prompt 的唯一答复。详见[Python SDK](../../../python/sdk/README.zh.md)。

## 选型练习

给一个需求写五句话：模型/用户要完成什么；执行靠什么后端；结果存多久；哪些 agent 看见；谁取消和释放工作。然后查本页选机制，再从源码导航进入声明与实现。下一章：[插件实操](10-plugin-workshop.md)。
