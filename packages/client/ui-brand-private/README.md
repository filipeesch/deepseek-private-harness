---
description: "Private distribution brand for the sidebar row and the home hero: the product name and the shield mark."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-private

English | [中文](README.zh.md)

## Summary

This package gives a non-official client build the brand name `Private DSH` and its own mark: a solid shield whose whale is a transparent knock-out. It occupies the sidebar mark, the sidebar name, and the home hero mark; the browser title and every install icon are rendered from the same artwork outside the slot system. Official builds are untouched, and the package registers nothing model-facing.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

The shipped Web and Desktop compositions mount this plugin by default. It needs no configuration and adds no settings row.

### Which builds receive the private brand

`DSH_CLIENT_BUILD_PROFILE` decides. Any value other than `official` renders `Private DSH` and the private mark, and adds this package's copy to the locale registry. An `official` build keeps the upstream wordmark and artwork: the package still loads and registers its dictionaries, but it occupies no seat.

### What the brand shows

The expanded brand row shows the shield mark beside the name, with the build version below the name at 11px. Activating the version copies `version[-commit][-dirty]` and confirms the copy; it never starts a new session. On a build without version metadata the row shows the name alone. The collapsed rail shows the mark inside the expand toggle, and the home hero shows the same mark statically before the headline.

The mark is decorative. It carries no click behavior, because the same component renders inside the rail's expand toggle where a copy affordance would fire while expanding.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The sidebar declares the mark and the name as root-scoped single seats, and the conversation package declares the hero seat. This package waits on each declaration through `ctx.slots.inject()`, so activation order does not matter, a collapsed declaration withdraws its occupant, and HMR leaves no half-registered brand. The name seat translates through the package's own namespace, registered as an owned effect beside the seats.

The mark is one square view box: the shield is drawn in the foreground ink and the whale is a mask hole, so the whale shows whatever surface sits behind it and no color is carried into a theme. The whale covers 72% of the shield width; below roughly that share it stops reading in the 24px row. The version format is duplicated from the sidebar's shell fallback rather than exported from it, because the fallback's helper is module-private and widening the sidebar's public surface for one consumer costs more than the six duplicated lines.

The static artwork is rendered from the committed application tile, so the favicons, install icons, application icons, tray icon, and installer lockup all carry the same geometry.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [ui-sidebar](../ui-sidebar/README.md) — declares the sidebar mark and name seats and renders their fallbacks.
- [ui-conversation](../ui-conversation/README.md) — declares the hero mark seat and its animated fish fallback.
- [ui-brand-official](../ui-brand-official/README.md) — the official-profile occupant of the sidebar seats.
- [Web client architecture](../../../docs/subsystems/web-client.md) — how browser plugin rows load and register slots.

-----

<a id="model-experience"></a>
## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

These limits define how the private brand is supplied. They are current package constraints, not a brand-design comparison or a task backlog.

- **One brand per build profile** — a deployment that wants a different name or mark leaves this package out of its composition instead of configuring it.
- **The browser title is independent** — `DSH_CLIENT_TITLE` selects the document title at build time, outside the slot system.
- **The 16px tab icon cannot show the whale** — at that size the mark reads as a shield with a light interior; the whale becomes recognizable from roughly 34px.
- **Copying needs a pointer** — the version pill sits inside the shell's brand row, which the shell marks `aria-hidden` for its own fallback; a keyboard-reachable copy control requires the shell to own a separate control outside that row.
- **The confirmation lives with the occupant** — collapsing the sidebar unmounts the brand row, so the copy confirmation ends early; the version text is already on the clipboard.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

The mark's geometry lives in `src/client/mark.ts`; the application tile under `apps/desktop/resources/` repeats it for the static artwork, and the installer lockup is rendered from that tile by a desktop script.

</details>
