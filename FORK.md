# Privacy fork policy

`filipeesch/deepseek-harness` tracks `deepseek-ai/deepseek-harness` (remote `upstream`) and stays in sync with it, with one invariant on top: **the application sends nothing to external parties except the model, search, plugin, and update requests the user configures.** No telemetry, analytics, feedback upload, usage identifiers, Session-log upload, account Sign In, or developer-controlled remote policy.

## Removed in this fork

Keep these removed. Upstream changes to them are dropped during merges.

- Session-log upload (`session-log-deepseek`) and plugin inventory (`plugin-package-inventory-deepseek`) request extensions.
- Identity headers `x-deepseek-harness-*` and the `anonymous-user-id` package.
- Session telemetry (`session-telemetry-otel`, `session-telemetry`, `otel`) and Desktop product analytics (`product-telemetry-otel`, `product-analytics`, Desktop `track()` calls).
- Web-search `ori_question` (prompt excerpt sent with searches).
- DeepSeek account Sign In: `deepseek-account`, `deepseek-account-platform`, `llm-deepseek-account`, `account-controller`, `ui-settings-account`, Desktop Welcome sign-in and Platform view, the Feishu contact form.
- Desktop mandatory-update policy and the `download.deepseek.com` update feed.

DeepSeek remains an API-key model provider, never the default model or default search provider. Feedback stays local. Desktop updates come only from this fork's GitHub Releases (Windows x64 today; Linux once Desktop packaging supports it; no macOS builds) through the fork-owned `fork-desktop-release.yml` workflow.

## Syncing with upstream

Never run `gh repo sync --force`; it resets the fork and discards every fork commit.

```sh
git fetch upstream
git switch master
git merge upstream/master
git push origin master
```

## What to bring from upstream

Take everything by default — features, fixes, refactors, docs, tests — except changes that conflict with the invariant:

1. **Modify/delete conflict on a removed package or file:** keep the deletion, then check whether upstream moved the outbound behavior elsewhere and remove it there too.
2. **New outbound path** (new host, request field, telemetry consumer, identifier header, remote config or policy fetch): remove it in the merge commit and add it to the list above.
3. **Re-mounted removed row** in a `cordis.patch.yml`: drop the row.
4. **Changed defaults** for model provider, search provider, or update feed: keep the fork's defaults.
5. **Unclear whether a change sends data out:** treat it as outbound until the code proves otherwise.
6. **Persisted Session events** whose producer was removed (`feedback/*`, `session-log-deepseek/delivery-accepted`, events naming the `deepseek-account` provider): keep reader support; old sessions must still load ([format rules](docs/session-format-status.md)).

## Post-merge audit

Investigate new hits after every merge:

```sh
grep -rhoE 'https?://[a-zA-Z0-9.-]+\.[a-z]{2,}' packages apps native --include='*.ts' --include='*.tsx' --include='*.yml' --exclude-dir=node_modules --exclude-dir=lib --exclude-dir=tests | sort -u
grep -rnE 'productTelemetry|productAnalytics|sessionTelemetry|createEventReporter|deepseekLlmApiExtensions|anonymous-user-id|x-deepseek-harness|deepseekAccount|deepseeksvc' packages apps --include='*.ts' --include='*.tsx' --include='*.yml' --exclude-dir=node_modules --exclude-dir=lib
```
