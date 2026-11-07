---
description: "Private distribution product name for the sidebar brand row, with the build version beneath it."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-private

English | [中文](README.zh.md)

## Summary

This package gives a non-official client build the sidebar brand name `DSH Private` and keeps the build version legible beneath it. It occupies only the sidebar's brand-name seat: the whale mark, the browser title, and every icon stay where they are. Official builds are untouched, and the package registers nothing model-facing.

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

### Which builds receive the private name

`DSH_CLIENT_BUILD_PROFILE` decides. Any value other than `official` renders `DSH Private` in the sidebar brand row and adds this package's copy to the locale registry. An `official` build keeps the upstream wordmark: the package still loads and registers its dictionaries, but it occupies no seat.

### What the brand row shows

The expanded brand row keeps the shell's whale mark and shows the product name with the build version below it, both at 11px. Activating the version copies `version[-commit][-dirty]` and confirms the copy. On a build without version metadata the row shows the name alone.

Clicking the version never starts a new session: the version carries the marker the shell's brand button checks before it runs its own action.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The seat is declared by `dsh-client-ui-sidebar` as a root-scoped single slot. This package waits for that declaration through `ctx.slots.inject()`, so activation order does not matter, a collapsed declaration withdraws the occupant, and HMR leaves no half-registered brand. The component translates through the package's own namespace, registered as an owned effect beside the seat.

The version format is duplicated from the sidebar's shell fallback rather than exported from it: the fallback's helper is module-private, and widening the sidebar's public surface for one consumer costs more than the six duplicated lines. The stylesheet spends the seat's 24px on a 12px name line and a 12px pill, so the 11px version stays readable where the shell fallback used a 6px badge.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [ui-sidebar](../ui-sidebar/README.md) — declares `sidebar.brand.mark` and `sidebar.brand.name` and renders their fallbacks.
- [ui-brand-official](../ui-brand-official/README.md) — the official-profile occupant of the same seats.
- [Web client architecture](../../../docs/subsystems/web-client.md) — how browser plugin rows load and register slots.

-----

<a id="model-experience"></a>
## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

These limits define how the private name is supplied. They are current package constraints, not a brand-design comparison or a task backlog.

- **One name per build profile** — a deployment that wants a different name leaves this package out of its composition instead of configuring it.
- **The browser title is independent** — `DSH_CLIENT_TITLE` selects the document title at build time, outside the slot system.
- **The mark is not this package's** — the whale comes from the sidebar fallback, so this package cannot change it.
- **Copying needs a pointer** — the version pill sits inside the shell's brand row, which the shell marks `aria-hidden` for its own fallback; a keyboard-reachable copy control requires the shell to own a separate control outside that row.
- **The confirmation lives with the occupant** — collapsing the sidebar unmounts the brand row, so the copy confirmation ends early; the version text is already on the clipboard.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
