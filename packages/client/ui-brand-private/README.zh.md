---
description: "私有发行版的侧栏与首页品牌：产品名称与盾牌标志。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-private

[English](README.md) | 中文

## 概述

本包让非官方构建使用品牌名 `Private DSH` 和自有标志：一块实心盾牌，鲸鱼以透明镂空呈现。它占用侧栏标志、侧栏名称与首页标志三个槽位；浏览器标题与所有安装图标由同一份图形在槽位系统之外渲染。官方构建不受影响，本包也不向模型侧注册任何内容。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## 使用本包

随仓库发布的 Web 与 Desktop 组合默认挂载本插件。它无需配置，也不新增设置项。

### 哪些构建使用私有品牌

由 `DSH_CLIENT_BUILD_PROFILE` 决定。除 `official` 以外的任何取值都会显示 `Private DSH` 与私有标志，并把本包的文案注册到语言服务。`official` 构建保留上游字标与图形：本包照常加载并注册词典，但不占用任何槽位。

### 品牌显示什么

展开的品牌行显示盾牌标志与名称，并在名称下方以 11px 显示构建版本。点击版本会复制 `version[-commit][-dirty]` 并确认复制，绝不会新建会话。没有版本元数据的构建只显示名称。折叠的轨道在展开按钮内显示同一标志，首页在标题前静态显示该标志。

标志是装饰性的。它不带点击行为，因为同一组件也渲染在轨道的展开按钮内，那里若带复制行为会在展开时被触发。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

侧栏把标志与名称声明为根作用域的单槽位，会话包声明首页槽位。本包通过 `ctx.slots.inject()` 等待每个声明，因此激活顺序无关紧要，声明撤销时占位随之移除，HMR 也不会留下半注册的品牌。名称槽位通过本包自己的命名空间翻译，该命名空间作为受管副作用与槽位一同注册。

标志是一个方形视图框：盾牌用前景墨色绘制，鲸鱼是遮罩镂空，因此鲸鱼显示其背后的任意表面，也不会把颜色带入主题。鲸鱼占盾牌宽度的 72%，低于这个比例它在 24px 的行内就不再可辨。版本格式是从侧栏的外壳回退复制的，而不是从那里导出的，因为回退的辅助函数是模块私有的，为一个使用方扩大侧栏的公开接口成本更高。

静态图形由已提交的应用底板渲染，因此站点图标、安装图标、应用图标、托盘图标与安装器锁定图形都携带同一份几何。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [ui-sidebar](../ui-sidebar/README.zh.md) — 声明侧栏标志与名称槽位并渲染其回退。
- [ui-conversation](../ui-conversation/README.zh.md) — 声明首页标志槽位及其动画鱼回退。
- [ui-brand-official](../ui-brand-official/README.zh.md) — 同一批侧栏槽位的官方 profile 占位者。
- [Web 客户端架构](../../../docs/subsystems/web-client.zh.md) — 浏览器插件行如何加载并注册槽位。

-----

<a id="model-experience"></a>
## 模型体验

无。本包只提供浏览器端展示，不会进入任何模型请求。

#### KV 缓存影响

无；本包既不组装也不发送提供商请求。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延期工作

这些限制界定了私有品牌的提供方式。它们是当前的包约束，不是品牌方案对比，也不是任务清单。

- **每个构建 profile 只有一个品牌** — 需要其他名称或标志的部署应把本包排除在组合之外，而不是配置它。
- **浏览器标题是独立的** — `DSH_CLIENT_TITLE` 在构建期选择文档标题，不经过槽位系统。
- **16px 的站点图标无法显示鲸鱼** — 在该尺寸下标志读作带浅色内部的盾牌；鲸鱼大约从 34px 起可辨。
- **复制需要指针操作** — 版本药丸位于外壳的品牌行内，外壳为其自身的回退把该行标记为 `aria-hidden`；要让复制控件可用键盘访问，需要外壳在该行之外提供独立控件。
- **确认提示随占位者卸载** — 折叠侧栏会卸载品牌行，因此复制确认会提前结束；版本文本此时已写入剪贴板。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作笔记——点击展开</summary>

标志几何位于 `src/client/mark.ts`；`apps/desktop/resources/` 下的应用底板为静态图形重复同一份几何，安装器的锁定图形由桌面脚本从该底板渲染。

</details>
