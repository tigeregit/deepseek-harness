# 练习、解释题与插件验收

本页供学习后自检。先回答再展开答案；能读懂参考答案不等于能独立作答。每题对应一个设计判断，而非背诵函数名。

## 1. Harness 的职责

模型已经能返回工具调用，为什么还需要 Harness？

<details>
<summary>参考答案</summary>

模型提出调用意图；系统仍要校验参数、执行策略与后端、处理取消、记录结果、把结果带入后续请求，并管理状态和生命周期。模型不自动完成这些系统职责。

</details>

## 2. 编译时与运行时

只声明 `Context.studyTerms` 的类型，然后使用它，为什么可能失败？

<details>
<summary>参考答案</summary>

声明合并不生成服务实例。还需要实际提供方及其注册，Consumer 通过 inject 声明运行依赖。静态认识字段与运行时字段可用是两个条件。

</details>

## 3. 依赖与 effect

提供方被卸载后，为什么依赖它的工具应被撤销？如何避免自己创建的计时器残留？

<details>
<summary>参考答案</summary>

持续的 inject 关系让 Consumer 在必需服务消失时卸载，它拥有的注册 effects 随之撤销。原生计时器要放在 ctx.effect 中并返回清理函数。两个异步清理有顺序要求时，在同一个 disposer 内串行 await。

</details>

## 4. 组合顺序

把工具行写在后端行后面能否保证接线？patch 只覆盖一个 config 字段会保留其余字段吗？

<details>
<summary>参考答案</summary>

行位置不保证加载完成顺序，依赖由 inject 决定。patch 的 config 覆盖替换整块，不能假定其余字段递归保留；按实际必需配置准备完整覆盖。

</details>

## 5. 隔离

某个 agent 只看得见自己的工具，能否说明插件无法读取宿主的其他文件？

<details>
<summary>参考答案</summary>

不能。scope 管理感知该机制的贡献，Host 插件仍是受信任的同进程代码。服务 isolate 也只处理实例解析。进程访问限制由 sandbox 等机制承担，并需要实际执行接线。

</details>

## 6. 一次运行

trace 示例有两次模型调用、一次用户输入，为什么是一个 turn？inject 一条消息为何不会自己唤醒 idle agent？

<details>
<summary>参考答案</summary>

第一次 step 调用工具，结果使循环欠一个后续请求；第二次 step 回答，两者属于同一个工作区间。inject 投向后续接纳但不设置 wakeup。followup/steer 具有相应唤醒行为。

</details>

## 7. 日志与显示

UI 已显示一段实时文本，为什么进程硬中断后可能读不到它？为何 todo 日志不自动进入模型历史？

<details>
<summary>参考答案</summary>

实时流是 transient，只有 settlement 后才有对应持久 stream。todo/write 是业务状态事实，消息派生不把所有事件都变成消息。是否向模型注入内容由明确的消息通道与投影决定。

</details>

## 8. 工具返回

设计一个检索工具。无匹配、网络失败、查到条目应分别怎样返回？

<details>
<summary>参考答案</summary>

无匹配是成功业务结果，例如稳定 union 或 null 字段；查到条目返回规范字段；网络失败通常抛基础设施错误，由运行时规范化为 isError。模型文本由 render 生成，程序无需从 prose 解析 id。若日志恢复需要条目状态，另设计持久事件或 presentationMeta，不能假定 value 自动作持久存档。

</details>

## 9. 中间件

只想记录最终结果，应使用哪个事件？为什么 waterfall 忘记 next 有危险？仅替换 content 足以保密规范值吗？

<details>
<summary>参考答案</summary>

用 tools/result 观察已规范化的不可变结果。不调用 next 会短路下游。只替换 content 通常保留程序 value，保密约束需阻止或替换真实可读值，并检查策略阶段。

</details>

## 10. 上下文与扩展选择

“告诉模型怎样使用我们的 API”和“真正调用这个 API”，分别需要什么？

<details>
<summary>参考答案</summary>

指导可以是 skill 或上下文；调用是 tool/provider，外部可复用服务可走 MCP。两者可以组合。上下文还要回答进入哪个请求、由谁记录、属于哪个 scope 以及是否唤醒。

</details>

## 11. 版本

preset 保存后旧会话未获得新工具，为什么未必是 bug？产品包升版是否等于 Session 格式升版？

<details>
<summary>参考答案</summary>

已有 agent 可以保留其旧 revision；新定义和已有绑定是不同状态。产品、Session 格式、projection 缓存版本分别拥有独立意义，按各自的源码与状态记录判断。

</details>

## 12. 测试证据

词条实操全部通过，能否说“真实模型能正确选择工具且 Web UI 已验证”？

<details>
<summary>参考答案</summary>

不能。脚本适配器指定了模型输出；实操验证循环与工具接线、错误和生命周期。没有真实模型/API、浏览器、磁盘或正式 bundle 安装证据，应明确区分。

</details>

## 独立开发题：从文件检索项目术语

不要先复制代码。先写自己的设计：输入是精确词还是模糊查询；配置怎样选择知识源；后端在什么执行世界；输出是单个条目还是列表；无匹配与失败怎样区别；哪些 agent 具有能力；取消和卸载怎样处理；是否要持久收藏与 UI。

验收分三档：**A 全局理解**，能画路径并选择扩展点；**引导实操**，在模板上验证变更并解释失败；**B 独立开发**，能独立定义需求和接口、实现提供方与消费方、验证真实加载和生命周期，若要分发则验证构建后的安装路径。各档不能只凭“运行不报错”判定。

最后解释一个取舍，例如为什么暂不拆成三包，或为什么引入文件服务而不直接读取宿主文件。这是“知其所以然”的实际检验。
