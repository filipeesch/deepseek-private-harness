# Tasks

## 1. Mark component and seats

- [x] 1.1 Add the mark component to `packages/client/ui-brand-private`: the compact shield in the foreground ink with the whale as a mask hole at 72% of the shield width, accepting the seat's size and class name; verify a component test asserts the rendered path, the mask reference, and that no fill color is applied to the whale.
- [x] 1.2 Register the mark in `sidebar.brand.mark` beside the existing name seat, without a click handler; verify a test asserts the seat renders the mark, that a rail click reaches the expand toggle, and that the version badge remains the only copy affordance.
- [x] 1.3 Register the mark in `conversation.hero.brand.mark` with the owner's size, static; verify a test renders the hero seat and asserts the mark without animation elements.
- [x] 1.4 Declare the `@deepseek-ai/dsh-client-ui-conversation` type dependency, its project reference, and the `dsh.client.inject` edge; verify `pnpm run typecheck` and `pnpm run verify-client-packages` pass.

## 2. Name rollout

- [x] 2.1 Change the package dictionaries to "Private DSH" in all eight locales; verify the plugin test asserts the new name in English and Portuguese.
- [x] 2.2 Set `DSH_CLIENT_TITLE` to "Private DSH" in the client build environment and update its spec; verify the build-environment and dev-web specs pass and the built entry HTML carries the new title.
- [x] 2.3 Change the five desktop brand keys to "Private DSH" in all eight locales; verify `apps/desktop/tests/locale.spec.ts` asserts the split with the new name.
- [x] 2.4 Update the desktop packaging README label in both languages and re-record its translation pairing; verify `pnpm run verify-translation-pairing` passes.

## 3. Static artwork

- [x] 3.1 Author `apps/web/public/favicon.svg` and `favicon-dark.svg` from the shield and whale geometry; verify a test compares the embedded whale path with the exported constant.
- [x] 3.2 Rewrite `apps/desktop/resources/icon.svg` as the dark neutral tile with the mark, and the macOS and Windows platform SVGs to match; export the 1024px PNGs; verify each file's dimensions and alpha.
- [x] 3.3 Regenerate the PWA install icons from the tile and the Windows tray icon from its platform SVG with the existing scripts; verify the output sizes and the manifest test.
- [x] 3.4 Add a script that renders the installer lockup (mark plus "Private DSH" in the shipped Montserrat) through a headless browser, and regenerate `brand.png`, `brand-2x.png`, `brand-dark.png`, `brand-dark-2x.png`, and `uninstaller-sidebar.png`; verify the dimensions, the alpha, and a visual check of both panels.

## 4. Tests and documentation

- [x] 4.1 Update the package tests for the new name and the two new seats, including the profile gate and teardown for each seat; verify `pnpm exec vitest run packages/client/ui-brand-private/tests` passes.
- [x] 4.2 Update the assembled boot expectations to the new name and the mark; verify the built-boot web test passes in replay mode.
- [x] 4.3 Regenerate the client catalog, module graph, config catalog, and package list; verify `pnpm run verify-client-catalog`, `pnpm run verify-module-graph`, and `pnpm run doc-sync` pass.

## 5. Verification and delivery

- [x] 5.1 Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run build:artifacts`, `pnpm run build:check`, `pnpm run test:gui`, and the desktop suite; verify every command passes.
- [x] 5.2 Archive the change and sync the three capabilities; verify `openspec validate --strict` and `openspec validate --specs` pass.
- [x] 5.3 Commit on `private-dsh-brand`, merge `origin/master`, open the pull request, and merge once `private-ci passed` is green.
