---
kind: upgrade-guide
description: "交付的基础组合不再默认使用 DeepSeek 模型或 DeepSeek Search API；模型与搜索提供方都必须由用户选择。"
---

# 没有默认模型，也没有默认搜索提供方

[English](guide.md) | 中文

## 变更

过去，基础组合把 `agent-default-model` 设为 `deepseek-official` / `deepseek-flash`，并把 `web.searchProvider` 设为 `deepseek-search-api`。现在这两行都不携带值。

- `agent-default-model.provider` 和 `model` 是可选的，在两者都设置之前，`ctx.agentDefaultModel.currentSelection()` 返回 `undefined`。新会话在你于 Web 或桌面端模型选择器中选择模型之前没有模型；所选模型会保存为后续会话的默认值。没有模型时发送首条消息会失败，报 `has no provider/model`。新会话的 `dsh --profile headless`，以及不带 `model` 的 webhook 会话请求，会失败并给出需要设置的配置行。恢复的 headless 会话沿用其已记录的选择。不存在默认值时，`ModelCatalog.default` 缺失。
- `web.searchProvider` 未设置，因此在你于设置 → Web 搜索中选择提供方或设置 `searchProvider` 之前，`web_search` 会以结构化的提供方选择错误失败。在此之前不会向任何地方发送查询。Fetch 仍默认为 `http`。

已设置这两项之一的 profile 不受影响。已持久化的会话不受影响。

## 迁移

1. 要恢复旧的模型默认值，在 `$DSH_HOME/cordis.patch.yml` 中添加：
   ```yaml
   - id: agent-default-model
     config: { provider: <route>, model: <model id> }
   ```
   确认：新会话显示该模型，且不带 `--session-id` 的 headless 运行可以启动。
2. 要恢复搜索默认值，在 `web` 行的 `config` 中设置 `searchProvider: <提供方 id>`，或在设置 → Web 搜索中选择提供方。确认：`web_search` 返回结果。
3. `currentSelection()` 或 `ModelCatalog.default` 的调用方需要处理 `undefined`。
