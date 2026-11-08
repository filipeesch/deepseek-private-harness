# Agent Note: 对话窗口是公开的组件 Factory

Status: implemented

[English](2026-11-08-conversation-window-factory.md) | 中文

## Problem

原生对话窗口——带标题层级、View 标签及其 More 菜单、header actions、header utilities 与右侧栏 corner 的严格 Session header，加上组装好的正文与 composer——此前只有常驻的 `main.conversation` entry 能组合出来。想把同一个窗口放到别处的插件只有两个选择，而两个都是错的：渲染 `main.conversation` 这个已被占用的 single Slot，或用私有碎片重建 header。

插件实际走的是第二条路，而它在一次次版本发布中就坏了。Session header entry 新增了三个必需的注入成员和一个第五个子 Slot；外部拼装的 header 在渲染时抛错，并静默降级成自身的碎片——没有标题、没有标签、没有 utilities。那不是该 consumer 的缺陷。那是跨版本依赖私有集成的可见代价，而修复属于宿主侧：窗口本身必须可以被公开渲染。

## Decision

`ui-conversation` 在既有 `conversation.content` Factory 旁注册一个 `conversation.window` Component Factory。它声明 `conversation.header` Slot 并将其与一个 `conversation.content` occurrence 一起渲染，因此一个 occurrence 就是整个窗口。`main.conversation` 不再声明 header；其组件以 `variant: 'main'` 调用该 Factory，而 header 子树保留其 key、两个子 Slot、唯一注册，以及注册进其中的每一个 contribution。

该 Factory 以 `session-maybe` 作用域声明，且没有 store、没有 inject face、没有 locale。这三项分别来自一条约束，而不是偏好：

- **`session-maybe`，因为窗口在 Session 存在之前就要渲染。** 当选中的 Session 仍为空白时，主面板会显示同一套 chrome 与 hero composer，嵌入式 occurrence 也必须熬过同一状态。
- **不带 store，因为 Conversation store 无法被挂载两次。** 共享 handle 由注册账本固定到单一作用域，且声明了持久化，因此按 occurrence 独占的 handle 会被直接拒绝。于是 handle 留在 `conversation.session` 正文与 `conversation.session.header` 注册上，每个 header 回调——`setPinned`、`open`、基于已绑定 store actions 的 `selectView`、roster、未固定列表以及 More 菜单存在标记——继续留在该注册的 inject face 中。Factory 一样都不需要。
- **不带 inject 与 locale，因为已无内容可注入。** 窗口唯一新增的计算是阶段推导，而它读取 occurrence 已经拿到的标准 `useSession`、`useSessions` 与 `useConversation` 座位。

`conversation.header` 获得 owner prop `variant: 'main' | 'embedded'`。main 变体渲染带 leading 全局导航位与 `data-window-drag` 标记的常驻 `<header>` 行。embedded 变体渲染仅含 Session header 的普通容器，并在该容器上重置 `--dsh-frame-leading-clearance`：该变量设置在应用外框上并会继承到任意子树，若只省略 leading 位而不清除它，宿主面板就会被主栏的 shell 带缩进。

这推翻了[组件 Factory 笔记](2026-09-10-component-factories-and-local-slots.zh.md)中被否决的备选方案「把主 Conversation Header 移进 Factory」：其前提是只有主 host 渲染该 header，而第二个需要同一套 chrome 的 host 使该前提不再成立。两篇笔记都保持有效——那一篇拥有 Factory 机制，本篇拥有窗口声明哪一种组合。

窗口只在 main 变体中选用转录宽度拖拽条。嵌入式 occurrence 由所在面板决定尺寸，拖拽条会误报它改变的对象。

header 扩展点属于 Factory 定义，而非单个 occurrence。注册进 `conversation.session.header.lineage`、`.actions`、`.utilities`、`.corner` 或 `.views.actions` 的 contribution 会渲染在主面板与每个嵌入式 occurrence 中，包括宿主后续版本新增的 entry。正是这一性质让该界面跨版本稳定：consumer 渲染窗口，而不是 header 的内部。

occurrence 绑定其 React 位置上的 Session，不接受 Session 标识。宿主通过在 occurrence 周围提供该 Session 的区域来指向另一个 Session，也就是 subagent Sidebar 已在使用的那套 Session-provider 能力。窗口正文使用默认 View adapter；调用方自选 adapter 为何无法转发，见下方被否决的备选方案。

## Alternatives considered

