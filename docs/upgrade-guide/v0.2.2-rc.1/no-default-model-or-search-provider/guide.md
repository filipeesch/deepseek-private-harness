---
kind: upgrade-guide
description: "The shipped base composition no longer defaults to a DeepSeek model or the DeepSeek Search API; the user must choose both."
---

# No default model and no default search provider

English | [中文](guide.zh.md)

## Change

Previously the base composition set `agent-default-model` to `deepseek-official` / `deepseek-flash` and `web.searchProvider` to `deepseek-search-api`. Now neither row carries a value.

- `agent-default-model.provider` and `model` are optional, and `ctx.agentDefaultModel.currentSelection()` returns `undefined` until both are set. A new Session has no model until you pick one in the Web or Desktop model picker; the pick is saved as the default for later Sessions. A first message sent without a model fails with `has no provider/model`. `dsh --profile headless` for a new Session and webhook Session requests without a `model` fail with a message naming the row to set. A resumed headless Session keeps its recorded selection. `ModelCatalog.default` is absent while no default exists.
- `web.searchProvider` is unset, so `web_search` fails with a structured provider-selection error until you choose a provider in Settings → Web search or set `searchProvider`. No query is sent anywhere before that. Fetch still defaults to `http`.

Profiles that set either value are unchanged. Persisted Sessions are unchanged.

## Migration

1. To restore the old model default, add to `$DSH_HOME/cordis.patch.yml`:
   ```yaml
   - id: agent-default-model
     config: { provider: <route>, model: <model id> }
   ```
   Confirm: a new Session shows that model, and headless runs without `--session-id` start.
2. To restore a search default, set `searchProvider: <provider id>` in the `config` of the `web` row, or pick the provider in Settings → Web search. Confirm: `web_search` returns results.
3. Callers of `currentSelection()` or `ModelCatalog.default` handle `undefined`.
