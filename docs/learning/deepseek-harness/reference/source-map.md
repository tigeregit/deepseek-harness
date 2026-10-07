# 按问题进入源码

本页是源码导航。先读每行的“查什么”，再找给定符号及其测试。源码检出变化后优先以符号定位，避免把旧行号当作持续有效的位置。

| 问题 | 源码入口 | 查什么 |
|---|---|---|
| Agent 的公开能力是什么？ | [Agent](../../../../packages/core/agent/src/index.ts)、[types](../../../../packages/core/agent/src/types.ts) | AgentFactory、AgentHandle、Agent 方法与事件 |
| 谁实现默认驱动？ | [agent.ts](../../../../packages/core/agent-loop/src/agent.ts) | send、preStep、turn、step、prepareRequest、buildRequest |
| 创建与恢复怎样拥有资源？ | [loop index](../../../../packages/core/agent-loop/src/index.ts) | AgentLoop、FactoryOwnership、publish/dispose |
| 入队不等于接纳，如何实现？ | [Inbox](../../../../packages/core/agent-loop/src/inbox.ts) | append/splice/claim 与持久事实 |
| 模型历史从哪来？ | [Session](../../../../packages/core/session/src/index.ts) | append、deriveMessages、requestHeader |
| 持久事实类型在哪里？ | [Session types](../../../../packages/core/session/src/types.ts) | SessionEventMap、Envelope、格式常量 |
| 工具怎样注册与运行？ | [ToolRuntime](../../../../packages/core/tools/src/index.ts) | register、guard、schemas、execute 与 result 通知 |
| 工具类型如何从 schema 推导？ | [schema](../../../../packages/core/tools/src/schema.ts) | defineTool、InferArgs、ValueSchemaSpec |
| 规范值如何进入 PTC？ | [PTC](../../../../packages/core/tools/src/ptc.ts) | run_code、子调用和失败语义 |
| 提示词怎样贡献与排序？ | [SystemPrompt](../../../../packages/core/system-prompt/src/index.ts) | section、context、assemble 与排序 |
| scoped 注册如何继承和清理？ | [scope](../../../../packages/core/scope/src/index.ts)、[store](../../../../packages/core/scope/src/store.ts) | createScope、scopeOf、scopeTarget、ScopedLayers |
| 模型调用的服务是什么？ | [LLM](../../../../packages/llm/llm/src/index.ts) | LlmAdapter、registerAdapter、prepareCall、stream |
| stream 有哪些类型？ | [LLM types](../../../../packages/llm/llm/src/types.ts)、[message](../../../../packages/llm/llm/src/message.ts) | StreamChunk、MessageRoleMap、MessageSourceMap |
| 默认产品怎么组合？ | [base patch](../../../../packages/bundle/base/cordis.patch.yml) | 实际插件行及配置 |
| 配置加载的共享逻辑在哪？ | [app-boot](../../../../packages/boot/app-boot/src/index.ts) | overlay、config dump、startup 与来源配置 |
| 插件管理怎么持久化？ | [operations](../../../../packages/boot/plugin-manager/src/operations.ts) | profile、manifest、安装、失败恢复 |
| preset 怎样保留版本？ | [registry](../../../../packages/preset/agent-preset-registry/src/index.ts) | revision、scope、引用与释放 |
| 自定义持久业务的最小例子？ | [todo tool](../../../../packages/todo/tool-todo/src/index.ts)、[types](../../../../packages/todo/tool-todo/src/types.ts) | todo/write、projection、schema 与 execute |
| 状态投影如何注册？ | [projection](../../../../packages/session/session-projection/src/index.ts) | register、stateOf、snapshot 与 cache |
| 工作区规则怎样进入上下文？ | [agent instructions](../../../../packages/context/agent-instructions/src/index.ts) | 规则发现、贡献、scope 与注入 |
| 技能在哪里实现？ | [skill](../../../../packages/skill/skill/src/index.ts)、[tool-skill](../../../../packages/skill/tool-skill/src/index.ts) | 发现/提供方、加载与上下文 |
| 外部 MCP 怎样变成工具？ | [mcp client](../../../../packages/mcp/mcp-client/src/index.ts)、[tools](../../../../packages/mcp/mcp-client/src/tools.ts) | connection lifecycle、namespace、结果适配 |
| Python SDK 怎样驱动运行时？ | [client.py](../../../../python/sdk/src/deepseek_harness/client.py)、[api.py](../../../../python/sdk/src/deepseek_harness/api.py) | Popen、profile argv、JSON-RPC、run 活动区间 |
| UI 节点怎样从事件构建？ | [Conversation 参考](../../../subsystems/conversation.zh.md) | Definition、稳定 id、target 与 renderer |
| 无密钥测试怎样用真实 loop？ | [testkit](../../../../packages/test-support/agent-loop-testkit/src/index.ts) | prerequisite mounting、create 与 claim |
| 已有工具怎么做加载测试？ | [todo loader test](../../../../packages/todo/tool-todo/tests/loader-composition.spec.ts) | 真实 Loader、Config 和行为验收 |

## 三次阅读法

第一次只看声明和公开方法，回答责任。第二次只沿一个场景的调用链，回答时序。第三次选择异常/取消/卸载测试，回答边界。不要一次把索引里的每个文件通读。

## 原始文档入口

[架构](../../../architecture.zh.md)提供有序地图，[子系统目录](../../../subsystems/README.zh.md)提供约定，[包地图](../../../../packages/README.zh.md)提供能力拥有者，[开发指南](../../../development.zh.md)提供环境与编译结构。它们与本知识库分工：正式资料拥有当前 API，这里拥有你的学习顺序、解释与练习。
