# Proposal

## Why

Only the resident `main.conversation` entry composes the whole native conversation window — the strict Session header (title ancestry, View tabs and their More menu, header actions, utilities, right-bar corner) together with the body — so a plugin that wants the same window in another surface has no public way to get it. Such a plugin must either render `main.conversation`, which is a single occupied Slot, or rebuild the header from private pieces, and that second path broke on a minor host release: the Session header entry gained three mandatory inject members and a fifth child Slot, so an externally assembled header threw on render and silently degraded to a fragment.

## What Changes

- A new `conversation.window` Component Factory (scope `session-maybe`) declares `conversation.header` and renders it together with the existing `conversation.content` Factory, giving any host one reusable occurrence of the whole window.
- The `conversation.header` declaration moves from the `main.conversation` entry to the Factory definition. The Slot key, its two children (`conversation.header.leading`, `conversation.session.header`), and its single registration are unchanged, so every existing contribution still lands.
- `conversation.header` owner props gain `variant: 'main' | 'embedded'`. The embedded variant omits the global-navigation seat, drops the window-drag marker, and clears the main column's frame clearance so the window works inside a drawer or panel.
- `main.conversation` stops declaring `conversation.header` and renders the Factory instead. The phase and hero derivation moves out of `ConversationMainPanel` and into the Factory, which is the only place that now needs it.
- `conversation.content` is unchanged and stays the body-only Factory for hosts that deliberately omit the chrome.
- The Factory declares no store, no inject face, no locale, and no public export. Everything the header needs stays with the `conversation.session.header` registration that already owns it.

## Capabilities

### New Capabilities

- `conversation-window`: the public Factory that composes the native conversation window outside the main panel — what it renders, how its two variants differ, what a host must provide for an occurrence to bind a Session, and why an embedded occurrence keeps the header's registered extensions.

### Modified Capabilities

None. No existing capability in this project covers the Conversation presentation surface; the three current specs cover Workspace visibility and product branding.

## Impact

**Client** — `packages/client/ui-conversation`: the `SlotFactoryMap` and `SlotMap` declarations in `src/client/contract/slots.ts`, the registrations in `src/client/apply.ts`, and the `src/client/skeleton/` components that compose the header and body. `conversation.content`, `conversation.session`, `conversation.view`, the composer, the Chat protocol, and the Conversation assembler are untouched.

**Generated contract** — `packages/extensions/cordis-client-runner/src/client/slot-catalog.ts` records `conversation.header`'s declaration owner, so it must be regenerated with `pnpm run gen-client-catalog` and passes `verify-client-catalog`.

**Consumers** — no source-breaking change. `conversation.header` remains a single Slot with the same key and children, and a plugin that injects into it keeps the same lifetime in practice: the definition and the entry it replaces are both held by the same plugin fiber.

**Documentation** — the `ui-conversation` package README (English, Chinese, and its i18n manifest), the hierarchy tree in `docs/subsystems/slots.md` and its Chinese twin, and a new Agent Note. The Note must record that this change reverses the alternative rejected in `2026-09-10-component-factories-and-local-slots.md` ("Move the main Conversation Header into the Factory"), whose premise was that only the main host renders that header.

**Behavior outside the browser** — none. No model-visible text, no tool, no prompt section, and no session event changes, so no Session format, SDK projection, or snapshot output is affected.

**Out of scope** — refactoring the surrounding components, migrating any consumer plugin, and exposing the View roster or its pin state as a standalone public capability.
