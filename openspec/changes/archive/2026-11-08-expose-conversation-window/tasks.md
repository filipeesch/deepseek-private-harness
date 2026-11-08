# Tasks

## 1. Public declaration surface

- [x] 1.1 Add the `conversation.window` entry to `SlotFactoryMap` in `packages/client/ui-conversation/src/client/contract/slots.ts`: scope `session-maybe`, occurrence input `{ variant: 'main' | 'embedded' }`, children `{ 'conversation.header': { kind: 'single'; scope: 'session-maybe' } }`, no store, no inject face, no locale. Document it from the host's side: what an occurrence renders, what the variant controls, and that the host provides the Session area rather than a Session identity. Verify `pnpm run typecheck` accepts the declaration and flags a missing `renderSlot` if the component never renders the declared child.
- [x] 1.2 Extend `ConversationHeaderOwnerProps` in the same file with `variant: 'main' | 'embedded'`, and state in its JSDoc which chrome each variant renders. Verify `pnpm run typecheck` reports every `renderSlot('conversation.header', …)` call site that omits the new field.
- [x] 1.3 Move the `conversation.header` declaration out of the `main.conversation` registration in `packages/client/ui-conversation/src/client/apply.ts` and register the new Factory definition beside `registerConversationContent` in the same `slots.inject('main')` generator, so both collapse with the same fiber. Verify `packages/client/ui-conversation/tests/apply-wiring.client.spec.tsx` reports `conversation.header` as declared by the Factory, with `main.conversation` carrying no children.
- [x] 1.4 Regenerate the model-facing catalog with `pnpm run gen-client-catalog` and verify `pnpm run verify-client-catalog` passes, with `conversation.header`'s `declaredBy` reading `factory 'conversation.window' (client-ui-conversation)`.

## 2. The window component and the embedded variant

- [x] 2.1 Add `packages/client/ui-conversation/src/client/skeleton/ConversationWindow.tsx` with a component typed from `FactoryComponentPropsOf<'conversation.window'>`. Move the `settling` / `hero` / `phase` derivation and the root container out of `ConversationMainPanel.tsx` verbatim, render `conversation.header` with the variant and the body Factory with that phase, and reduce `ConversationRoot.tsx` to the single `renderFactorySlot('conversation.window', { variant: 'main' })` call. Verify `packages/client/ui-conversation/tests/skeleton.client.spec.tsx` renders both the header region and the body region for the main variant and that the blank, hero, and active phases still reach the body unchanged.
- [x] 2.2 Branch `packages/client/ui-conversation/src/client/skeleton/ConversationHeader.tsx` on the new owner prop: the main variant keeps the current `<header>` element, its `data-window-drag` marker, its leading seat, and its geometry class; the embedded variant renders a plain container with no leading seat and no drag marker. Verify a component test asserts that an embedded render contains no `[data-conversation-header-leading]` element and no `data-window-drag` marker, and that a main render still contains both.
- [x] 2.3 Add an embedded header class to `packages/client/ui-conversation/src/client/skeleton/ConversationRoot.module.css` that resets the inherited `--dsh-frame-leading-clearance` to zero on its container, and verify with a component test that an embedded header rendered inside an ancestor setting the variable carries the reset while a main header does not.
- [x] 2.4 Verify the shared header seats still reach both variants: a skeleton test registers one entry each in `conversation.session.header.lineage`, `.actions`, `.utilities`, `.corner`, and `.views.actions`, renders each variant, and asserts the entries appear in both.

## 3. Behaviour the specs require

- [x] 3.1 Verify the occurrence binds the Session area around it: the skeleton suite wraps the window in a Session area, asserts the occurrence renders that Session's title and View tabs, then switches the area and asserts the occurrence follows it. Independent simultaneous areas (resident A beside embedded B) are not exercised by this package's harness; the framework seat is the Session provider already used by the subagent Sidebar.
- [x] 3.2 Verify an occurrence rendered with no Session area renders the blank and hero state, including the inert composer, and reports no failure.
- [x] 3.3 Verify the shared per-Session facts: with the main panel and an embedded occurrence both mounted for one Session, a `selectView` from the embedded header changes the View the body renders, and the two occurrences read the same unpinned-View list from the injected sources.
- [x] 3.4 Verify the failure contract through the real renderer: register a header entry that throws while a window occurrence renders, and assert the failure is reported against that entry's slot, the entry is retired, the cell shows the crash face, and the rest of the occurrence — header chrome and body — keeps rendering.

## 4. Package tests and gates

- [x] 4.1 Update `packages/client/ui-conversation/tests/apply-inject.client.spec.tsx` and `packages/client/ui-conversation/tests/apply-wiring.client.spec.tsx` for the moved declaration and the new owner prop, and verify `pnpm --filter @deepseek-ai/dsh-client-ui-conversation test` passes.
- [x] 4.2 Verify `pnpm run test:gui` passes for the touched client suites.
- [x] 4.3 Verify the assembled browser still renders the conversation unchanged: run `DSH_SNAPSHOT=replay pnpm run test:web` and confirm no snapshot drift.
- [x] 4.4 Verify the built artifacts agree with the sources: run `pnpm run build:artifacts` and then `pnpm run build:check`.

## 5. Documentation

- [x] 5.1 Document the new surface in `packages/client/ui-conversation/README.md`, update the matching `.zh.md`, and bump `README.i18n.yaml`. Cover: the window Factory, its two variants, that a host supplies the Session area instead of a Session identity, that the body uses the default View adapter, and that header extensions are global. Verify `pnpm run doc-sync` passes.
- [x] 5.2 Update the Conversation hierarchy tree in `docs/subsystems/slots.md` and `docs/subsystems/slots.zh.md` so the window Factory owns `conversation.header` and calls `conversation.content`. Verify `pnpm run test:docs` passes.
- [x] 5.3 Write a new Agent Note under `.agents/notes/implemented/architecture/` recording the reversal of the rejected alternative in `2026-09-10-component-factories-and-local-slots.md`, the store-scope and no-Session-identity constraints that forced the shape, and the consequences for consumers; add the paired `.zh.md` and `.i18n.yaml`, and add one pointer line to the older note so it no longer reads as the current decision. Verify `pnpm run doc-sync` accepts the note manifest and bilingual pairing.
- [x] 5.4 Confirm no upgrade-guide entry is required: no published entry point, configuration key, wire message, durable format, or CLI surface changes, and `conversation.header` keeps its key, children, and registration. Note the confirmation in the PR description rather than in a guide.

## 6. Follow-up outside this repository

- [x] 6.1 Create the board card for the consumer adoption, describing only what must be done and how to use the new API: replace the hand-built Session header and its prop bag with one `conversation.window` occurrence rendered inside a Session area retained for the task's Session, select `variant: 'embedded'`, keep the existing body-only occurrence only where the chrome is deliberately absent, and delete the compatibility shims that the new surface makes redundant. Verify the card names the exact API and the files to remove, and links back to this change.
