# 设计理由：项目为何这样组织？

本页是参考。每项区分项目记录的理由与学习解释，并列出收益、成本和插件开发的后果。只使用当前已实施的记录；归档与提议不能证明当前行为。

## 1. 为什么分开能力定义、提供方与消费方？

项目记录：接口、实现和消费 API 因不同原因、以不同速度变化。分开以后，更换本地 shell 为远程执行不会要求修改模型工具 schema。代价是更多包、配置和注入接线；小型能力没有独立变化需求时不必提前分包。

开发后果：工具依赖服务定义，不 import 具体后端类型。学习解释：接口抽象解决可替换性，Cordis 再解决运行期间依赖的有效性。来源：[Capability seams](../../../../.agents/notes/implemented/architecture/2026-06-13-capability-seams.md)。

## 2. 为什么模型请求从日志派生？

项目记录：另建一个可变消息客户端，会形成第二份对话真相，需要在监听器和错误路径间回滚；随意修改临时请求还会破坏请求重建和缓存解释。Session 拥有日志与派生缓存，循环记录接纳输入、配置和真实变化，再生成冻结请求。

收益是可以检查模型所见输入并恢复，成本是插件必须通过明确通道改变输入，不能任意改已生成请求。学习解释：审计能力来自生成路径的约束，而不只是事后多打一份 log。来源：[Reconstructable requests](../../../../.agents/notes/implemented/architecture/2026-07-05-reconstructable-requests.md)。

## 3. 为什么 system prompt 也是历史消息？

项目记录：系统提示词独立存于 header 时，读取器要组合两份输入来源，提示词变更也和工具/config 变化混在一起；支持历史内更新的模型还需要真正的 system-role 历史节点。当前使用 `system/message`，与其他模型可见内容一同派生。

收益是只有一套历史归属和更新表达；成本是循环必须按路由能力协调提示词替换/追加。开发后果：通过 section 等贡献输入，让循环拥有日志更新。来源：[System prompt as surface node](../../../../.agents/notes/implemented/architecture/2026-09-02-system-prompt-as-surface-node.md)。

## 4. 为什么分开实时 chunk 与持久 settlement？

项目记录：逐 token 顶层事件让序号、遥测、历史与 Client 分发成本随 chunk 数增长。将紧凑 stream 放入成功/失败的 settlement，日志规模主要随 attempt 增长，仍保留已结算流证据；实时 UI 通过进程内流显示。

明确代价：settlement 前硬中断会丢失未结算 attempt 的持久 stream；单个 settlement 也可能较大。学习解释：这是性能、持久粒度和恢复证据间的实际取舍，不是“日志越少越好”。来源：[Embedded assistant streams](../../../../.agents/notes/implemented/architecture/2026-09-01-v2-embedded-assistant-streams.md)。

## 5. 为什么保留旧 preset revision？

项目记录：如果保存 preset 时卸载其拥有的子树，运行中的 agent 会失去工具。registry 拥有 revision 树，agent 保留引用；旧 revision 在最后引用释放后才 dispose。preset 配置统一走普通 Cordis YAML 与 profile patch。

收益是编辑不会意外撤销已有 agent 能力；成本是被引用的旧树保留在内存。开发后果：区分保存成功、新实例激活、已有 agent 的能力和重启后解析。来源：[Declarative presets](../../../../.agents/notes/implemented/architecture/2026-09-18-declarative-agent-presets.md)。

## 6. 为什么已发布 Session 代不能覆盖？

项目记录：持久用户数据需要明确的迁移和发布语义。提供方选择最高规范 generation；相邻迁移负责逻辑转换；写 open 只发布最终后继，不移动、改写或删除前代。保留前代不是承诺降级或 fallback。

成本是需要维护相邻迁移、格式校验和发布过程，不能用“这是 alpha”替代持久兼容责任。开发后果：持久事件变化需要审查，不能用包版本直接推断数据格式。来源：[Released format migrations](../../../../.agents/notes/implemented/architecture/2026-08-31-released-session-format-migrations.md)。

## 7. 为什么 effect 与 scope 一起解释？

当前约定：带 scope 的上下文同时决定注册可见性与所有权，scope dispose 撤销它拥有的注册；服务可达性来自创建者的依赖关系。只改变可见性而不拥有生命周期，会使贡献在一处可用，却被另一处无关拆除。

此项依据是[scope 当前文档](../../../../packages/core/scope/README.zh.md)，不是额外编造的作者动机。学习解释：一个注册要回答“谁看得到”和“谁负责撤销”两个问题，写插件时应同时检查。

## 如何评估一个新设计

问它保留了哪种不变条件，又增加了哪种成本；哪项外部变化应该只影响一个提供方；模型所见内容是否仍可由日志解释；卸载、取消和恢复的责任属于谁。先用这些问题判断，再选择 API。
