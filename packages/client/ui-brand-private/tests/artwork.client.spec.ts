/**
 * Keeps the committed artwork on the mark's own geometry. The static sources
 * repeat the mark so the icons, the tray, and the installer lockup stay
 * independent of the browser bundle; this test fails when one of them drifts
 * from the component's constant.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MARK_PATH } from '../src/client/mark.ts'

/** Committed artwork that must carry the mark's geometry. */
const SOURCES = [
  ['favicon.svg', '../../../../apps/web/public/favicon.svg'],
  ['favicon-dark.svg', '../../../../apps/web/public/favicon-dark.svg'],
  ['icon.svg', '../../../../apps/desktop/resources/icon.svg'],
  ['icon-macos.svg', '../../../../apps/desktop/resources/icon-macos.svg'],
  ['icon-windows.svg', '../../../../apps/desktop/resources/icon-windows.svg'],
] as const

describe('committed brand artwork', () => {
  it.each(SOURCES)('%s carries the mark as one even-odd path', (_name, relative) => {
    const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    expect(source).toContain(MARK_PATH)
    expect(source).toContain('fill-rule="evenodd"')
  })
})
