# Tasks

## 1. Package scaffold

- [x] 1.1 Create `packages/client/ui-brand-private` with `package.json` (name `@deepseek-ai/dsh-client-ui-brand-private`, exports `.`, `./client`, `./src/*`, `./package.json`; `dsh.client` with `platform: 'web'`; Cordis in matching peer and dev sections; React and the slot/sidebar/renderer packages as dev dependencies only) and verify `pnpm --filter @deepseek-ai/dsh-client-ui-brand-private exec node -e "console.log(require('./package.json').name)"` prints the package name.
- [x] 1.2 Add `tsconfig.json` extending `tsconfig.base.client.json` with `rootDir: src`, `outDir: lib/types`, and one reference per workspace dependency, plus `src/css-modules.d.ts`; verify `pnpm run typecheck:contracts-ready` reports no missing project reference for the new package.
- [x] 1.3 Add `tsdown.config.ts` using the shared client bundle preset and an empty host-half `src/index.ts`; verify `pnpm --filter @deepseek-ai/dsh-client-ui-brand-private bundle` emits `lib/client.js`.
- [x] 1.4 Write `README.md`, `README.zh.md`, and `README.i18n.yaml` covering the sidebar name occupant, the build-profile gate, and the model-experience exemption; verify `pnpm run verify-package-readme-model-experience` passes after adding the package to its browser-side allowlist.
- [x] 1.5 Add the package to the `scripts/verify-package-readme-model-experience.ts` allowlist with the browser-only reason; verify `pnpm run verify-package-readme-model-experience` passes.
- [x] 1.6 Confirm no dependency on `@deepseek-ai/dsh-client-ui-brand-official` exists in any manifest; verify `pnpm run verify-client-packages` reports no cross-plugin value edge.

## 2. Brand-name occupant

- [x] 2.1 Add `src/client/locales.ts` with a typed key union and all shipped locales mapping the name key to `DSH Private`; verify `pnpm run check:i18n` passes.
- [x] 2.2 Add `src/client/version.ts` formatting `version[-commit][-dirty]` from the public build variables; verify a table-driven unit test covers version-only, version-with-commit, dirty, and missing-metadata cases.
- [x] 2.3 Add `src/client/PrivateBrandName.tsx` rendering the localized name and, when metadata exists, the version pill below it, with the copy-version attribute the parent brand button checks; verify the component test asserts both texts render at 11px within a 24px row.
- [x] 2.4 Add `src/client/PrivateBrandName.module.css` sizing the name and the pill so the name truncates instead of overflowing a narrow sidebar; verify the component test at the minimum expanded width shows no horizontal overflow.
- [x] 2.5 Add `src/client/index.ts` with `inject = ['slots', 'locale']` and an `apply` that registers the locale namespace and occupies `sidebar.brand.name` only when the client build profile is not `official`; verify the plugin test asserts one occupant for non-official builds, none for `official`, and full removal on teardown.
- [x] 2.6 Add a browser-plugin test that clicks the version pill and asserts the clipboard write, the confirmation toast, and that no new session starts; verify `pnpm run test:gui` passes for the package.

## 3. Registration and generated catalogs

- [x] 3.1 Add the package to the `references` list in `tsconfig.client.json`; verify `pnpm run typecheck` resolves the new project.
- [x] 3.2 Add the plugin row to `packages/bundle/web-app/cordis.patch.yml` beside the existing brand row and the dependency to `packages/bundle/web-app/package.json`; verify `pnpm run verify-cordis-config` passes.
- [x] 3.3 Regenerate the client catalog; verify `pnpm run verify-client-catalog` passes and the new occupant appears for `sidebar.brand.name`.
- [x] 3.4 Regenerate the module graph, plugin package list, and dependency catalog; verify `pnpm run verify-module-graph` passes and `pnpm run doc-sync` reports no stale generated document.
- [x] 3.5 Confirm the sidebar still renders the whale mark in the expanded row and the collapsed rail in the assembled client; verify `DSH_SNAPSHOT=replay pnpm run test:web` passes after updating any expected output that named the previous label.

## 4. Document title

- [x] 4.1 Set the private product title in both local build-environment constructors in `scripts/client-build-environment.ts`, leaving the official profile override intact; verify the updated `scripts/client-build-environment.client.spec.ts` cases pass.
- [x] 4.2 Verify a local build produces `DSH Private` in the built entry HTML and at runtime while an official profile build still produces the upstream title; verify with the built-boot browser test in replay mode.
- [x] 4.3 Confirm no second source of the product title was introduced and the web entry HTML literal was left as the build default; verify `git diff` touches only the build-environment module and its spec for this title.

## 5. Desktop brand copy

- [x] 5.1 Change the five brand keys (About product name, welcome title, welcome brand, update title, startup failure) to `DSH Private` in all eight locales in `apps/desktop/src/locale.ts`, leaving the About menu item, hide, quit, quit confirmation, and open items unchanged; verify the desktop locale tests assert the split in every locale.
- [x] 5.2 Verify the packaged identity is untouched by diffing the desktop packaging configuration and confirming `productName`, `appId`, data directory, and update feed are unchanged.

## 6. Verification

- [x] 6.1 Run `pnpm run verify-client-ui-i18n` and confirm no product copy is hard-coded in the new package.
- [x] 6.2 Run `pnpm run lint` and `pnpm run typecheck` and confirm both pass for the new package and the edited modules.
- [x] 6.3 Run `pnpm run build:artifacts` followed by `pnpm run build:check` and confirm both pass.
- [x] 6.4 Run `pnpm run test:gui` and `DSH_SNAPSHOT=replay pnpm run test:web` and confirm both pass with updated expectations for the new name.
- [x] 6.5 Confirm by inspection that favicon, PWA icons, installer artwork, desktop icon, and the conversation hero are untouched in the diff.

## 7. Repository rename

- [x] 7.1 Rename the GitHub repository to `dsh-private` and verify `gh repo view filipeesch/dsh-private --json name` returns the new name.
- [x] 7.2 Update the `origin` remote URL and verify `git remote -v` and `git fetch origin` both succeed against the new URL.
- [x] 7.3 Update the repository name references in `PRIVATE.md` and `AGENTS.md`; verify no stale `deepseek-private-harness` reference remains outside the archived notes.

## Verification notes

- The jsdom lanes cannot apply CSS Modules, so the 11px name, 12px pill, 24px row, truncation, and font-weight ceiling are pinned against the stylesheet source in `packages/client/ui-brand-private/tests/styles.client.spec.ts`; the rendered row is asserted structurally and through the assembled boot test.
- Copy behavior is proven against the real sidebar: `browser-plugin.client.spec.tsx` mounts the sidebar shell and this package together, clicks the version, and asserts no session, then clicks the name as the contrast.
- The document title is asserted in the built entry HTML (build record plus `apps/web/dist/index.html`) and at runtime by `apps/web/tests/built-boot.expected.e2e.ts`.
- The collapsed rail renders the shell's own mark fallback, which this package does not register, so rail coverage stays with the sidebar package.
- Two residual limits are recorded in the package README instead of changed here: the copy affordance is pointer-only because the shell marks the brand row `aria-hidden`, and the confirmation ends when collapsing unmounts the row. Both need a shell-owned control or host.
