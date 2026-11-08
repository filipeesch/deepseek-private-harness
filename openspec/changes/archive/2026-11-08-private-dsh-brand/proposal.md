# Proposal

## Why

The identity introduced by the previous change is still upstream-shaped. The name "DSH Private" reads as a qualifier of the upstream product, and every icon still carries the upstream whale. The owner validated a replacement identity: the name "Private DSH" and a shield mark with the whale knocked out of it, applied consistently across the application and its packaging.

## What Changes

- Rename the presented product name from "DSH Private" to "Private DSH" on every surface the previous change touched: the sidebar brand row, the document title, and the desktop brand texts. The name stays untranslated.
- Replace the whale-only mark with a solid shield whose whale is a transparent knock-out at 72% of the shield width, drawn once and reused at every size.
- Occupy the sidebar brand mark and the conversation hero brand mark on non-official builds; the hero mark is static, replacing the animated fallback.
- Rebuild the whole icon set from that artwork: tab favicons, PWA install icons, the desktop application icon for macOS and Windows, the Windows tray icon, and the installer artwork, which pairs the shield with the name set in Montserrat.
- Official builds keep the upstream wordmark and artwork.

## Capabilities

### New Capabilities

- `product-brand-mark`: the private brand mark — its geometry, how it holds up across sizes, and which surfaces carry it (web client, install icons, application icon, tray, installer artwork).

### Modified Capabilities

- `client-product-brand`: the presented product name becomes "Private DSH", and the requirement that the sidebar mark stays the upstream whale is retired because this distribution now owns the mark.
- `desktop-product-brand`: the desktop brand texts read "Private DSH".

## Impact

- **Client package**: `packages/client/ui-brand-private` gains the mark component, occupies two seats instead of one, carries the new name in its dictionaries, and takes on the version-copy affordance previously provided by the shell fallback.
- **Build environment**: the local client build title changes in `scripts/client-build-environment.ts`.
- **Desktop copy**: five brand keys across eight locales in `apps/desktop/src/locale.ts`.
- **Artwork**: tab favicons, the four PWA install icons rendered from the application tile, the macOS and Windows application icons with their 1024px exports, the Windows tray icon, and the installer and uninstaller artwork.
- **Tests and snapshots**: the client package, the desktop suites, the assembled boot test, and the generated catalogs all follow the new name and mark.
- **Specs**: the two published capability specs change through the archive sync, and the mark becomes its own capability.
