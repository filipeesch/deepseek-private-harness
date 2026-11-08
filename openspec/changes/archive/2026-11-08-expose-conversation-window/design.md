# Design

## Context

The window is composed by exactly one entry today: `main` (keyed, root-scoped, declared by `ui-layout`) renders `main.conversation` (single, `session-maybe`), whose component renders `conversation.header` and then calls the `conversation.content` Factory. `conversation.header` (single, `session-maybe`, owner prop `hideChrome`) declares `conversation.header.leading` (single, `root`) and `conversation.session.header` (single, `session`). The Session header registration owns the five child extension points (`lineage`, `actions`, `utilities`, `corner`, `views.actions`), declares `store: conversationStore`, and supplies `ConversationSessionHeaderInjected` — the View roster, the unpinned-View list, the More-menu presence flag, `setPinned`, `open`, and `selectView`.

Four constraints from the Slot machinery shape the whole design:

- **Declaring is claiming.** One live entry (or one Factory definition) owns a child declaration, and only the owner may render that key. Rendering an undeclared key throws `SlotOwnershipError`, and declaring a key that already has an owner throws at registration. A Factory definition owns its declared children for the lifetime of the definition.
- **A shared store handle is pinned to one scope.** `registerFactory` records the handle's scope and rejects a second scope (`one handle, one scope`). `createConversationStore()` declares persistence, and an exclusive per-occurrence store factory is rejected outright (`exclusive store for factory "…" cannot declare persistence`), so a Factory cannot mint its own instance of this store.
- **`renderFactorySlot` takes no Session identity.** An occurrence inherits the scope binding at its React position, and a pointer to a Session is provided by wrapping the occurrence in the Session area, as `ui-subagent` already does for the body.
- **A caller-selected local Component belongs to the occurrence that selected it.** `useFactorySlot` returns a Component that throws when rendered under a different Factory occurrence, so a local selection cannot be forwarded from one Factory into another.

The recorded architecture note `2026-09-10-component-factories-and-local-slots.md` rejected "move the main Conversation Header into the Factory" on the premise that only the main host renders that header. That premise no longer holds; this design reverses the rejection and must say so in its own Agent Note.

## Goals / Non-Goals

**Goals:**

- One public composition that renders the whole window, obtained without registering into `main.conversation` and without assembling header inputs.
- No new value export from `ui-conversation`. The public surface is the Slot/Factory declaration merge plus one owner-prop field.
- `conversation.header` keeps its key, both children, its single registration, and every child contribution; the only change is who declares it.
- An embedded occurrence drops application chrome and nothing else.
- Failure stays the composition machinery's business: reported and contained, never converted into a quietly reduced header.

**Non-Goals:**

- Refactoring `ConversationSession.tsx`, unifying phase derivation across packages, collapsing the `main.conversation` hop, or splitting `apply.ts`. Explicitly out of scope for this change.
- Migrating any consumer plugin.
- A standalone public View-roster or pin capability.
- Letting a window host override the body's View adapter (see decision 6).
- Changing `conversation.content`, `conversation.session`, `conversation.view`, the composer, the assembler, or anything Host-side.

## Decisions

### 1. A second Factory, not a widened `conversation.content`

A new `conversation.window` Factory (scope `session-maybe`) declares `conversation.header` and renders it together with a `conversation.content` occurrence. The body-only Factory stays public and unchanged.

*Alternatives.* Make `conversation.content` chrome-aware: it gains a second variant axis orthogonal to `variant: 'main' | 'embedded'` (a host may want embedded chrome with the body, or embedded body without chrome), and one component would own chrome, transcript, composer, and statistics. Export a `ConversationWindow` React component: the client export rules keep implementation components internal, and a component export would still need the store, inject, and child-render seats that only a registration receives — precisely the props a consumer cannot build. Let a plugin render `main.conversation`: it is a single, already occupied Slot.

### 2. The Factory declares `conversation.header`; `main.conversation` stops declaring it

The Slot key, its two children, and its single registration do not change. `main.conversation` keeps its own key and its empty-children registration; its component reduces to one `renderFactorySlot('conversation.window', { variant: 'main' })` call.

The observable consequence is the generated catalog: `conversation.header`'s `declaredBy` becomes `factory 'conversation.window' (client-ui-conversation)`. Lifetime is effectively unchanged — the definition and the replaced entry are registered in the same `slots.inject('main')` effect on the same plugin fiber, so they collapse together.

*Alternatives.* Keep the header under `main.conversation` and also declare it on the Factory: two declarations of one key throw at registration. Introduce a parallel header slot under the Factory: that duplicates the five extension points, and every existing contributor would have to register twice.

### 3. The Factory carries no store, no inject face, and no locale

The Factory must be `session-maybe`, because the main panel renders the same window before a Session exists (blank header row plus the hero composer). A `session`-scoped Factory would reject that state. Because the handle is pinned to `session` and cannot be minted per occurrence, the Factory declares no `store`.

