---
kind: upgrade-guide
description: "Desktop 不再查询强制更新策略服务；其打包环境变量、测试登录弹窗设置和阻塞式更新窗口均已移除。"
---

# Desktop 强制更新策略已移除

[English](guide.md) | 中文

## 变更

Desktop 过去会向策略服务询问已安装版本是否必须更新，并在此期间用模态窗口阻塞工作区。私有发行版没有这种拦截。更新只来自已配置的更新源，由用户决定何时安装。

随之移除：

- 打包变量 `DSH_DESKTOP_MANDATORY_UPDATE_TEST_ORIGIN`、`DSH_DESKTOP_MANDATORY_UPDATE_PROD_ORIGIN` 和 `DSH_DESKTOP_MANDATORY_UPDATE_CONFIG`，以及打包后清单中的 `dshMandatoryUpdatePolicy` 字段。
- 飞书测试登录弹窗，以及 Desktop `settings.json` 中的 `updates.allowTestAuthPopupWindow` 字段。Desktop 启动时不再创建该文件，保存更新渠道时才会创建；已有字段会保留并被忽略。
- 阻塞式更新窗口及承载它的 preload 覆盖层。

仍设置了已移除变量的 `.env.windows`、`.env.macos` 或打包预设，会因“不支持的设置”被拒绝。

## 迁移

1. 从 `apps/desktop/.env.windows`、`apps/desktop/.env.macos` 以及打包配置目录下的每个打包预设中，删除三行 `DSH_DESKTOP_MANDATORY_UPDATE_*`。
2. 可选：从 `<userData>/desktop/settings.json` 删除 `allowTestAuthPopupWindow`。
3. 确认：`pnpm run package:desktop:win:x64:unsigned --check` 在没有策略设置时通过，Desktop 启动时不发出策略请求。
