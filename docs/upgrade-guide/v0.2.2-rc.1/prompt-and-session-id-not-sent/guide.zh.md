---
kind: upgrade-guide
description: "Search API 不再收到用户提示，pi-ai 路由不再收到 Session id，桌面窗口不再拼写检查。"
---

# 提示、Session id 和拼写检查词典不再外发

[English](guide.md) | 中文

## 变更

过去，除非 `sendOriginalQuestion` 为 `false`，`web-deepseek-api` 会在每个 DeepSeek Search API 请求中，把最近一条提示截取前 128 个字符作为 `ori_question` 发送。现在每个请求只发送 `query`、`count` 和 `need_content`，`sendOriginalQuestion` 不再是设置项。已存储的 `sendOriginalQuestion` 值可无错误加载，且没有效果。

过去，`llm-pi-ai` 会把 Session id 传给 pi-ai，后者将其转换成 `x-opencode-session` 等提供方会话亲和请求头，以及 `prompt_cache_key` 等 prompt 缓存键。现在任何 Session id 都不会到达提供方。因此按 Session 路由或缓存的提供方会把每个请求视为互不相关，这可能降低 prompt 缓存命中率。文档中的 `llm-pi-ai/request-headers` 插件钩子仍在本地收到 `sessionId`。

过去，在桌面端输入时 Electron 的拼写检查器可能下载词典。现在桌面主窗口和欢迎窗口设置了 `spellcheck: false`，不会请求词典，拼写错误的单词也不再带下划线。

## 迁移

1. 从 `cordis.yml` 或 profile patch 的 `web-deepseek-api` 行中移除 `sendOriginalQuestion`；保留无害，但已无用。确认：Search API 请求体恰好是 `{"query", "count", "need_content"}`。
2. 如果某个 pi-ai 路由需要 Session 亲和，请接受该代价，或通过 `llm-pi-ai/request-headers` 显式贡献请求头；这会增加外发标识符，应视为有意的选择。
3. 拼写检查无需操作。确认：桌面端输入框中没有红色下划线。
