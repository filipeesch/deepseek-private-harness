---
kind: upgrade-guide
description: "DeepSeek account Sign In, its settings, Platform views, bonus notices, the contact form, and the `deepseek-account` model route are removed; DeepSeek models are reached only through API keys."
---

# DeepSeek account Sign In is removed

English | [中文](guide.zh.md)

## Change

The private distribution no longer signs in to a DeepSeek account. These packages and their plugin rows are deleted: `deepseek-account`, `deepseek-account-platform`, `llm-deepseek-account`, `account-controller`, and `ui-settings-account`. Removed with them are the Account settings section, the embedded Platform usage and top-up views, bonus and quota notices, the Desktop introduction overlay, the Feishu "Contact us" form, and the `deepseek-account` model provider.

Desktop Welcome shows only the API-key form and **Set up later**. It opens whenever no model API key is configured. The workspace opens directly when a key exists.

Removed interfaces: the Remote `account` namespace, `session/initializeDefaultModel`, the `deepseek-account/*` Host events, the Desktop bridges `dshPlatform`, `dshOnboarding`, and `dshDesktop.deviceInfo`, and the translator provider `deepseek-account`. DeepSeek Search and Fetch send only the API key. The Desktop Host protocol version is 5, so a runtime built before this change is refused.

Existing data still loads. Sessions that name the provider `deepseek-account` open and render; sending in one fails with `NO_ADAPTER` until you pick another model. The record `deepseek-account-platform/default` in `$DSH_HOME/.credentials.yaml` stays on disk, unused. Profile patch rows for the removed plugins are ignored.

## Migration

1. Open **Settings → Models**, save a DeepSeek API key, and choose a model in each Session that used the account provider.
2. Delete `deepseek-account`, `llm-deepseek-account`, `ui-settings-account`, and `account-controller` rows from `$DSH_HOME/profiles/<profile>/cordis.patch.yml` and any `--patch` overlays. Remove the unused credential record by deleting its key from `.credentials.yaml`.
3. Set the translator `provider` to `deepseek-official`, `google`, or `bing` if it was `deepseek-account`.
4. Update SDK, Remote, and Desktop-bridge callers that used the removed interfaces.
5. Confirm: `dsh` starts, Welcome appears only without a key, and a message in a migrated Session reaches the API-key route.
