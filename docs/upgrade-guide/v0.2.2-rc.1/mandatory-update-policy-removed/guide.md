---
kind: upgrade-guide
description: "Desktop no longer queries a mandatory-update policy service; its packaging environment variables, the test-login popup setting, and the blocking update window are removed."
---

# The Desktop mandatory-update policy is removed

English | [中文](guide.zh.md)

## Change

Desktop previously asked a policy service whether the installed version must update, and blocked the workspace with a modal window while it did. The private distribution has no such gate. Updates come only from the configured feed, and a user decides when to install.

Removed with it:

- The `DSH_DESKTOP_MANDATORY_UPDATE_TEST_ORIGIN`, `DSH_DESKTOP_MANDATORY_UPDATE_PROD_ORIGIN`, and `DSH_DESKTOP_MANDATORY_UPDATE_CONFIG` packaging variables, and the `dshMandatoryUpdatePolicy` field in the packaged manifest.
- The Feishu test-login popup and the `updates.allowTestAuthPopupWindow` field of the Desktop `settings.json`. Desktop no longer creates that file at startup; saving an update channel does. An existing field is preserved and ignored.
- The blocking update window and the preload overlay that hosted it.

A `.env.windows`, `.env.macos`, or packaging preset that still sets the removed variables is rejected as an unsupported setting.

## Migration

1. Delete the three `DSH_DESKTOP_MANDATORY_UPDATE_*` lines from `apps/desktop/.env.windows`, `apps/desktop/.env.macos`, and every packaging preset under your packaging configuration directory.
2. Optionally delete `allowTestAuthPopupWindow` from `<userData>/desktop/settings.json`.
3. Confirm: `pnpm run package:desktop:win:x64:unsigned --check` passes without policy settings, and Desktop starts without a policy request.