**给 `conversation.content` 增加一个 header 开关。** 少一个名字，但正文 Factory 将同时拥有 chrome、转录与 composer，并携带两个正交的变体轴：宿主可能想要带 chrome 的嵌入式窗口，也可能想要不带 chrome 的嵌入式正文。subagent Sidebar 需要后者，抽屉需要前者，所以一个开关在不配第二个开关时无法同时表达两者。

**从包中导出一个 `ConversationWindow` React 组件。** 客户端导出规则把实现组件保留为内部，而一个 React 值导出仍然会让 consumer 手工拼装 store、inject face 与子渲染座位——正是本次变更要删除的私有 prop bag。提供这些座位的是注册。

**把 Conversation store 交给 Factory。** 账本会拒绝：共享 handle 被固定到单一作用域，Factory 必须为 `session-maybe` 才能覆盖空白与 hero 状态，而按 occurrence 独占的 handle 因声明了持久化而被拒。手写第二个实例还会让主面板与嵌入式 occurrence 之间的 View 选择与草稿失去同步。

**通过 occurrence 传入 Session 标识。** `renderFactorySlot` 设计上不接受 Session 标识，而两个可能互相矛盾的权威正是其理由。Session-provider 能力已经满足该需求，而非纯数据的指针也不属于 occurrence props 界面允许携带的内容。

**在 Factory 下再声明一个 header Slot。** 这会复制五个扩展点，每个既有 contributor 要么注册两次，要么两个 header 彼此漂移。改为移动声明只变更一行归属，且不动任何 contribution。

**让窗口把调用方自选的 View adapter 转发给正文 Factory。** 运行期不可行：为某个 Factory 选定的局部 Component 绑定到该 occurrence，在另一个 occurrence 下渲染会抛错。通过 occurrence props 传 Component 也会把 React 值放到客户端规则保留给纯数据与回调的界面上。需要自有正文 adapter 的宿主继续直接组合 `conversation.content`。

## Consequences

插件可以通过一个 occurrence 加上它本就懂得如何提供的 Session 区域，渲染带全部已注册 header 扩展的整个原生窗口。宿主拥有 chrome 契约；consumer 不再跟踪 inject face、子 Slot 与 owner props，而后续版本新增的 header 扩展无需 consumer 改动即可到达嵌入式窗口。

窗口现在为自己的渲染拥有阶段与 hero 推导，既然主面板不再计算它所渲染的内容，这个决定本就属于那里。subagent Sidebar 中的仅正文 adapter 保留自己的推导；统一两者被刻意留给后续变更。

`conversation.header` 的声明归属从 `main.conversation` entry 变为 Factory 定义，因此生成的客户端 Slot 目录会报告新的归属。实际生命周期不变：定义与 entry 在同一 effect、同一 plugin fiber 上注册，并一同坍缩。没有源码级不兼容变更：Slot key、其两个子 Slot、其唯一注册以及每个 contributor 均未被触碰。

窗口不添加自己的 fallback，因为组合本身已按 cell 收敛失败：崩溃的 header entry 会被报告到其 Slot 并从该 cell 退役；该 cell 会先行选出仍在的注册，只有当一个存活 entry 都不剩时才显示 crash face，同时 occurrence 的其余部分——其他 chrome 与正文——继续渲染。窗口 Component 自身的崩溃会到达 Factory 边界，由边界报告给定义并渲染边界自己的 crash face；`renderFactorySlot` 的 `fallback` 只覆盖定义缺失的情况，因此需要设计化空态的宿主应在 occurrence 外层渲染它。这正是与外部拼装 header 的可见差别：在那种情形下，一个坏 contribution 会在 consumer 自己的边界里带走整个 header，且没有任何报告。

View 相关事实之所以能跨 occurrence 共享，是因为 View 名单、未固定列表与按 Session 的选择都位于渲染位置之上。composer 草稿归 Session 所有但只有一个可编辑根：编辑器模型每个 Session 只挂载一个可编辑根，因此同一 Session 的两个同时挂载的 composer 会争夺它。那属于能力之外，而非被劝阻——宿主应嵌入主面板当前未显示的 Session。

本次变更移动到的组件没有被顺带重构：`ConversationSession.tsx` 仍同时承载 header、More 菜单、标签测量与正文；宽度标签启发式仍在原地；`main` → `main.conversation` → 窗口的两跳仍在。那些被记录为独立工作，并非本决定的隐含内容。
