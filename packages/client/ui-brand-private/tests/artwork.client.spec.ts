/**
 * Keeps the committed artwork on the mark's own geometry. The static sources
 * repeat the shield and the whale so the icons, the tray, and the installer
 * lockup stay independent of the browser bundle; this test fails when one of
 * them drifts from the component's constants.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FISH_LOGO_PATH } from '@deepseek-ai/dsh-client-ui-primitives'
import { MARK_SHIELD_PATH } from '../src/client/mark.ts'

/** Committed artwork that must carry the mark's geometry. */
const SOURCES = [
  ['favicon.svg', '../../../../apps/web/public/favicon.svg'],
  ['favicon-dark.svg', '../../../../apps/web/public/favicon-dark.svg'],
  ['icon.svg', '../../../../apps/desktop/resources/icon.svg'],
  ['icon-macos.svg', '../../../../apps/desktop/resources/icon-macos.svg'],
  ['icon-windows.svg', '../../../../apps/desktop/resources/icon-windows.svg'],
] as const

describe('committed brand artwork', () => {
  const read = (relative: string): string => readFileSync(new URL(relative, import.meta.url), 'utf8')

  it.each(SOURCES)('%s carries the shield and the whale knock-out', (_name, relative) => {
    const source = read(relative)
    expect(source).toContain(MARK_SHIELD_PATH)
    expect(source).toContain(FISH_LOGO_PATH)
    // The whale is a hole in the shield, never a fill of its own.
    expect(source).toContain('mask="url(#private-mark-whale)"')
  })
})
