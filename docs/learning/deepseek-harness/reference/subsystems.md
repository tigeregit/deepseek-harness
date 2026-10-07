# 子系统地图：全项目覆盖，按需求下钻

本页是参考导航。分组是学习组织方式；具体包的职责、依赖和约定由链接的拥有者维护。你不需要先通读所有分组。

## 主干与运行组合

| 分组 | 负责什么 | 对插件作者的意义 |
|---|---|---|
| [core](../../../../packages/core/README.zh.md) | Agent、Session、tools、system-prompt、scope | 所有方向共用的主干 |
| [boot](../../../../packages/boot/README.zh.md)、[bundle](../../../../packages/bundle/README.zh.md) | 应用启动、profile、配置与安装组合 | 让插件实际进入产品 |
| [preset](../../../../packages/preset/README.zh.md)、[extensions](../../../../packages/extensions/README.zh.md) | agent 组合与运行时扩展 | 能力视图、revision 与动态挂载 |
| [llm](../../../../packages/llm/README.zh.md) | 模型词汇、适配器与调用 | 新模型后端 |
| [guard](../../../../packages/guard/README.zh.md)、[hooks](../../../../packages/hooks/README.zh.md) | 循环/工具策略与外部 hook 桥 | 观察和拦截行为 |

## 执行与工具能力

| 分组 | 负责什么 | 需要注意的关系 |
|---|---|---|
| [fs](../../../../packages/fs/README.zh.md)、[shell](../../../../packages/shell/README.zh.md) | 文件和 shell 的服务、后端、工具 | 同一个执行世界 |
| [subprocess](../../../../packages/subprocess/README.zh.md)、[terminal](../../../../packages/terminal/README.zh.md) | 子进程与持续 PTY | 进程树、范围终止、所有权 |
| [ssh](../../../../packages/ssh/README.zh.md)、[sandbox](../../../../packages/sandbox/README.zh.md) | 远端执行与 OS 进程限制 | 路径和限制的实际接线 |
| [lsp](../../../../packages/lsp/README.zh.md) | 语言服务器与工具 | 工作区、stdio、诊断与取消 |
| [ptc-runtime](../../../../packages/ptc-runtime/README.zh.md) | 程序化工具调用的运行能力 | schema、signal 与外层 transport |
| [web](../../../../packages/web/README.zh.md) | 搜索与获取的后端和工具 | 外部数据、输出上限与凭据 |
| [browser-use](../../../../packages/browser-use/README.zh.md)、[computer-use](../../../../packages/computer-use/README.zh.md) | 浏览器与桌面操作 | 操作词汇与提供方资源 |
| [mcp](../../../../packages/mcp/README.zh.md) | 外部协议工具、资源与上下文 | 连接生命周期与 Harness 适配 |

## 上下文、数据与持久状态

| 分组 | 负责什么 | 插件设计中的问题 |
|---|---|---|
| [context](../../../../packages/context/README.zh.md)、[skill](../../../../packages/skill/README.zh.md) | 指令、引用、时间与技能 | 何时进入哪个请求 |
| [compaction](../../../../packages/compaction/README.zh.md)、[spill](../../../../packages/spill/README.zh.md) | 历史压力与大输出转存 | 改变历史还是保留原始对象 |
| [attachment](../../../../packages/attachment/README.zh.md)、[deliverables](../../../../packages/deliverables/README.zh.md) | 二进制对象与轮次交付物 | 身份、可访问性与展示 |
| [document](../../../../packages/document/README.zh.md) | 文档转换 | Host 资源与转码执行 |
| [session](../../../../packages/session/README.zh.md)、[session-query](../../../../packages/session-query/README.zh.md) | 保存、投影、标题、查询与导出 | 持久事实和派生读取 |
| [storage](../../../../packages/storage/README.zh.md)、[workspace](../../../../packages/workspace/README.zh.md) | 非会话存储与 Workspace 实体 | 数据寿命和领域归属 |
| [settings](../../../../packages/settings/README.zh.md)、[credentials](../../../../packages/credentials/README.zh.md) | 设置与授权材料 | 配置来源、凭据引用 |
| [identity](../../../../packages/identity/README.zh.md)、[telemetry](../../../../packages/telemetry/README.zh.md) | 匿名身份与观测 | 观察结果与业务记录的区别 |

## 协作与产品界面

| 分组 | 负责什么 | 插件设计中的问题 |
|---|---|---|
| [subagent](../../../../packages/subagent/README.zh.md)、[workflow](../../../../packages/workflow/README.zh.md) | 委派与脚本编排 | 父子关系、运行句柄与清理 |
| [jobs](../../../../packages/jobs/README.zh.md)、[schedule](../../../../packages/schedule/README.zh.md) | 后台工作与定时跟进 | 谁继续工作，谁拥有取消 |
| [goal](../../../../packages/goal/README.zh.md)、[plan](../../../../packages/plan/README.zh.md)、[todo](../../../../packages/todo/README.zh.md) | 目标、协作计划与任务列表 | 持久业务状态与驱动机制 |
| [webhook](../../../../packages/webhook/README.zh.md) | 外部事件启动工作 | 可信规则与验证后的触发 |
| [interaction](../../../../packages/interaction/README.zh.md)、[feedback](../../../../packages/feedback/README.zh.md) | 审批、提问、命令与反馈 | 人机协议与能力策略 |
| [host](../../../../packages/host/README.zh.md)、[api](../../../../packages/api/README.zh.md) | Host 服务与远端 BFF | 权威执行与 RPC |
| [client](../../../../packages/client/README.zh.md)、[typert](../../../../packages/typert/README.zh.md) | 浏览器插件与类型图 | 独立编译面、投影、renderer |
| [sdk](../../../../packages/sdk/README.zh.md)、[acp](../../../../packages/acp/README.zh.md)、[python](../../../../python/README.zh.md) | 外部应用驱动与协议载体 | 子进程、事件与活动区间 |

## 支持与深入实现

[experimental](../../../../packages/experimental/README.zh.md)收录可选原型，包括 Agent Teams 等；公开可用不代表稳定性承诺。[test-support](../../../../packages/test-support/README.zh.md)提供真实组合、回放等验证基础；[util](../../../../packages/util/README.zh.md)提供共享低层工具。[native](../../../../native/README.zh.md)拥有 OS 原生执行支持，[benchmarks](../../../../benchmarks)检查性能；Web/desktop/CLI 载体在 [apps](../../../../apps)。

当目标从“添加工具”升级为“替换整套远程执行世界”时，才深入 SSH、subprocess、sandbox 和 native 的协作。保持由需求选择下钻范围。
