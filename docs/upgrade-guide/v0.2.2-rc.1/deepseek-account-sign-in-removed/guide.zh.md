---
kind: upgrade-guide
description: "DeepSeek 账号登录、账号设置、Platform 视图、赠金提示、联系表单和 `deepseek-account` 模型路由已移除；DeepSeek 模型只能通过 API Key 使用。"
---

# DeepSeek 账号登录已移除

[English](guide.md) | 中文

## 变更

私有发行版不再登录 DeepSeek 账号。以下包及其插件行已删除：`deepseek-account`、`deepseek-account-platform`、`llm-deepseek-account`、`account-controller` 和 `ui-settings-account`。随之移除的还有账号设置页、内嵌 Platform 用量与充值视图、赠金和额度提示、Desktop 引导覆盖层、飞书“联系我们”表单，以及 `deepseek-account` 模型提供方。

Desktop 的 Welcome 只显示 API Key 表单和**稍后配置**。只要没有配置模型 API Key，Welcome 就会出现；已有密钥时直接打开工作区。

已移除的接口：Remote 的 `account` 命名空间、`session/initializeDefaultModel`、`deepseek-account/*` Host 事件、Desktop 桥接 `dshPlatform`、`dshOnboarding` 和 `dshDesktop.deviceInfo`，以及翻译器提供方 `deepseek-account`。DeepSeek Search 与 Fetch 只发送 API Key。Desktop Host 协议版本为 5，因此在此变更之前构建的运行时会被拒绝。

已有数据仍可加载。指定提供方 `deepseek-account` 的会话可以打开并渲染；在其中发送消息会以 `NO_ADAPTER` 失败，直到选择其他模型。`$DSH_HOME/.credentials.yaml` 中的记录 `deepseek-account-platform/default` 保留在磁盘上，不再使用。针对已移除插件的 profile 补丁行会被忽略。

## 迁移

1. 打开**设置 → 模型**，保存 DeepSeek API Key，并为每个使用过账号提供方的会话重新选择模型。
2. 从 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 和所有 `--patch` 叠加文件中删除 `deepseek-account`、`llm-deepseek-account`、`ui-settings-account` 和 `account-controller` 行。要清除未使用的凭据记录，从 `.credentials.yaml` 中删除其键。
3. 若翻译器的 `provider` 为 `deepseek-account`，改为 `deepseek-official`、`google` 或 `bing`。
4. 更新使用已移除接口的 SDK、Remote 和 Desktop 桥接调用方。
5. 确认：`dsh` 可以启动，Welcome 只在没有密钥时出现，已迁移会话中的消息会到达 API Key 路由。
