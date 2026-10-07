# 3. Cordis：插件如何协作与退出？

本章解释四个共用机制：Context、Service、依赖注入、effect。掌握它们后，具体扩展就有了统一的组织方式。

## 插件不是一个被随时调用的业务函数

典型插件导出 `apply(ctx, config)`，框架在加载时调用它。`apply` 通常注册服务、工具、监听器或其他贡献；之后的业务活动由这些注册项承接。加载完成不代表业务工作全部结束，插件可以持续存在直到卸载。

```ts
export const name = 'study-terms-tool'
export const inject = ['tools', 'studyTerms']
```

这来自贯穿示例：名称用于诊断，`inject` 声明运行需要的服务；完整实现见[工具文件](examples/study-terms/tool.ts)。插件实例对应一个 fiber。一个模块可以被加载为多个实例，不应把“模块文件”和“已挂载实例”混为一谈。

## Context 与服务

`ctx` 提供插件访问服务、监听事件和登记资源的能力，同时把注册关联到插件生命周期。`ctx.tools` 是工具服务，`ctx.llm` 是模型服务，`ctx.studyTerms` 则是示例提供的自有服务。

服务使用 Cordis `Service` 注册。消费方依赖服务名称和定义，而不直接实例化具体提供方。提供方可以是抽象服务的子类，也可以向一个注册表服务注册实现；两种形式都存在，阅读时不要假定所有能力都是单实例子类。

## inject 是持续的依赖关系

插件未获得必需服务时保持 PENDING。依赖就绪后加载；必需服务消失时，插件也卸载，之后服务恢复再加载。配置列表中把某行放在前面，不保证它先完成加载。

学习解释：普通的“构造时传一个对象”主要解决初始依赖；这里还维护运行期间依赖的有效性。如果检索后端消失，框架应撤销依赖它的工具，而不是让工具继续握着一个过期引用。示例验证了这个行为。

## effect 与资源所有权

`ctx.on()` 和工具注册等 API 已把注册关联到 effect。自己创建的计时器、连接、watcher 等资源，则要在 `ctx.effect()` 中返回 disposer。disposer 是释放资源的函数。

```ts ignore-check
ctx.effect(() => {
  const timer = setInterval(doWork, intervalMs)
  return () => clearInterval(timer)
})
```

这是机制示意，`doWork` 和经配置得到的 `intervalMs` 由插件拥有。effect 的正文建立资源，返回函数负责拆除。注册和资源若不随实例卸载，反复加载就可能导致重复监听、泄漏或后台工作残留。

多个异步 disposer 会并发运行，不能假定它们严格串行完成。需要“先停止任务，再关闭连接”的顺序，就放在同一个异步 disposer 中依次 `await`。`fiber.dispose()` 等待其清理并递归卸载子插件；详细约定见[生命周期教程](../../cordis-tutorial/02-lifecycle-and-effects.zh.md)。

## 事件：观察、协作与拦截

| 分发方式 | 本项目学习时应关注的区别 |
|---|---|
| `emit` | 同步通知观察者；分发不等待异步监听完成 |
| `waterfall` | 环绕中间件，监听器用 `next()` 委托；返回下游结果或短路 |
| `parallel` | 等待多个监听器并行处理 |
| `serial` | 等待监听器按序处理 |
| `bail` | 遇到第一个 bail 值停止 |

Cordis waterfall 的名称容易误导：它不是“前一个结果直接当下一个输入”的简单管线。其精确模型是 `next()` 进入下游，返回值沿调用链返回。给异步事件定义的 waterfall 可返回 Promise，调用方需要等待；不能仅凭分发方法名称判断是否有异步等待。

比如观察工具执行的插件要 `return next()`；权限策略在拥有拒绝决策时可以返回 deny。忘记 `next()` 会让下游根本没有运行。事件所属域、参数、返回值和 `@mode` 都是使用约定，应读对应定义。

## 自检

为什么把工具注册写成 `ctx.tools.register(...)` 后，通常无需另外手写注销？如果原生 `setInterval` 不放进 effect，会怎样？如果两个异步 disposer 有先后关系，该如何组织？

验证入口：[verify.ts](examples/study-terms/verify.ts)，官方来源：[Cordis primer](../../cordis-primer.zh.md)、[服务教程](../../cordis-tutorial/03-services.zh.md)。下一章：[组合与作用域](04-composition-and-scope.md)。
