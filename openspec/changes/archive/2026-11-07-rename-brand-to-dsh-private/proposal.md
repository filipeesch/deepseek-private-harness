# Proposal

## Why

The private distribution still presents itself with upstream product identity. Local builds render "DSH Local Build" in the sidebar and in the browser tab, and the desktop application shows "DeepSeek Harness" in the About panel, the welcome screen, update titles, and startup failures. Users of this distribution cannot tell the private build apart from upstream, and the privacy-oriented purpose of the distribution is not reflected in the name they see.

The requested artwork change was explored and rejected: the whale mark stays exactly as it is on every surface, so this change is limited to the product name and to the layout of the version badge that sits under it.

## What Changes

- The sidebar brand row renders **DSH Private** in place of the localized local-build label, with the build version stacked beneath it. Name and version are both 11px; the version keeps the existing inverted pill.
- The sidebar brand **mark** keeps the shell fallback (the whale). No mark occupant, no new glyph, no artwork file.
- The document title (browser tab and window title) becomes **DSH Private** for local builds, sourced from the build environment rather than from a hard-coded HTML literal.
- Desktop visible brand texts become **DSH Private** in all eight shipped locales: the About panel product name, the welcome title and welcome brand, the update title, and the startup-failure message.
- Desktop application-identity strings keep **DeepSeek Harness** because `productName` and `appId` stay unchanged; menu items that name the executable would otherwise disagree with the installed application.
- A new client plugin package owns the sidebar name occupant and its locale namespace, gated to non-official builds so official builds keep the upstream brand.
- The repository is renamed to `dsh-private`, updating the Git remote and the private-distribution documentation.
- Icons are untouched: favicon, PWA install icons, desktop application icon, installer artwork, and the conversation hero mark.

## Capabilities

### New Capabilities

- `client-product-brand`: the product name, version badge, and document title the web client presents, including which build profiles receive the private brand.
- `desktop-product-brand`: which visible texts in the desktop application carry the product brand name and which keep the installed application's identity.

### Modified Capabilities

None. The project has no existing specs; this change introduces both capabilities.

## Impact

- **New package**: `packages/client/ui-brand-private` (browser half, sidebar brand-name occupant, locale dictionary, version formatting, package README, unit tests).
- **Package registration**: `tsconfig.client.json` aggregate reference, `packages/bundle/web-app/cordis.patch.yml` row, `packages/bundle/web-app/package.json` dependency, the browser-side model-experience allowlist, and the generated client catalog, module graph, and package list.
- **Build environment**: `scripts/client-build-environment.ts` gains the local profile title, with its spec updated; this feeds both the initial HTML title and the runtime document title.
- **Desktop copy**: `apps/desktop/src/locale.ts` brand keys across eight locales.
- **Repository**: GitHub repository rename, `origin` URL, and the name references in `PRIVATE.md` and `AGENTS.md`.
- **Deliberately untouched**: `packages/client/ui-sidebar` fallbacks and CSS, `packages/client/ui-brand-official`, icon and installer assets, `productName`/`appId`, and the PWA manifest.
