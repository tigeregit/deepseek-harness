# 8. 上下文、模型、技能与压缩

本章回答“插件怎样改变模型所见内容”。先沿输入来源区分责任，再理解缓存和上下文增长的成本。

## 四个不同对象

| 对象 | 主要内容 | 所属机制 |
|---|---|---|
| prompt contribution | 角色、指令、运行时说明 | systemPrompt section/context |
| message history | 用户、助手、工具结果与注入内容 | Session 消息投影 |
| tool declaration | 可调用工具及参数 schema | tools → prompt assembly/header |
| call configuration | provider、model、推理与输出配置 | agent/request → prepareCall |

不要把它们都称为“prompt”，否则很难判断哪项更改影响模型能力、调用端点或会话历史。

## 系统提示词与动态上下文

`ctx.systemPrompt.section()` 注册提示词贡献，按 order/name 和 scope 组合。`context()` 提供运行时上下文贡献，两者有独立的顺序配置。AgentLoop 在接纳阶段渲染它们，再按日志规则保存所见输入。

一次固定的项目规则适合 section。需要随运行改变的时间、工作区说明等，使用拥有其语义的上下文贡献。单次工具发现或异步通知可通过 `agent.inject()` 进入后续接纳，且不单独唤醒空闲 agent。强行把所有动态信息塞进每次变化的 system 文本，会让历史和缓存更难稳定。

系统提示词当前是 `system/message` 历史节点。支持 in-history 更新的路由可以在序列延续时追加更新；其他情况按循环规则整合到头部。清空渲染结果也必须移除之前仍生效的系统内容，不能只在本次请求不传字段。学习时先掌握“日志拥有模型所见状态”，具体能力选择按源码查。

## Skill 与 MCP instruction

Skill 提供可发现的指导内容，loader 工具按需引入内容；它本身不等于一个可执行后端。一个技能可以指导模型使用已有工具，而无需新增工具体。MCP 服务器则提供协议工具、资源和 instructions 等；客户端插件负责把它们接入 Harness 的注册与上下文机制。

实用判断：需要告诉 agent 怎样做一类事，先考虑 skill；需要一个可执行操作，先考虑 tool；需要跨进程共享外部能力，考虑 MCP。它们可以组合，不能仅按“都有文字说明”合并理解。

## 模型适配器的责任

`dsh-llm` 声明消息、stream 与模型能力；适配器把这些转成提供方请求，并把响应转回 StreamChunk。除流式调用外，实际适配器还要提供模型发现、确切模型解析、默认值、取消与错误语义等入口所需要的信息。

`prepareCall()` 把路由能力解析和真正 dispatch 绑定到同一适配器 generation，避免两次之间的设置变化让“按旧能力组装请求，却发到新端点”。更换 provider 是能力替换；在 `agent/request` 选择另一已注册路由则是配置选择。二者要分别处理。

## 上下文增长、KV cache 与压缩

每次工具结果和注入内容都会影响后续模型历史。既要提供足够信息，又要控制增长。稳定的历史前缀有利于提供方缓存复用；提示词、工具声明、配置或压缩导致的真实变化可能改变复用。日志记录使这些变化可解释，但不能保证外部提供方一定命中缓存。

Compaction 是可替换能力：服务提供统一调用，具体提供方做压缩，自动或手动消费方选择触发时点。当前基本提供方在 pre-step 处理压力，并有请求错误的恢复路径。压缩改变后续所见历史，需要持久依据，不能只在临时 messages 数组中删掉几项。

Spill 则处理超长输出，把内容迁移到另一个存储位置并给出可访问依据；它不是自动的语义摘要。附件保存二进制对象身份，文件/会话引用再把相应对象带入上下文。选择这些机制取决于你想缩小历史、缩小单次输出，还是保留可访问的原数据。

## 设计检查与来源

写一个上下文插件前，先回答：内容由谁产生？进入哪次请求？有没有持久依据？属于哪个 scope？是否需要主动唤醒？增长与缓存成本是什么？这些是设计问题，不能只凭注册函数名解决。

来源：[system-prompt](../../../packages/core/system-prompt/README.zh.md)、[agent instructions](../../../packages/context/agent-instructions/README.zh.md)、[skills](../../subsystems/skills.zh.md)、[LLM streaming](../../subsystems/llm-streaming.zh.md)、[compaction](../../../packages/compaction/compaction/README.zh.md)。自检：为什么直接改被冻结请求与注册 section 是不同操作？下一章：[全部扩展方向](09-extension-atlas.md)。
