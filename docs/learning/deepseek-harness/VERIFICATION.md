# 基线、事实依据与验证范围

本页记录这套个人知识库实际采用的依据和执行结果。文档陈述的项目行为由源码及其拥有者支持；已运行的学习实验只支持对应范围。

## 源码基线

仓库：`/workspace/deepseek-harness`。基线提交可通过 `git rev-parse HEAD` 查询。根 package.json 版本：`0.2.1-alpha.1`。知识库日期：2026-10-07。环境：Linux x64、Node.js `v24.19.0`。内容对应当前检出，不以包名或版本推断线上最新状态。

## 实际执行

以下命令均从 `/workspace/deepseek-harness` 运行；知识库检查和 typecheck 脚本也可用其绝对路径直接调用。最终状态以附带输出为据。

| 检查 | 命令 | 证据与范围 |
|---|---|---|
| 准备依赖 | `pnpm install --frozen-lockfile --ignore-scripts` | 成功；未运行依赖构建脚本，未准备完整产品产物 |
| 插件行为 | `node --import tsx/esm docs/learning/deepseek-harness/examples/study-terms/verify.ts` | 8 项 PASS，见 [verification.txt](examples/study-terms/verification.txt) |
| 完整循环追踪 | `node --import tsx/esm docs/learning/deepseek-harness/examples/study-terms/trace.ts` | 一个 turn、两个 step、第二请求含 tool-role 消息，见 [trace.txt](examples/study-terms/trace.txt) |
| 注册作用域 | `node --import tsx/esm docs/learning/deepseek-harness/examples/study-terms/scopes.ts` | 近层遮蔽、兄弟隔离、卸载后继承视图，见 [scopes-verification.txt](examples/study-terms/scopes-verification.txt) |
| 依赖声明构建 | `node node_modules/typescript/bin/tsc -b packages/test-support/agent-loop-testkit/tsconfig.json` | 按仓库项目引用构建示例所需依赖；不是完整产品 build |
| 示例静态类型 | `node docs/learning/deepseek-harness/examples/study-terms/typecheck.mjs` | 六个示例 TS 文件对 Host 声明执行仓库严格配置检查 |
| Markdown 导航与图 | `node docs/learning/deepseek-harness/scripts/check-docs.mjs` | Markdown AST 检查本地链接，Mermaid 实际语法解析，见 [doc-verification.txt](doc-verification.txt) |

## 行为验证对应的断言

查询已知词得到规范对象；未匹配返回正常的 null 结果；数字/空白参数报错；预先取消不会进入 dispatch；最终观察看到规范化错误与成功；卸载包装插件移除监听；提供方消失撤销工具；提供方恢复激活原 Consumer。

独立 scope 实验验证全局、父、子、兄弟的注册视图；scope 创建者显式注入 tools。该实验不验证 OS 安全隔离。循环追踪使用真实 AgentLoop 和内存 Session，脚本适配器固定模型响应。trace.txt 是实验导出的文本，不是持久化提供方保存的 Session 文件。

## 未执行的范围

没有真实模型 API 调用、Web/desktop 浏览器验证、PTC runtime、MCP 外部连接、磁盘 Session 恢复、全仓测试或自定义 bundle 的正式安装/发布。相关章节提供事实解释与官方深入入口，不把它们作为本次已验证结论。

## 验证方法的选择

直接把整个源码图合并进独立 composite 工程会破坏仓库的项目引用与 vendor 编译选项。最终类型检查先按原项目引用构建，再让示例消费这些 Host declarations；保留仓库严格选项，不把依赖源码错误过滤成成功。运行时实验仍通过源码 paths 运行，两种检查各使用自己的解析方式。

文档图使用 JSDOM 支持 Mermaid 的语法解析，未进行 UI 渲染或浏览器测试。本目录不参与正式文档网站；按已确认的中文学习需求，在双语配对清单中单独排除此目录。迁移后的文档检查与示例验证结果见下方。

## 纳入版本控制后的验证

迁移到仓库内后，重新通过示例行为、循环追踪、作用域实验和六个示例文件的严格类型检查。知识库检查通过 20 个 Markdown 文件、205 个本地链接和 5 张 Mermaid 图。示例文件的定向 lint 与暂存差异空白检查通过。

`pnpm run test:docs` 的 21 项检查全部通过，包含双语配对、Markdown 段落格式、文档引用、术语和仓库路径检查。

`pnpm run doc-sync` 完成 42 项检查，其中 41 项通过，包括 Host 构建、文档代码类型检查、文档网站构建和网站测试。文档关系图检查首次因 Node 默认堆内存上限退出；单独执行 `NODE_OPTIONS=--max-old-space-size=4096 pnpm run verify-doc-graphs` 后通过，7 份生成图文档均保持最新。原聚合命令仍记录一次失败，未改写其结果或跳过检查。

Host 构建完成后，执行 `pnpm run lint:contracts-ready`，全仓 lint 通过。

## 后续维护

基线变化时核对[源码导航](reference/source-map.md)中符号及链接，重新运行示例、目标依赖构建、类型和文档检查。外部提供方或产品载体的结果另记录，不能覆盖当前无密钥实验的边界。
