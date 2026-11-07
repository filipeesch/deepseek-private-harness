# Proposal

## Why

Every registered Workspace surfaces in the sidebar, the hero picker, and the recent-Workspace fallback, with no way to keep one out of sight. Plugins that own Workspaces on the user's behalf — an integration that registers a directory per webhook source, or any other plugin-managed workspace — therefore either clutter the browsing surface or must avoid the registry. The alternatives today are worse: deleting the registration drops the Session account and strands those Sessions under Ungrouped, and archiving hides individual Sessions rather than the Workspace they belong to.

A durable per-Workspace `hidden` flag, settable when the Workspace is created and afterwards, lets a plugin manage Workspaces without imposing them on the reader's sidebar. A browser-side reveal toggle keeps the reader in control of what they see.

## What Changes

- The durable Workspace record gains a `hidden` boolean, defaulting to `false`. Existing records parse unchanged and no domain version bump or data migration is needed.
- The registry exposes the flag (`Workspace.hidden`) and a durable mutator (`Workspace.setHidden`), and `create` accepts the flag at creation so a plugin can register a Workspace already hidden in one write.
- The Remote Workspace namespace accepts `hidden` on `create`, gains a `setHidden` method, and projects `hidden` on `WorkspaceView` for every Client.
- The sidebar omits a hidden Workspace's group together with its Sessions; those Sessions stay accounted, are never relisted under Ungrouped, and return to their saved positions when the Workspace is revealed. The group holding the Session open in the main view remains visible, and the flat list keeps that Session's row.
- Search follows the reveal toggle strictly: Sessions of hidden Workspaces match only while hidden Workspaces are shown.
- The hero picker and the new-Session recent-Workspace fallback follow the same toggle.
- The sidebar header gains a reveal control whose state is persisted per browser and whose label states the current choice. It appears only while at least one Workspace is hidden or the toggle is already on.
- Hiding is presentation only: it never blocks opening an existing Session, creating a Session in a hidden Workspace, or naming that Workspace explicitly.

## Capabilities

### New Capabilities

- `workspace-visibility`: the durable hidden flag on a Workspace, the API that sets it at creation and afterwards, and how browser surfaces apply it to Workspaces and their Sessions.

### Modified Capabilities

None. The project has no capability inventory yet, so this change introduces the first specification.

## Non-Goals

- No row action for hiding or showing a Workspace. The feature is for plugins and programmatic clients; the sidebar control only reveals.
- No visual marking of a revealed hidden Workspace.
- No change to archive, pin, or Workspace ordering behavior.
- No refactoring of the Workspace registry or the Workspace browser beyond what the feature requires.

## Impact

**Domain** — `packages/workspace/workspace`: record schema, `Workspace` interface, entity mutator, registry `create` signature.

**Remote** — `packages/api/workspace-controller`: request and view types, `create`, a new `setHidden` method, and the feed projection that carries the flag.

**Client** — `packages/api/workspace-controller/src/client`: the Workspace snapshot rows carry the flag. `packages/client/ui-workspace`: tree derivation, flat list, search, picker, navigation fallback, the view store, the header control, and locale dictionaries.

**Other packages** — `packages/experimental/liveshare`: one new `owner-only` endpoint classification row.

**Behavior outside the browser** — no model-visible text, no tool, no prompt, and no session event. A hidden Workspace still reports its Sessions to the Host, so Session lists, Host search projection, and Workspace accounting are unaffected. The durable Workspace format stays additive: a record written before the field exists reads as visible, and the existing schema-default precedent (`archivedSessionIds`, `pinnedSessionIds`) is why no version bump is required.

**Documentation** — the three affected package READMEs (English and Chinese pairs), `docs/subsystems/workspace.md` and its Chinese twin, whose type blocks are checked against the source.
