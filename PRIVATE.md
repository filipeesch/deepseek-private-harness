# Private distribution policy

`filipeesch/deepseek-private-harness` tracks `deepseek-ai/deepseek-harness` (remote `upstream`) and stays in sync with it, with one invariant on top: **the application sends nothing to external parties except the model, search, plugin, and update requests the user configures.** No telemetry, analytics, feedback upload, usage identifiers, Session-log upload, account Sign In, or developer-controlled remote policy.

## Removed in this distribution

Keep these removed. Upstream changes to them are dropped during merges.

- Session-log upload (`session-log-deepseek`, `ui-settings-session-log`) and plugin inventory (`plugin-package-inventory-deepseek`) request extensions. The `deepseek-llm-api-extensions` registry stays as an inert seam with no shipped contributor (the SDK request-observation fixture and the LLM replay harness still use it); any new contributor is a new outbound path and is removed in the merge.
- Identity headers `x-deepseek-harness-*`, the `anonymous-user-id` package (and its `$DSH_HOME/.anonymous-user-id` file), and the Session id that `llm-pi-ai` forwarded to pi-ai (provider session-affinity headers and `prompt_cache_key`).
- Session telemetry (`session-telemetry-otel`, `session-telemetry`, `otel`), Desktop product analytics (`product-telemetry-otel`, `product-analytics`, Desktop `track()` calls, the `productAnalytics` Remote), and the `DSH_TELEMETRY_*` / `DSH_PRODUCT_ANALYTICS_OTLP_URL` environment variables with the `ProfileContext.telemetryDisabledEnv` plumbing.
- Web-search `ori_question` and its `sendOriginalQuestion` setting (prompt excerpt sent with searches).
- Electron spellchecking (`spellcheck: false` on the Desktop windows), which downloads dictionaries.
- DeepSeek account Sign In: `deepseek-account`, `deepseek-account-platform`, `llm-deepseek-account`, `account-controller`, `ui-settings-account`, Desktop Welcome sign-in and Platform view, the Feishu contact form.
- Desktop mandatory-update policy and the `download.deepseek.com` update feed.
- Upstream CI and governance in `.github`: every upstream workflow except `private-desktop-release.yml`, the review-ownership and issue-management policies, `dependabot.yml`, issue templates, and the specs and gates that only policed them. Upstream CI needs DeepSeek runners, secrets, and GitHub App credentials; Dependabot PRs would fight upstream syncs; Issues are disabled.

DeepSeek remains an API-key model provider, never the default model or default search provider: the base `agent-default-model` row has no provider or model (the first model the user picks is saved there; headless and webhook entry points fail with a message until one is configured), and `web.searchProvider` is unset (a search fails with a structured error until the user selects a provider). Feedback stays local. Desktop updates come only from this repository's GitHub Releases (Windows x64 today; Linux once Desktop packaging supports it; no macOS builds) through the `private-desktop-release.yml` workflow; a push to `master` that carries a Desktop version without a `v<version>` tag publishes that version.

## CI

`.github/workflows/private-ci.yml` runs on GitHub-hosted runners without secrets for pull requests to `master` and pushes to `master`. Its final job, **`private-ci passed`**, is the required merge check: it needs every other job and fails when any of them failed, was cancelled, or was skipped. Mark exactly that name as required in branch protection or the ruleset. Instrumented coverage, benchmarks, Python SDK runtime, and macOS builds are not ported; unit tests run uninstrumented in four shards.

## Syncing with upstream

Never run `gh repo sync --force`; it resets this repository to upstream and discards every private commit.

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
4. **Changed defaults** for model provider, search provider, or update feed: keep the private defaults.
5. **Unclear whether a change sends data out:** treat it as outbound until the code proves otherwise.
6. **Persisted Session events** whose producer was removed (`feedback/*`, `session-log-deepseek/delivery-accepted`, events naming the `deepseek-account` provider): keep reader support; old sessions must still load ([format rules](docs/session-format-status.md)).
7. **Upstream changes to deleted `.github` files** (workflows, policies, templates, `dependabot.yml`): drop them and keep the deletion.
8. **New upstream workflow:** delete it in the merge commit unless it runs on GitHub-hosted runners without DeepSeek secrets; then port its useful checks into `private-ci.yml` and add any new job to `private-ci passed`'s `needs`.
9. **Upstream gate or spec that reads a deleted workflow:** delete it with the workflow rather than editing it.

## Post-merge audit

Investigate new hits after every merge:

```sh
grep -rhoE 'https?://[a-zA-Z0-9.-]+\.[a-z]{2,}' packages apps native --include='*.ts' --include='*.tsx' --include='*.yml' --exclude-dir=node_modules --exclude-dir=lib --exclude-dir=tests | sort -u
grep -rnE 'productTelemetry|productAnalytics|sessionTelemetry|createEventReporter|deepseekLlmApiExtensions|anonymous-user-id|x-deepseek-harness|deepseekAccount|deepseeksvc|session-log-deepseek|plugin-package-inventory|dsh_session_log|dsh_plugin_packages|ori_question|DSH_TELEMETRY' packages apps --include='*.ts' --include='*.tsx' --include='*.yml' --exclude-dir=node_modules --exclude-dir=lib
```
