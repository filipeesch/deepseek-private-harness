# Design

## Context

The previous change added `packages/client/ui-brand-private`, which occupies only `sidebar.brand.name` on non-official builds and leaves the whale mark to the shell fallback. The published `client-product-brand` capability records that the mark stays the upstream whale; this change reverses that decision and adds the mark's own capability.

The shell already declares `sidebar.brand.mark` and `conversation.hero.brand.mark` as root-scoped single seats. The official package occupies the sidebar seats on official builds; the hero seat has no occupant and renders an animated fish fallback. The build title flows from `scripts/client-build-environment.ts`; the desktop copy lives in one locale module; the install artwork is rendered from committed SVGs by two scripts, while the installer panels are pre-rendered PNGs.

See `proposal.md` for motivation and `specs/` for the requirements.

## Goals / Non-Goals

**Goals:**

- Present one validated identity — the name "Private DSH" and a shield mark with the whale knocked out — consistently from the sidebar to the packaged application.
- Keep the mark theme-independent by making the whale a transparent hole rather than a fill color.
- Keep official builds byte-for-byte on the upstream artwork.
- Keep every generated asset reproducible from a committed source.

**Non-Goals:**

- Any change to the upstream wordmark, the official package, or the home background animation.
- Custom lettering for the product name; the installer name is typeset, not drawn.
- A separately designed small-size mark; one artwork is used at every size.

## Decisions

### D1 — The mark lives in the client package as `currentColor` with a mask hole

The mark component renders the shield in the foreground ink and the whale as a mask hole, so the whale shows whatever surface sits behind it. One geometry serves both themes and any surface.

*Alternative*: draw the whale in the background color — it breaks on translucent or gradient surfaces and needs a color per theme.

### D2 — The mark takes two seats and stays decorative

The package now registers `sidebar.brand.mark` and `conversation.hero.brand.mark` alongside the existing name seat, all gated to non-official builds. The hero occupant is static. The mark itself carries no click behavior: the same component renders in the expanded brand row and in the rail, where it sits inside the expand toggle, so a copy affordance would fire while expanding. The version badge in the name seat stays the single copy affordance, and the shell fallback's mark-copy behavior retires with the fallback.

*Alternatives*: give the mark copy-on-click and detect the rail from the DOM — rejected as fragile context sniffing; occupy only the sidebar and let the hero keep the animated fish — rejected because the hero would show the upstream whale.

### D3 — Static artwork derives from one committed source per family

- The tab favicons are hand-authored SVGs built from the same shield and whale geometry.
- The PWA install icons are rendered from the application tile (`apps/desktop/resources/icon.svg`) by the existing icon script.
- The macOS and Windows application icons come from their platform SVGs, exported at 1024px.
- The Windows tray icon comes from `icon-windows.svg` by the existing tray script.

*Why*: each family already has a generator or an export path; reusing them keeps the regeneration commands known and reviewed.

### D4 — The application tile is the dark neutral plate

The application icon is a rounded-square graphite plate with the mark in white, matching the validated sketch. It reads on both light and dark docks and differentiates the private build from the upstream blue-gradient icon. The installer artwork inverts the ink for the dark panel rather than reusing the tile.

*Alternative*: the brand blue plate — closer to the upstream identity and weaker against dark backgrounds.

### D5 — The installer lockup is rendered from the shipped font through headless Chromium

The repository ships Montserrat only as `woff2`, the rasterizer cannot load it, and no Montserrat is installed on the build hosts. The lockup is therefore rendered by a committed script that loads the shipped `woff2` through a headless browser, screenshots the lockup at 1× and 2×, and writes the committed PNGs.

*Alternative*: convert the font to `ttf` and rasterize with the SVG tool — adds a conversion dependency and a font binary to the repository.

*Consequence*: the generated PNGs are committed and are the runtime source of truth; the script documents how to regenerate them and pins the font, size, gap, and device scale.

### D6 — The name changes through the mechanisms already in place

The client dictionaries, the build title, and the desktop locale module carry the new name; no new mechanism is introduced.

### D7 — The whale requirement moves out of `client-product-brand`

The published requirement "The sidebar brand mark remains the upstream whale" is removed from that capability, and `product-brand-mark` owns the mark's geometry, surfaces, and profile gating.

*Why*: the mark now spans the client and the packaging, so it does not belong to a client-only capability.

## Risks / Trade-offs

- **The 16px tab icon cannot show the whale** → Accepted: at that size the mark reads as a shield with a light interior. The whale becomes recognizable from roughly 34px, and the sidebar seat is 24px.
- **Committed artwork can drift from the component geometry** → The whale path is the exported upstream constant, and a test compares the committed SVG sources with that constant so a hand edit that diverges fails.
- **The installer PNGs depend on a browser render** → The generating script pins the font file, text size, gap, and device scale, and the committed outputs are what ships; the script exists for deliberate regeneration.
- **Losing the animated hero fallback** → Accepted by the owner; the hero seat is static in every build that uses the private mark.
- **Desktop snapshots change again** → They are updated in the same change, and their diffs are limited to the brand lines.

## Migration Plan

1. Land the component and seat changes together: the mark replaces the fallback as soon as the composition loads it.
2. Regenerate the icon families and commit the outputs with the source SVGs.
3. Rollback: remove the mark registration to restore the shell fallback, and restore the previous SVG and PNG files from version control. No persisted data changes, so no data migration is needed.

## Open Questions

None.
