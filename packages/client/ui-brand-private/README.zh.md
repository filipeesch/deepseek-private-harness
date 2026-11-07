---
description: "私有发行版的侧栏品牌名称，下方显示构建版本。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-private

[English](README.md) | 中文

## 概述

本包让非官方构建的侧栏显示品牌名 `DSH Private`，并在其下方保持构建版本可读。它只占用侧栏的品牌名槽位：鲸鱼标志、浏览器标题和所有图标保持原样。官方构建不受影响，本包也不向模型侧注册任何内容。

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

### 哪些构建使用私有名称

由 `DSH_CLIENT_BUILD_PROFILE` 决定。除 `official` 以外的任何取值都会在侧栏品牌行显示 `DSH Private`，并把本包的文案注册到语言服务。`official` 构建保留上游字标：本包照常加载并注册词典，但不占用任何槽位。

### 品牌行显示什么

展开的品牌行保留外壳的鲸鱼标志，并在下方显示产品名与构建版本，两者均为 11px。点击版本会复制 `version[-commit][-dirty]` 并给出复制成功的确认。没有版本元数据的构建只显示名称。

点击版本绝不会新建会话：版本带有外壳品牌按钮在执行自身动作前会检查的标记。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

该槽位由 `dsh-client-ui-sidebar` 声明为根作用域的单槽位。本包通过 `ctx.slots.inject()` 等待该声明，因此激活顺序无关紧要，声明撤销时占位会随之移除，HMR 也不会留下半注册的品牌。组件通过本包自己的命名空间翻译，该命名空间作为受管副作用与槽位一同注册。

版本格式是从侧栏的外壳回退中复制的，而不是从那里导出的：回退的辅助函数是模块私有的，为一个使用方扩大侧栏的公开接口成本更高。样式表把这 24px 的槽位分为 12px 名称行与 12px 药丸，使 11px 的版本在外壳回退曾使用 6px 徽标的位置仍然可读。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [ui-sidebar](../ui-sidebar/README.zh.md) — 声明 `sidebar.brand.mark` 与 `sidebar.brand.name` 并渲染其回退。
- [ui-brand-official](../ui-brand-official/README.zh.md) — 同一批槽位的官方 profile 占位者。
- [Web 客户端架构](../../../docs/subsystems/web-client.zh.md) — 浏览器插件行如何加载并注册槽位。

-----

<a id="model-experience"></a>
## 模型体验

无。本包只提供浏览器端展示，不会进入任何模型请求。

#### KV 缓存影响

无；本包既不组装也不发送提供商请求。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延期工作

这些限制界定了私有名称的提供方式。它们是当前的包约束，不是品牌方案对比，也不是任务清单。

- **每个构建 profile 只有一个名称** — 需要其他名称的部署应把本包排除在组合之外，而不是配置它。
- **浏览器标题是独立的** — `DSH_CLIENT_TITLE` 在构建期选择文档标题，不经过槽位系统。
- **标志不属于本包** — 鲸鱼来自侧栏回退，本包无法更改它。
- **复制需要指针操作** — 版本药丸位于外壳的品牌行内，外壳为其自身的回退把该行标记为 `aria-hidden`；要让复制控件可用键盘访问，需要外壳在该行之外提供独立控件。
- **确认提示随占位者卸载** — 折叠侧栏会卸载品牌行，因此复制确认会提前结束；版本文本此时已写入剪贴板。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作笔记——点击展开</summary>

None.

</details>
