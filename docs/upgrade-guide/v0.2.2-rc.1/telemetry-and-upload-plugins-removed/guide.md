---
kind: upgrade-guide
description: "Session telemetry, Desktop product analytics, Session-log upload, plugin inventory upload, the anonymous user id, and their rows, settings, and environment variables are removed."
---

# Telemetry, analytics, and request-upload plugins are removed

English | [中文](guide.zh.md)

## Change

This private distribution sends nothing to external parties except the model, search, plugin, and update requests you configure. The following no longer exist:

- Packages `@deepseek-ai/dsh-session-telemetry`, `-session-telemetry-otel`, `-otel`, `-host-product-telemetry-otel`, `-client-product-analytics`, `-session-log-deepseek`, `-plugin-package-inventory-deepseek`, `-client-ui-settings-session-log`, and `-anonymous-user-id`, and their rows `session-telemetry-otel`, `otel`, `desktop-product-telemetry`, `product-analytics`, `session-log-deepseek`, `plugin-package-inventory-deepseek`, and `ui-settings-session-log`. A patch that targets one of these ids no longer loads.
- The `dsh_session_log` and `dsh_plugin_packages` fields of official DeepSeek requests, the `x-deepseek-harness-user-id`, `-session-id`, and `-compact` headers, and the `$DSH_HOME/.anonymous-user-id` file.
- The Settings → General toggle for Session-log upload and the `productAnalytics` Host Remote.
- The environment variables `DSH_TELEMETRY_DISABLED`, `DSH_TELEMETRY_MODE`, `DSH_TELEMETRY_OTLP_URL`, and `DSH_PRODUCT_ANALYTICS_OTLP_URL`; setting them has no effect.
- `ProfileContext.telemetryDisabledEnv` and the `resolveTelemetryPatch` export of `@deepseek-ai/dsh-app-boot`.

The `/feedback` acknowledgement is now `Feedback recorded for session <id>` without the `Anonymous user:` line. Feedback and message ratings stay in the Session log and are never uploaded. Sessions that contain `session-log-deepseek/delivery-accepted` events still load.

## Migration

1. Delete every patch row in `$DSH_HOME/cordis.patch.yml`, the profile patch, or a `--patch` overlay whose `id` is listed above. Confirm: `dsh` starts without an unknown-row error.
2. Remove the four environment variables from launch scripts and CI; nothing reads them.
3. Delete `$DSH_HOME/.anonymous-user-id` if you want the stored identifier gone.
4. SDK callers that parsed the `Anonymous user:` line of a `/feedback` result read only the Session id from the first line.
5. Remove dependencies on the removed packages from your own `package.json` and imports.
