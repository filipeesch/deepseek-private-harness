# Design

## Context

The web client already exposes the brand row as two independent single slots, `sidebar.brand.mark` and `sidebar.brand.name`, declared by the sidebar package. When nothing occupies them, the shell renders its own fallback: the whale mark plus the localized local-build label and, when the build embeds metadata, a stacked `version[-commit][-dirty]` pill.

`ui-brand-official` occupies both slots only when `DSH_CLIENT_BUILD_PROFILE` is `official`. Every other build falls through to the shell fallback, which is why this distribution shows "DSH Local Build".

The document title has three sources: the literal in the web entry HTML, `DSH_CLIENT_TITLE` injected into the client bundle, and a runtime fallback to the same local-build locale key. The build environment resolver already defines an official title and constructs the local environment explicitly.

Desktop copy lives in one locale module with eight locales, where brand texts and application-identity texts share the same string value today.

See `proposal.md` for motivation and `specs/` for the behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Replace the presented product name on the three surfaces the owner selected, without touching any artwork.
- Keep the private brand isolated from upstream-owned UI code so upstream syncs stay cheap.
- Keep official builds byte-for-byte equivalent in brand behavior.
- Keep the version badge affordance, made legible at 11px.

**Non-Goals:**

- Any icon, favicon, installer, or hero change.
- Renaming the packaged application (`productName`, `appId`, data directory, update feed).
- Reworking the sidebar brand row, the official brand package, or the version formatting helper.

## Decisions

### D1 — A new client plugin package owns the private brand name

Introduce `@deepseek-ai/dsh-client-ui-brand-private` under `packages/client/ui-brand-private`, registering the sidebar name occupant for non-official builds.

*Why*: the slot seam already exists for exactly this purpose, the package is additive (no upstream file changes for the brand itself), and the official package keeps owning official builds.

*Alternatives considered*:

- Edit the sidebar fallback directly — smallest diff, but it changes upstream-owned shell code and invalidates the shell's own tests that pin the fallback wording.
- Extend `ui-brand-official` with a private branch — one file, but a package named "official" would ship private branding and every upstream sync would conflict there.
- Change only the shared locale label — the sidebar would still render the 12px label and the 6px badge, so the legibility requirement would not be met.

### D2 — Only the name slot is occupied

The new package registers `sidebar.brand.name` and leaves `sidebar.brand.mark` to the shell fallback.

*Why*: the whale is unchanged by decision, so occupying the mark would mean duplicating existing artwork for no behavioral gain. Leaving the mark fallback also preserves its existing click-to-copy behavior for free.

*Consequence*: the name occupant must reproduce the version badge, its formatting, and its copy behavior. It must mark the badge with the attribute the parent brand button already checks before starting a new session, so a badge click never opens a session.

*Alternative*: occupy both slots for symmetry — rejected, it duplicates artwork and forces the mark occupant to re-implement copy behavior.

### D3 — The name comes from a package-local locale namespace, identical in every locale

The occupant reads the name through its own typed locale dictionary registered by the package; every locale maps the key to the same literal.

*Why*: client UI copy is locale-owned and a hard-coded JSX literal is rejected by the client i18n gate. Keeping one key per locale preserves the option to translate later without changing components.

*Alternative*: reuse the shared local-build key — semantically wrong for a product name and it would change the shell fallback wording, which is deliberately left intact.

### D4 — The gate is "not an official build"

The package registers its occupant unless the client build profile is `official`.

*Why*: identical to the gate the official package already uses, so exactly one occupant can ever exist for each slot, and any future non-official profile inherits the private brand rather than silently falling back to upstream copy.

*Alternative*: add a dedicated `private` profile value — it would require extending the profile resolver, every consumer, and the build record semantics for a distinction nothing else needs.

### D5 — The document title comes from the build environment

The local client build environment gains the private title, so both the initial HTML title and the runtime title derive from one value.

*Why*: the official profile already sets its own title through the same value and overrides it after the local environment is constructed, so the precedence stays intact. One value feeds the HTML transform and the runtime title, with no second source to drift.

*Alternative*: change the shared local-build locale key — it would leave the initial HTML literal untouched and would also change the sidebar fallback wording.

*Caveat*: the development server builds through the repository environment rather than the profile resolver, so the title must be present in both places.

### D6 — Desktop brand keys change; application-identity keys do not

Within each locale, the About product name, welcome title, welcome brand, update title, and startup failure message become the private name; the About menu item, hide, quit, quit confirmation, and open items keep the installed application name.

*Why*: the packaged application keeps `productName` and `appId`, so menu items that name the executable must keep matching it. Only texts that describe the product, not the installed bundle, change.

*Alternative*: change all name occurrences — the application menu would name a bundle the operating system calls something else.

### D7 — Version formatting is duplicated inside the private package

The package formats `version[-commit][-dirty]` itself rather than importing it from the sidebar package.

*Why*: the formatting helper is module-private in the sidebar and exporting it would widen an upstream public surface for a single consumer. Six lines duplicated behind a unit test is the cheaper contract.

*Risk*: the two formatters can drift. Mitigation: a table-driven unit test pins the same cases the sidebar pins.

### D8 — Registration is the standard client-plugin surface

The package ships a browser half with an empty host half, an `apply` that registers the locale namespace and the slot occupant, and the three registration points every client plugin needs: the client tsconfig aggregate, the web-app composition row, and the web-app package dependency. The generated catalogs and package lists follow from those.

*Why*: this is the documented path for a new client plugin; skipping any registration point fails at a different, later stage.

## Risks / Trade-offs

- **Narrow sidebar overflows the version pill** → The pill is sized to its content and the name truncates. A stylesheet test pins the 11px name line, the 12px pill, and the truncation rules; a browser-grade measurement of the minimum expanded width is not part of this change.
- **The badge loses its affordance when the slot is occupied** → The occupant reimplements copy plus the confirmation toast and the "do not start a session" attribute. A unit test drives the click and asserts both outcomes.
- **Upstream sync friction** → The brand package is additive; the build-environment title and the desktop locale strings are upstream-owned and will conflict if upstream edits those lines. Conflicts stay line-local and are resolved in favor of the private side.
- **A new non-official profile silently gets the private brand** → Accepted deliberately; the alternative is a second gate to maintain.
- **Assembled output assertions mention the old label** → Shell component tests exercise the fallback and stay valid; assembled and end-to-end checks that assert the visible title must be updated with the change.
- **Repository rename breaks saved links** → GitHub redirects the old path, but the remote and the documentation references are updated in the same change.

## Migration Plan

1. Land the package, the build-environment title, and the desktop copy together; the occupant replaces the fallback as soon as the composition row loads it.
2. Rename the repository last, after the branch is pushed, so PR links are created against the final URL.
3. Rollback: remove the composition row to restore the shell fallback instantly; reverting the build-environment title and the desktop locale strings restores the previous names. No persisted user data changes, so no data migration is needed.

## Open Questions

- The web app manifest still names the upstream product; it is a name surface but not one the owner selected for this change. It can be decided later without changing this design.
