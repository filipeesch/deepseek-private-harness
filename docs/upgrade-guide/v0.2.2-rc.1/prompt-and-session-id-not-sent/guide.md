---
kind: upgrade-guide
description: "The Search API no longer receives the user's prompt, pi-ai routes no longer receive the Session id, and Desktop windows no longer spellcheck."
---

# The prompt, the Session id, and spellcheck dictionaries are no longer sent

English | [中文](guide.zh.md)

## Change

Previously `web-deepseek-api` sent the latest prompt, cut to 128 characters, as `ori_question` with every DeepSeek Search API request unless `sendOriginalQuestion` was `false`. Now each request sends only `query`, `count`, and `need_content`, and `sendOriginalQuestion` is not a setting. A stored `sendOriginalQuestion` value loads without error and has no effect.

Previously `llm-pi-ai` passed the Session id to pi-ai, which turned it into provider session-affinity headers such as `x-opencode-session` and prompt-cache keys such as `prompt_cache_key`. Now no Session id reaches a provider. Providers that route or cache by Session therefore treat every request as unrelated, which can lower prompt-cache hits. The documented `llm-pi-ai/request-headers` plugin hook still receives `sessionId` locally.

Previously Electron's spellchecker could download dictionaries when you typed in Desktop. Now the Desktop main and welcome windows set `spellcheck: false`, so no dictionary is requested and misspelled words are not underlined.

## Migration

1. Remove `sendOriginalQuestion` from `web-deepseek-api` rows in `cordis.yml` or profile patches; it is harmless but dead. Confirm: a Search API request body is exactly `{"query", "count", "need_content"}`.
2. If a pi-ai route needs Session affinity, accept the cost or contribute an explicit header through `llm-pi-ai/request-headers`; that adds an outbound identifier, so treat it as a deliberate choice.
3. Spellcheck needs no action. Confirm: Desktop shows no red underlines in the composer.
