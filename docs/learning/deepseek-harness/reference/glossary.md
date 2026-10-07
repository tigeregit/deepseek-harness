# 术语表与容易混淆的概念

本页用于查阅。解释按本项目语境书写，精确 API 以源码声明为准。

| 术语 | 本项目中的含义 |
|---|---|
| Harness | 管理模型输入、执行、状态和生命周期的运行系统 |
| Agent | 可持续驱动的智能体对象，拥有 Session、输入与状态 |
| AgentLoop | 实现默认执行驱动的具体插件 |
| Context / ctx | 插件使用服务、事件与 effect 的上下文 |
| Plugin module | 可被加载的代码与元信息 |
| Fiber | 一次挂载的插件实例及其生命周期句柄 |
| Service | 由 Cordis 注册、按名称解析的运行时能力 |
| Service Definition | 定义能力约定与词汇的服务角色 |
| Service Provider | 提供或注册具体实现的插件角色 |
| Consumer | 使用服务的角色，例如面向模型的工具 |
| Capability seam | 以上三种角色构成的完整可替换能力 |
| inject（Cordis） | 声明持续的运行时服务依赖 |
| inject（Agent） | 向后续接纳补充上下文，本身不唤醒 idle agent |
| effect | 拥有可撤销注册或资源的生命周期机制 |
| disposer | 释放注册/资源的函数，可能异步 |
| teardown / quiescence | 拆除与达到无未结束工作的状态 |
| profile | Harness home 内具名的可启动组合 |
| bundle | 贡献配置层及所需代码的分发包 |
| patch / overlay | 对配置行作覆盖或插入的配置层 |
| preset | 定义 agent 的插件与能力组合 |
| revision | 当前进程可保留引用的 preset 执行版本 |
| scope | 感知该机制的注册表/事件使用的可见性与所有权范围 |
| isolate / realm | 控制插件解析到哪个服务实例的隔离机制 |
| HMR | 按实际配置协调观察、卸载与重新加载 |
| Session | 事件日志与其模型历史等派生接口 |
| SessionEventMap | 可声明合并的持久事件类型表 |
| seq | Session 内事件的序列身份，非墙上时间 |
| surface | 用于派生模型消息的日志表达与操作 |
| projection | 从事实确定性计算出的历史或状态视图 |
| SessionPersistence | 提供会话保存、读取等操作的能力 |
| Inbox | 尚待接纳的输入及 next-turn/next-step 目标 |
| turn | 零个或多个 step 构成的已打开工作区间 |
| step | 一次模型步骤及该响应的工具处理，可有重试 |
| attempt | 一次实际模型调用尝试 |
| settlement | attempt 结束后提交的成功消息或日志证据 |
| transient | 进程内即时状态，不自动持久 |
| schema | 描述并校验字段、类型等条件的规则 |
| canonical value | 工具返回给程序使用的规范 JSON 值 |
| content block | 模型消息内的文本、图像、工具调用等内容单位 |
| presentationMeta | 从结果投影出的可回放 UI 元数据 |
| waterfall | 用 next 进入下游、结果沿调用链返回的中间件 |
| monotonic guard | 后续普通监听器不能撤销的最终拒绝约束 |
| Native tool calling | 模型直接提出工具名称与参数的模式 |
| PTC | 模型程序调用工具并读取规范值的模式 |
| LlmAdapter | 将 Harness 消息/流转换为提供方协议的适配器 |
| prepared call | 把路由能力与 dispatch 绑定到同一代适配器的调用 |
| KV cache | 模型提供方对历史前缀计算状态的复用机制 |
| compaction | 改变模型历史以处理上下文压力的能力 |
| spill | 将过大输出转存并提供访问依据的机制 |
| skill | 可发现、按需载入的任务指导内容 |
| MCP | 接入外部工具、资源和 instructions 的协议 |
| SDK | 通过协议从应用侧驱动 Harness 的客户端接口 |
| Host / Client | 权威执行与服务端 / 浏览器呈现与本地投影 |
| ConversationNodeDefinition | 将事件族变成稳定业务节点的 Client 贡献 |
| Slot / keyed renderer | 注册 UI 插入位置及按键选择呈现的机制 |
| branded id | 区分语义身份的类型标签，避免不同 id 被混用 |
| declaration merging | TypeScript 合并同一类型表的扩展声明 |
| ESM | 项目使用的 JavaScript import/export 模块体系 |

## 优先记住的区别

**插件与工具**：插件是挂载/贡献单位；工具是注册进去的模型能力，一个插件可以贡献多个工具，也可以完全不贡献工具。

**事件与日志**：运行时事件不都保存；Session 日志也不都进入模型历史。

**模型内容与规范值**：模型读 render 结果，程序读 value；UI 有自己的呈现元数据。改文字不一定改程序值。

**scope 与 sandbox**：scope 选择贡献；sandbox 限制进程行为。Host 插件代码并不因 agent scope 而变成受限代码。

**类型与运行时**：声明合并让编译器知道字段；服务注册让该字段在运行时存在；schema 校验让外部值满足约束。

**产品版本、Session 格式与投影版本**：三种不同版本各有自己的拥有者和兼容意义。
