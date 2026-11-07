# Tasks

## 1. Durable flag in the workspace domain

- [x] 1.1 Add `hidden: z.boolean().default(false)` to `workspaceRecord` in `packages/workspace/workspace/src/spec.ts`, keeping the domain at version 2, and verify with a registry test that a record written without the field parses and reports a visible Workspace after restart.
- [x] 1.2 Extend the `Workspace` interface in `packages/workspace/workspace/src/types.ts` with `hidden` and `setHidden(hidden)`, documenting durability, the `updatedAt` stamp, and that the flag gates no operation; verify `pnpm run typecheck` reports every implementer.
- [x] 1.3 Implement `hidden` and `setHidden` in `packages/workspace/workspace/src/entity.ts` through the existing `mutate` write path, and verify with entity-level tests that hiding and revealing persists, that setting the current value leaves the flag unchanged, and that `updatedAt` advances on a real change.
- [x] 1.4 Replace the trailing `title` parameter of `WorkspaceRegistry.create` with `create(path, options?: { title?: string; hidden?: boolean })` in `packages/workspace/workspace/src/index.ts`, keeping creation idempotent per canonical path and leaving an existing record's flag and title untouched; verify with registry tests covering create-visible, create-hidden, and recreate-an-existing-hidden.
- [x] 1.5 Update `packages/workspace/workspace/tests/workspace.spec.ts` for the new signature and flag, and verify `pnpm --filter @deepseek-ai/dsh-workspace test` passes.

## 2. Remote Workspace namespace

- [x] 2.1 Add `hidden` to `WorkspaceCreateRequest`, a `WorkspaceSetHiddenRequest`/`WorkspaceValue`-shaped response, and `hidden` on `WorkspaceView` in `packages/api/workspace-controller/src/types.ts`; verify `pnpm run typecheck`.
- [x] 2.2 Forward `request.hidden` through `WorkspaceCommands.create` and add `WorkspaceCommands.setHidden` mapping an unknown identity to `workspace/not-found` through `requireWorkspace` in `packages/api/workspace-controller/src/commands.ts`.
- [x] 2.3 Add the `@Remote('setHidden')` method to `WorkspaceController` in `packages/api/workspace-controller/src/index.ts` with JSDoc stating the durability and not-found behavior.
- [x] 2.4 Project `hidden` in both row projections in `packages/api/workspace-controller/src/feed.ts` (`workspaceView` and `changedWorkspaceView`) so the flag travels on the baseline and on every later upsert; verify with a host test that a flag change arrives as one updated row and no removal.
- [x] 2.5 Add the `owner-only` row for `workspace/setHidden` in `packages/experimental/liveshare/src/endpoint-classification.ts` and verify `pnpm --filter @deepseek-ai/dsh-experimental-liveshare test` passes its classification completeness spec.
- [x] 2.6 Extend `packages/api/workspace-controller/tests/workspace-controller.host.spec.ts` with create-hidden, setHidden-unknown-identity, and projection-carries-flag cases, and `tests/remote/workspace.client.ts` with a `hidden: false` default; verify `pnpm --filter @deepseek-ai/dsh-api-workspace-controller test`.
- [x] 2.7 Confirm the Client model needs no change: `ClientWorkspaceModel` merges rows wholesale, so verify `packages/api/workspace-controller/tests/model.client.spec.ts` still passes and add an assertion that an upserted row's `hidden` reaches the snapshot.

## 3. Visibility derivation

- [x] 3.1 Add the pure visibility helper to `packages/client/ui-workspace/src/client/tree.ts`: given the complete Workspace list, the reveal choice, and the selected Session, return the renderable Workspaces plus the set of hidden Workspace Session ids; verify with unit tests in `tests/tree.client.spec.ts` covering hidden, revealed, and open-Session-exception inputs.
- [x] 3.2 Add the search exclusion input to `deriveSearchResults` so Sessions of hidden Workspaces are dropped before matching when they are not revealed, with a test proving a title match on such a Session is absent while unrevealed and present while revealed.
- [x] 3.3 Add the flat-list exclusion in `deriveFlat`/`sessionMemberIds` callers, keeping only the selected Session's row, with a test covering one hidden Workspace holding the selected and an unselected Session.

## 4. Sidebar surfaces

- [x] 4.1 Feed the derivation from `WorkspaceBrowser.tsx`: grouped sections, flat rows, and search results consume the same helper output, and the animation reset key includes the reveal choice; verify with `tests/workspace-browser.client.spec.tsx` cases that a hidden section is absent, that it returns on reveal with its saved order, and that the ungrouped bucket never receives its Sessions.
- [x] 4.2 Keep the open-Session group rendered while its Workspace is hidden and stop rendering it when the selection moves; verify with a component test driving selection across two Workspaces.
- [x] 4.3 Pass the complete Workspace list to `actions.retainAccountKeys` while rendering the filtered one, and verify with a test that hiding and revealing a Workspace preserves its saved per-account Session order and group expansion.

## 5. Reveal control and persisted choice

- [x] 5.1 Add `showHiddenWorkspaces: boolean` initialized to `false` to the view store in `packages/client/ui-workspace/src/client/stores.ts`, keeping the `dsh.workspace.view.v5` key, and read it as `?? false`; verify with `tests/workspace-picker.client.spec.tsx`-style store tests that a persisted blob without the field reads as unrevealed and that a toggle survives remount.
- [x] 5.2 Render the reveal control in the section header of `WorkspaceBrowser.tsx`, present only while a Workspace is hidden or the choice is on, stating the current choice through the localized label and pressed state; verify with component tests for the four combinations of (something hidden) × (revealed).
- [x] 5.3 Add the two new keys to `packages/client/ui-workspace/src/client/locales.ts` for all eight shipped dictionaries and verify `pnpm run verify-client-ui-i18n`.
- [x] 5.4 Make the hero chooser (`WorkspacePicker.tsx`) and the new-Session fallback (`navigation.ts` via `UiWorkspaceService`) honor the same helper output, with an explicit request naming a hidden Workspace still honored; verify with `tests/workspaces-service.client.spec.ts` covering the fallback skipping a hidden most-recent Workspace and a picker test covering omission and reveal.

## 6. Documentation

- [x] 6.1 Update `packages/workspace/workspace/README.md` and `README.zh.md` for the record field, `Workspace.hidden`/`setHidden`, and the `create` options signature, keeping the bilingual pair aligned.
- [x] 6.2 Update `packages/api/workspace-controller/README.md` and `README.zh.md` for the `create` request field, the `setHidden` method, and the row projection.
- [x] 6.3 Update `packages/client/ui-workspace/README.md` and `README.zh.md` for the reveal control, the open-Session exception, and the search/picker/fallback behavior.
- [x] 6.4 Update the `Workspace` type block and the visibility prose in `docs/subsystems/workspace.md` and its `workspace.zh.md` twin, then verify with `pnpm run test:docs`, whose type-block gate compares them to source.
- [x] 6.5 Verify `pnpm run doc-sync` after the README and subsystem edits, or state the exact failing gate and why it is unrelated.

## 7. Verification

- [x] 7.1 Run `pnpm run test:gui` and confirm the client and host GUI suites pass.
- [x] 7.2 Run `pnpm run test:coverage` for the touched packages and confirm per-file coverage holds, adding tests rather than ignores for any uncovered branch.
- [x] 7.3 Run `DSH_SNAPSHOT=replay pnpm run test:web` and confirm the browser smoke pair and replayed scenarios pass, noting that the real-host case self-skips without a key.
- [x] 7.4 Run `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build:check` after the last `build:artifacts`, and report only the commands actually run.
