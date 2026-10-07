# 2. Python/C++ 开发者所需的 TypeScript 与 Node.js

本章只补齐读写本项目插件所需的前置知识。先理解代码如何执行，再学习类型如何约束代码。

## 三个名字，三个职责

JavaScript 是运行时执行的语言；TypeScript 在它之上增加静态类型，通常在执行前移除类型；Node.js 提供服务器侧 JavaScript 运行时及文件、进程、网络等能力。`tsx` 是本项目源码运行使用的工具，帮助 Node 执行 TypeScript；正式包的运行产物与源码入口不是同一回事。

TypeScript 的 `interface` 和 `import type` 不生成相应运行对象。因此声明 `ctx.studyTerms` 的类型不会创建服务；创建服务还需要真实执行的 Cordis 注册。这一点是理解本项目声明合并的基础。

## 最小语法对照

```ts
interface Entry {
  term: string
  definition: string | null
}

const entry: Entry = { term: 'seam', definition: null }
const explain = (value: Entry): string => value.definition ?? '暂未收录'
```

`const` 禁止重新给变量赋值，但不自动冻结对象内容。`string | null` 是联合类型，需要处理两种结果；`??` 只在左侧为 `null` 或 `undefined` 时使用右侧值。箭头函数可以作为回调传递，和 Python 的函数对象、C++ lambda 有相似用途。

| 代码 | 读法 | 本项目中的用途 |
|---|---|---|
| `field?: string` | 字段可省略 | 可选配置、可选上下文 |
| `type A = B | C` | A 是 B 或 C | 决策、事件与结束原因 |
| `readonly field` | 静态限制写入 | 插件不能随意修改贡献或执行身份 |
| `...value` | 展开已有字段 | 包装决策时保留自己不拥有的字段 |
| `class X extends Service` | 类继承服务基类 | 提供运行时能力 |
| `T extends ...`、`<T>` | 泛型约束与参数 | schema 推导、注册表与投影 |

“静态只读”与运行时 `Object.freeze()` 是不同保证。来自模型、文件或网络的输入仍需运行时校验；一个 TypeScript 注解不会让 JSON 自动变得可信。

## ESM 与模块

本项目使用 ESM。`export const name` 是命名导出；`export default` 是默认导出；两者要由对应 import 读取。实际插件入口采用什么导出形式，应遵循 Loader 和包的既有方式。

```ts ignore-check
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from './service.ts'
```

第一个 import 只用于类型。第二个导入真实函数。第三个让类型程序看到该文件的声明合并，同时避免载入不需要的运行时代码。跨包 import 使用包名；本地相对 import 在本仓库源码中使用 `.ts`。`package.json` 的 exports 与构建产物决定正式消费入口。

## Promise、async、await

```ts ignore-check
async function lookup(term: string): Promise<string | null> {
  const result = await fetchDefinition(term)
  return result
}
```

这里的 `fetchDefinition` 是说明用的假定异步函数。调用 `lookup()` 立刻得到 Promise；`await` 等它完成，并在拒绝时抛出异常。`await` 会暂停当前异步函数的后续执行，允许事件循环处理其他任务；它不会把同步 CPU 计算自动变成并行计算。

多个请求、工具、取消通知和卸载可以在等待点交错。这就是为什么“卸载时保证停稳”比“设置一个 stopped 标记”更严格：还需要等待未结束工作完成或取消，并释放其资源。

## 流与取消

`async function*` 产生异步迭代器；消费方用 `for await` 接收分块结果。LLM adapter 使用此方式返回 `StreamChunk`，使 UI 不必等待完整答案。

`AbortController` 发出取消，`AbortSignal` 传递取消状态。把 signal 传给支持取消的 I/O，并在合适位置调用 `signal.throwIfAborted()`。仅仅接收 signal 却从不使用它，不能取消底层工作。

## 声明合并：为什么 ctx 能不断增加字段？

```ts ignore-check
declare module '@deepseek-ai/cordis' {
  interface Context {
    studyTerms: StudyTerms
  }
}
```

这个示意声明把 `studyTerms` 的类型补到同一个 `Context` 接口；`StudyTerms` 是插件定义的服务类。其他插件在类型检查时知道此字段。运行时仍必须存在提供方，并通过 `inject` 建立依赖。编译时认识字段、运行时获得服务是两个协作但独立的步骤。

## 自检与阅读入口

先读示例的[service.ts](examples/study-terms/service.ts)、[provider.ts](examples/study-terms/provider.ts)和[tool.ts](examples/study-terms/tool.ts)，圈出会执行的语句和只存在于类型程序中的声明。暂不运行它们，实操章会给出已验证入口。

自检：`const result = await ...` 是否让进程只能做这一件事？接口声明是否创建了服务？为什么仍需要 JSON schema？下一章：[Cordis](03-cordis.md)。
