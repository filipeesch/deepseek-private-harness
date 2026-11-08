# Agent Note: The conversation window is a public component factory

Status: implemented

English | [中文](2026-11-08-conversation-window-factory.zh.md)

## Problem

The native conversation window — the strict Session header with its title ancestry, View tabs and their More menu, header actions, header utilities, and right-bar corner, over the assembled body and composer — was composable only by the resident `main.conversation` entry. A plugin that wanted the same window elsewhere had two options, both wrong: render `main.conversation`, a single Slot that is already occupied, or rebuild the header from private pieces.

The second option is what a plugin actually did, and it broke on a minor host release. The Session header entry gained three mandatory injected members and a fifth child Slot; an externally assembled header threw on render and silently degraded to a fragment of itself — no title, no tabs, no utilities. That is not a defect of that consumer. It is the observable cost of depending on a private integration across releases, and the repair belongs on the host side: the window itself has to be publicly renderable.

## Decision

`ui-conversation` registers a `conversation.window` Component Factory beside the existing `conversation.content` Factory. It declares the `conversation.header` Slot and renders it together with a `conversation.content` occurrence, so one occurrence is the whole window. `main.conversation` no longer declares the header; its component calls the Factory with `variant: 'main'`, and the header subtree keeps its key, both children, its single registration, and every contribution registered into it.

The Factory is declared at `session-maybe` scope with no store, no inject face, and no locale. Each of those follows from a constraint rather than a preference:

- **`session-maybe`, because the window renders before a Session exists.** The main panel shows the same chrome and the hero composer while the selected Session is still blank, and an embedded occurrence must survive the same state.
- **No store, because the Conversation store cannot be mounted twice.** The shared handle is pinned to one scope by the registration ledger, and it declares persistence, so an exclusive per-occurrence handle is rejected outright. The handle therefore stays with the `conversation.session` body and the `conversation.session.header` registration, and every header callback — `setPinned`, `open`, `selectView` over the bound store's actions, the roster, the unpinned list, and the More-menu presence flag — keeps living in that registration's inject face. The Factory needs none of it.
- **No inject and no locale, because there is nothing left to inject.** Phase derivation is the only computation the window adds, and it reads the standard `useSession`, `useSessions`, and `useConversation` seats the occurrence already receives.

`conversation.header` gains owner prop `variant: 'main' | 'embedded'`. The main variant renders the resident `<header>` row with the leading global-navigation seat and the `data-window-drag` marker. The embedded variant renders a plain container with the Session header alone, and resets `--dsh-frame-leading-clearance` on that container: the variable is set on the application frame and inherits into any subtree, so omitting the leading seat without clearing it would leave a host panel indented by the main column's shell band.

This reverses the alternative rejected in [the component-factories note](2026-09-10-component-factories-and-local-slots.md), "Move the main Conversation Header into the Factory": its premise was that only the main host renders that header, and a second host that needs the same chrome invalidates it. Both notes stay active — that one owns the Factory mechanism, this one owns which composition the window declares.

The window selects the transcript width handles only for the main variant. An embedded occurrence is sized by the panel it lives in, so handles would misrepresent what they resize.

Header extension points are global to the Factory definition, not per occurrence. A contribution registered into `conversation.session.header.lineage`, `.actions`, `.utilities`, `.corner`, or `.views.actions` renders in the main panel and in every embedded occurrence, including entries the host release adds later. That is the property that makes the surface stable across releases: the consumer renders the window, not the header's internals.

An occurrence binds the Session at its React position and takes no Session identity. A host addresses another Session by providing that Session's area around the occurrence, which is the existing Session-provider capability the subagent Sidebar already uses. The window's body uses the default View adapter; see the rejected alternative below for why a caller-selected adapter cannot be forwarded.

## Alternatives considered

**Widen `conversation.content` with a header flag.** One name fewer, but the body Factory would then own chrome, transcript, and composer, and would carry two orthogonal variant axes: a host may want an embedded window with chrome or an embedded body without it. The subagent Sidebar needs the second, and a drawer needs the first, so one flag cannot express both without a second one next to it.

**Export a `ConversationWindow` React component from the package.** The client export rules keep implementation components internal, and a React value export would still leave the consumer assembling the store, the inject face, and the child-render seats by hand — exactly the private prop bag this change exists to delete. A registration is what supplies those seats.

**Give the Factory the Conversation store.** Rejected by the ledger: a shared handle is pinned to one scope, the Factory must be `session-maybe` for the blank and hero states, and an exclusive per-occurrence handle is refused because the handle declares persistence. A hand-rolled second instance would also desynchronize the View selection and the draft between the main panel and an embedded occurrence.

**Address the Session through the occurrence.** `renderFactorySlot` takes no Session identity by design, and two authorities that can disagree is the reason. The Session-provider capability already answers this need, and a pointer is not plain data the occurrence-props surface may carry.

**Declare a second header Slot under the Factory.** That duplicates the five extension points, and every existing contributor would have to register twice or the two headers would drift. Moving the declaration instead changes one line of ownership and leaves every contribution untouched.

**Let the window forward a caller-selected View adapter to the body Factory.** Not possible at runtime: a local Component selected for one Factory is bound to that occurrence and throws when rendered under another. Passing a Component through occurrence props would also put React values on a surface the client rules reserve for plain data and callbacks. A host that needs its own body adapter keeps composing `conversation.content` directly.

## Consequences

A plugin can render the whole native window, with every registered header extension, through one occurrence and a Session area it already knows how to provide. The host owns the chrome contract; the consumer stops tracking inject faces, child slots, and owner props, and a later release that adds a header extension reaches the embedded window without a consumer change.

The window now owns phase and hero derivation for its own render, which is where that decision belongs now that the main panel no longer computes what it renders. The body-only adapter in the subagent Sidebar keeps its own derivation; unifying the two is deliberately left to a later change.

`conversation.header`'s declaration owner is the Factory definition rather than the `main.conversation` entry, so the generated client Slot catalog reports the new owner. Lifetime in practice is unchanged: definition and entry are registered in the same effect on the same plugin fiber and collapse together. No source-breaking change: the Slot key, its two children, its single registration, and every contributor are untouched.

The window adds no fallback of its own, because the composition already contains failures per cell: a crashing header entry is reported against its slot and retired from its cell; the cell elects any surviving registration, and only a cell with no live entry left shows the crash face, while the rest of the occurrence — the other chrome and the body — keeps rendering. A crash inside the window Component itself reaches the Factory boundary, which reports it against the definition and renders the boundary's own crash face; `renderFactorySlot`'s `fallback` covers only an absent definition, so a host that wants a designed empty state renders it around the occurrence. This is the observable difference from an externally assembled header, where one bad contribution took the whole header down inside the consumer's boundary, unreported.

View facts are shared across occurrences because the View roster, the unpinned list, and the per-Session selection all live above the render position. The composer draft is Session-owned but single-rooted: the editor model mounts one editable root per Session, so two simultaneously mounted composers for one Session contend for it. That is outside the capability rather than discouraged by it, and a host embeds a Session the resident panel is not showing.

The components this change moved were not otherwise refactored: `ConversationSession.tsx` still carries the header, the More menu, the tab measurement, and the body; the width-label heuristic is still inline; the `main` → `main.conversation` → window hops remain. Those are recorded as separate work, not implied by this decision.
