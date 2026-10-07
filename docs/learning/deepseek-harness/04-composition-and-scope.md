# 4. 组合、作用域与 preset：谁决定能力集合？

本章把“安装了代码”“启用了插件”“某个 agent 能使用它”拆开理解。学完后，你能判断一个变更影响整个 profile，还是一个 agent 的注册视图。

## 启动时的配置组合

profile 是具名运行组合，保存在 Harness home 下，记录依赖、bundle 顺序和用户 patch。bundle 是贡献配置层及所需代码的分发包。patch 覆盖或插入配置行。插件模块才是真正被 Cordis 挂载的代码。普通库可以作为依赖存在，但没有因此自动获得挂载行为。

默认应用入口包括 web、headless、sdk、sdk-minimal、acp。sdk-minimal 有自己的完整显式树，不经过 base；不能把它看作普通 sdk 删除几行后的别名。

配置层顺序为：profile 列出的各 bundle → profile 用户 patch → home patch → 本次 `--patch`。较后层可以覆盖较前层。覆盖 config 替换整块配置，不是递归合并；只写一个字段可能丢失原配置的其他必需字段。

注意有两种“顺序”：配置层应用有顺序；插件运行时激活由服务依赖决定。前一种顺序不能代替 `inject`。

## Agent preset 是另一个粒度

preset 声明一个 agent 的能力组合。Host 主干和循环保持共享，preset 贡献通过自己的作用域和需要时的服务隔离来组织。当前实现会保留被运行中 agent 使用的旧 preset revision，更新后新的 agent 使用新 revision；修改预设不意味着所有已有 agent 立即得到新能力。

旧可执行 revision 保留在进程内，不是被序列化到 Session 的可执行程序。重启时会根据持久的 preset 身份解析当前配置。因此，要区分“会话知道使用哪个 preset”与“旧代码永远可重现”。详见[当前设计理由](reference/design-decisions.md)。

## scope：可见性与所有权

`agent.ctx` 是进行该 agent 局部注册的重要入口。工具、prompt section 等感知 scope 的注册表按照注册上下文决定贡献的可见性。后代能继承祖先贡献，更近的同名贡献可以遮蔽祖先；祖先监听器能观察后代作用域活动。

这不是对任意服务调用都自动套上的隔离：只有采用作用域原语的注册表和事件才有这些行为。把一个全局可变对象存进普通服务，再通过 `agent.ctx` 访问它，不会自动把其内容分成每个 agent 一份。

scope 也不会绕过服务依赖：创建 scope 的插件应声明该 scope 需要的服务。`createScope` 保留创建者的依赖 API；未声明 tools 的创建者不能通过新 scope 访问 tools。[作用域实验](examples/study-terms/scopes.ts)显式声明了这一依赖，并验证近层遮蔽、兄弟作用域及卸载后的继承视图。

## 服务 isolate 与 scope 的区别

scope 控制参与注册视图的贡献和生命周期；Cordis 的 service isolation/realm 控制不同插件解析到哪个服务实例。preset 内需要独立服务实例的行使用 `isolate` realm。两者都不是 OS 沙箱，也不能防止受信任的 Host 插件直接调用 Node 文件或网络 API。

| 你的需求 | 应先检查什么 |
|---|---|
| 所有 agent 都有同一个工具 | profile 的全局贡献 |
| 一个 agent 有不同工具或 section | agent/preset scope |
| 两组插件各有一个同名服务实例 | 服务隔离 realm |
| 限制工具启动的进程能访问什么 | sandbox/approval 与执行提供方 |
| 修改已安装包或启用 bundle | profile 插件管理与 HMR 状态 |

## HMR 的限制

可逆 effect 是热替换可行的基础，但并不表示每个 profile 都在监听源码。当前 base 默认启用 config-only HMR；headless、SDK、ACP 默认关闭，sdk-minimal 不挂它。是否监听、何时重载，由实际配置决定。替换已安装包可能需要重启进程，不能只用“配置写成功”判断新代码已运行。

## 自检与源码

为什么通过 agent scope 注册工具后，仍不能把这个插件当作沙箱内代码？把后端换成远端实现，需要同时检查文件和进程是否属于同一个执行世界吗？

来源：[app-boot](../../../packages/boot/app-boot/README.zh.md)、[scope](../../../packages/core/scope/README.zh.md)、[preset registry](../../../packages/preset/agent-preset-registry/README.zh.md)、[plugin manager](../../../packages/boot/plugin-manager/README.zh.md)。下一章：[完整运行](05-request-lifecycle.md)。