Nothing is lost: every header callback stays on the `conversation.session.header` registration, which keeps `store: conversationStore` and its inject face. The Factory's occurrence input is `{ variant }` alone, and its phase derivation reads the standard `useSession`, `useSessions`, and `useConversation` props it already receives.

*Alternatives.* `session`-scoped Factory: loses the blank and hero states. Per-occurrence store factory: rejected by the registry because the handle declares persistence, and a second instance would desynchronize the View selection and the draft that the specs require to stay shared.

### 4. `variant` is an owner prop of `conversation.header`, not a new slot

`ConversationHeaderOwnerProps` becomes `{ variant: 'main' | 'embedded'; hideChrome: boolean }`, passed at the Factory's render site. The header component branches on it: `main` keeps the current `<header>` element with its drag marker, its leading seat, and the main column's geometry; `embedded` renders a plain container without the leading seat.

*Alternatives.* A second header slot: splits the child declarations and duplicates five extension points. A boolean `isEmbedded`: reads worse at the render site and disagrees with the `variant` word the body Factory already uses. Inferring the variant inside the component: no parent-owned signal exists, and inferring from the presence of a frame ancestor would be a layout guess.

### 5. The embedded variant resets frame clearance rather than only omitting the seat

`--dsh-frame-leading-clearance` is set on the application frame and inherits into every descendant subtree, and `.titleRow` derives its inline-start padding from it. An embedded window rendered inside the application tree would therefore inherit the main column's band. The embedded branch clears the variable on its own container in addition to dropping the leading seat and the `data-window-drag` marker.

### 6. The body keeps the default View adapter

The window renders `conversation.content` with no local-slot selection, so the body uses the View the Session's store selects.

Forwarding a caller selection is not available: a local Component selected for one Factory is bound to that occurrence and throws under another, and passing a Component through occurrence input props would put React values on a props surface the client rules reserve for plain data and callbacks. Duplicating the body's child declarations on the window would collide with the content Factory's own declarations of `conversation.session` and the composer keys. A host that needs its own View adapter keeps composing the body directly, as the subagent sidebar does.

### 7. Phase derivation moves from the main panel into the window

The `settling` / `hero` / `phase` computation in `ConversationMainPanel` moves verbatim into the Factory component. This is a consequence of decision 2, not an elective refactor: the main panel no longer computes what it renders.

The subagent body-only adapter keeps its own derivation. Unifying the two is recorded out of scope and belongs to a later change; the specs deliberately say nothing about which derivation wins for the embedded variant.

### 8. Failure stays with the composition's own containment

The window renders its header through ordinary Slot dispatch, so each header cell keeps the containment the Slot system already provides: a crashing entry is reported against that slot and retired from its cell, the cell then elects any surviving registration, and only a cell with no live entry left shows the crash face — while the rest of the occurrence, the other chrome and the body, keeps rendering. The window adds no `try`/`catch` and no fallback of its own, so it cannot silently substitute a smaller header.

Two boundaries exist above that, and neither is the host's fallback: a crash inside the window Component itself reaches the Factory error boundary, which reports it against the definition and renders a `[data-factory-error]` crash face, and `renderFactorySlot`'s `fallback` option covers only an absent definition. A host that wants a designed empty state must render it around the occurrence, not through it.

This is the observable difference from an externally assembled header: there, a crash in one contribution took the whole header with it, in the consumer's own boundary, with no report.

## Risks / Trade-offs

- [The main panel starts depending on a Factory definition] → the definition and `main.conversation` install in the same effect and collapse together; `main.conversation` passes no fallback and renders nothing while the definition is absent, which matches today's collapsed state.
- [Moving a declaration changes the model-facing slot catalog] → regenerate with `pnpm run gen-client-catalog`; `verify-client-catalog` fails until the generated file matches.
- [`main.conversation` loses its only child, so its component no longer needs the `renderSlot` share] → dropping the unused share is part of the change and the wiring spec asserts the new registration shape.
- [An embedded occurrence inherits the frame clearance variable] → handled by decision 5.
- [Two occurrences for the same Session contend for the single composer editor] → out of scope, not merely discouraged: the editor model mounts one editable root per Session, so a second live composer steals it from the first. The capability therefore covers View facts (roster, pin choices, selection) across occurrences, and leaves the draft Session-owned but single-rooted; a host embeds a Session the resident panel is not showing. The limitation predates this change and is recorded in the package README.
- [Anchored popups inside an embedded window] → menus and tooltips already portal to the document body; the host container must not clip them, the same obligation composer slots already carry.
- [The change reverses a recorded architectural decision] → a new Agent Note records the reversal and its reason; the older note gains a pointer to it rather than being edited into disagreement with itself.

## Migration Plan

No durable state, no wire format, and no configuration change: the change is one client package's public declaration surface plus its presentation. Rollback is a revert of the commit. The generated catalog must be regenerated in the same commit as the declaration move, because the freshness gate compares it against source.

## Open Questions

- Whether the subagent body-only adapter should later adopt the window once it needs chrome. Deferrable: it does not change this change's specs, approach, or task breakdown.
