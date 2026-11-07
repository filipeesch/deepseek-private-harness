---
kind: upgrade-guide
description: "会话遥测、桌面产品埋点、Session 日志上传、插件清单上传、匿名用户 id，以及它们的配置行、设置项和环境变量均已移除。"
---

# 遥测、埋点和请求上传插件已移除

[English](guide.md) | 中文

## 变更

本私有发行版除你配置的模型、搜索、插件和更新请求外，不向任何外部方发送数据。以下内容不再存在：

- 包 `@deepseek-ai/dsh-session-telemetry`、`-session-telemetry-otel`、`-otel`、`-host-product-telemetry-otel`、`-client-product-analytics`、`-session-log-deepseek`、`-plugin-package-inventory-deepseek`、`-client-ui-settings-session-log` 和 `-anonymous-user-id`，以及它们的配置行 `session-telemetry-otel`、`otel`、`desktop-product-telemetry`、`product-analytics`、`session-log-deepseek`、`plugin-package-inventory-deepseek` 和 `ui-settings-session-log`。指向这些 id 的 patch 不再能加载。
- 官方 DeepSeek 请求中的 `dsh_session_log` 与 `dsh_plugin_packages` 字段、`x-deepseek-harness-user-id`、`-session-id` 和 `-compact` 请求头，以及 `$DSH_HOME/.anonymous-user-id` 文件。
- 设置 → 通用中的 Session 日志上传开关和 `productAnalytics` Host Remote。
- 环境变量 `DSH_TELEMETRY_DISABLED`、`DSH_TELEMETRY_MODE`、`DSH_TELEMETRY_OTLP_URL` 和 `DSH_PRODUCT_ANALYTICS_OTLP_URL`；设置它们不再有任何效果。
- `ProfileContext.telemetryDisabledEnv` 以及 `@deepseek-ai/dsh-app-boot` 的 `resolveTelemetryPatch` 导出。

`/feedback` 的确认文本现在是 `Feedback recorded for session <id>`，不再包含 `Anonymous user:` 行。反馈与消息评分保留在 Session 日志中，从不上传。包含 `session-log-deepseek/delivery-accepted` 事件的会话仍可加载。

## 迁移

1. 删除 `$DSH_HOME/cordis.patch.yml`、profile patch 或 `--patch` overlay 中 `id` 属于上述列表的所有配置行。确认：`dsh` 启动时不报未知配置行错误。
2. 从启动脚本和 CI 中移除这四个环境变量；没有任何组件读取它们。
3. 如果希望清除已存储的标识符，删除 `$DSH_HOME/.anonymous-user-id`。
4. 曾解析 `/feedback` 结果中 `Anonymous user:` 行的 SDK 调用方，现在只从第一行读取 Session id。
5. 从你自己的 `package.json` 和 import 中移除对已删除包的依赖。
