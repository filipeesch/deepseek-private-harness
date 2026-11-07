# Design

## Context

The Workspace registry (`packages/workspace/workspace`) stores one record per Workspace in a domain table and keeps registry-wide state (`workspaceIds` order, `archivedSessionIds`, `pinnedSessionIds`, `defaultWorkspaceId`, `pendingMutation`) in the domain global. Records are projected to Clients by `packages/api/workspace-controller`, whose feed turns durable changes into an opening baseline plus `upsert`/`remove`/`order`/`archived`/`pinned` increments, and whose Client model (`ClientWorkspaceModel`) merges unary echoes with those increments.

Two properties of that existing machinery decide most of this design:

- Workspaces own durable records; Sessions do not. Archive and pin therefore live in the domain global — there is no Session record to carry them. A Workspace attribute belongs on the Workspace record, exactly as `title` does.
- A record write already reaches Clients as an `upsert` (`WorkspaceFeed.changed` parses the changed value), so a record field needs no new frame, no baseline field, and no Client model state.

On the browser side, `packages/client/ui-workspace` derives every grouping from `WorkspaceView[]` (`tree.ts`), reads view choices from a persisted store (`dsh.workspace.view.v5`), and renders the sidebar header from the workspace browsing region. Visibility today is only the archived-Session filter, whose three-way choice is stored as `archivedFilter` and read as a default when absent from a persisted blob.

## Goals / Non-Goals

**Goals:**

- One durable flag, one write path, one place where surfaces derive visibility.
- Zero storage migration and zero changes to the workspace domain version.
- No new feed frame, baseline field, or Client model state.
- The flag reaches every surface that lists Workspaces without duplicating the filter logic per surface.

**Non-Goals:**

- Deciding hiding from Workspace content or path heuristics; the flag is explicit state.
- Any permission or access-control effect: `remoteAccess` filtering continues to decide which rows a Peer may see at all, and the hidden flag is applied on top of that for the owner's browsing surfaces.
- Persisting the reveal choice on the Host. It is a per-browser reading preference, like grouping and the archived filter.

## Decisions

### 1. `hidden` is a field on the Workspace record

`WorkspaceRecord` gains `hidden: z.boolean().default(false)`. Old records parse unchanged, so the domain stays at version 2 — the same precedent as `archivedSessionIds`/`pinnedSessionIds`, which were added defaulted without a version bump.

*Alternative — a registry-global `hiddenWorkspaceIds` list.* It mirrors the archive and pin sets, but those sets exist because Sessions have no record. A global list would need a new `hidden` follow frame, a `WorkspaceBaseline` field, Client model state, and a second write path for one attribute. Rejected as strictly more code for the same behavior.

### 2. The entity owns mutation; creation accepts the flag

`Workspace.hidden` reads the record snapshot and `Workspace.setHidden(hidden)` runs through the entity's existing single write path (`mutate`), which stamps `updatedAt` and prunes invalid account candidates — identical to `setTitle`. `create` gains an options object `create(path, options?: { title?: string; hidden?: boolean })`.

The options object replaces the trailing `title` parameter rather than adding a third positional argument: the existing `title` parameter already has a recorded intent to move to options (its only production caller was removed), and `create(path, title, true)` would be unreadable. In-repo callers pass only a path today, so they compile unchanged.

`create` stays idempotent per canonical path and does not touch the flag of an existing record, matching how it already leaves `title` alone.

*Alternative — `create(path, title?, hidden?)`.* Fewer lines changed, worse call sites, and it entrenches a parameter that is already marked for removal.

### 3. One Remote method for the flag, one field on the wire

`workspace.create` gains an optional `hidden` request field; `workspace.setHidden({ workspaceId, hidden })` is a new method; `WorkspaceView` gains `hidden: boolean`.

`setHidden` is a dedicated verb rather than a generic `update`, because the flag is the only mutable Workspace attribute besides `title`, and a generic update would invite an attributes bag with no second consumer. It maps an unknown identity to the existing `workspace/not-found` failure through the command layer's `requireWorkspace`, like `rename`.

The endpoint needs one `owner-only` row in `packages/experimental/liveshare/src/endpoint-classification.ts`; that table is exhaustive and its spec fails when a route is missing.

### 4. Surfaces share one pure visibility projection

`tree.ts` gains a pure helper that maps the complete Workspace list plus the reveal choice plus (for the sidebar/grouped case) the selected Session to the list of rows a surface should render. Call sites:

- grouped sidebar and flat list (via the browser), including the open-Session exception;
- the hero Workspace chooser;
- the new-Session fallback in `navigation.ts`.

The reveal choice reaches `navigation.ts` through the existing `UiWorkspaceService` construction in the plugin body: the service already receives the view instance's actions, and it also needs a read of the reveal choice. That is the only place the filter leaves the React layer, and it stays a plain value read — no subscription machinery in the service.

Search does not use the grouped projection: it matches on Session titles and identities, so the browser derives the set of hidden Workspace Session ids once and excludes them from `deriveSearchResults` inputs. Filtering the Workspace label map alone would leave hidden Sessions matching by title.

*Alternative — filter inside each component.* Three near-identical predicates over the same inputs, and the flat list and search would drift first.

### 5. The open-Session exception is a render rule, not stored state

The exception is evaluated during derivation from the current main-view Session, exactly like `containsCurrent`. It disappears when the selection moves, when the Session is archived, or when the Workspace is revealed, with no stored state to invalidate.

In the flat list the same rule keeps the selected row, which is the flat equivalent of the group exception. Search intentionally has no exception: a hidden Session matches only while hidden Workspaces are revealed.

### 6. The reveal choice is a persisted preference read as a default

`showHiddenWorkspaces: boolean` joins `WorkspaceViewState`, initialized to `false`. The persist key stays `dsh.workspace.view.v5`: store rehydration replaces state wholesale, so a blob written before the field exists leaves it `undefined`, and the read site applies `?? false` — the same treatment `archivedFilter` already receives.

Bumping to `v6` would follow the literal precedent of the change that introduced `archivedFilter`, but it discards every reader's saved manual orders and group expansion. Keeping the key costs one `?? false` and loses nothing.

### 7. The header control is a reveal control with a relevance condition

A button in the workspace section header toggles the choice and states the current one (localized label plus pressed state). It renders only while at least one Workspace is hidden or the choice is currently on, so an installation that hides nothing keeps today's header. Unlike the add control, it does not depend on a composed slot occupant: it works on data the region already reads.

No row action marks a Workspace hidden. The feature exists for plugins and programmatic clients; the browser only reveals what they hid.

### 8. Hidden is presentation only

Nothing in the registry, the Session controller, or the Workspace controller consults `hidden`. Opening a Session, creating one in a hidden Workspace, reordering, renaming, following, and deleting are unchanged. In particular, `session-controller`'s archived-Session gate stays the only access restriction of this kind.

### 9. Retained view state uses the complete list

`retainAccountKeys` prunes saved expansion and per-account Session orders down to the keys the browser reports. It must receive the complete Workspace list, not the filtered one; otherwise hiding a Workspace silently deletes its saved order and expansion, and revealing it later returns it in the wrong state. The browser already computes both lists, so this is a matter of passing the unfiltered ids.

## Risks / Trade-offs

- **Hiding the only Workspace empties the sidebar** → The existing empty-state placeholder renders, and the reveal control appears as soon as something is hidden, so the way back is adjacent to the emptiness.
- **A plugin hides the Workspace of the Session the reader is using** → The open-Session exception keeps that group and row visible, so the reader never loses the row for the conversation in front of them.
- **Two answers to "where is visibility decided"** (grouped projection vs. search exclusion) → Both derive from the same inputs in `tree.ts`; the search path gets the hidden Session id set from the same helper so the two cannot drift without a test noticing.
- **Flag flips bump `updatedAt`** → Intended: the unary echo and the stream increment resolve by newest `updatedAt`, so the newer row wins either way. The trade-off is that flipping visibility counts as a durable mutation for any consumer that reads `updatedAt` as "content changed"; no consumer currently does. Because the Client keeps the newest row by that value alone, a record mutation now stamps an instant strictly later than the record's previous one: without that, two writes in the same millisecond could tie and a delayed projection of the older write could outrank the newer visibility.
- **Additional header control competes with search, view options, and add** → The relevance condition keeps it absent where the feature is unused, which is also why it is not placed inside the view-options menu: a reader looking at an empty sidebar needs one visible way back.
- **Hidden rows still reach non-owner Clients** → Unchanged and intended: `remoteAccess` filtering already decides row visibility, and the hidden flag is the owner's browsing preference, not an access boundary.

## Migration Plan

No data migration. Existing Workspace records read as visible through the schema default; the first write to any record stamps the field. Rolling back is safe in the sense that an older reader drops the unknown field on rewrite and reports every Workspace as visible — the pre-change behavior.

The only rollback caveat is a persisted browser view blob written by the new build: an older build ignores the unknown `showHiddenWorkspaces` key and keeps the rest of the state.

## Open Questions

None.
