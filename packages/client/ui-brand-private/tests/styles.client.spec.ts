/**
 * Stylesheet contract for the brand-name seat. CSS Modules are not applied in
 * jsdom, so the sizes that make the 11px version legible are asserted against
 * the stylesheet source rather than through computed style.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync(new URL('../src/client/PrivateBrandName.module.css', import.meta.url), 'utf8')

/**
 * Read one class block from the stylesheet source.
 * @param selector - class selector without the leading dot.
 * @returns the declarations inside that block, whitespace-normalized.
 */
function block(selector: string): string {
  const match = new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`, 'u').exec(stylesheet)
  if (match === null) throw new Error(`stylesheet has no .${selector} block`)
  return (match[1] ?? '').replace(/\s+/gu, ' ').trim()
}

describe('private brand stylesheet', () => {
  it('spends the seat row on a name line and a version line', () => {
    expect(block('root')).toContain('height: 24px')
    expect(block('root')).toContain('flex-direction: column')
  })

  it('renders name and version at the same 11px size', () => {
    expect(block('name')).toContain('font-size: 11px')
    expect(block('version')).toContain('font-size: 11px')
  })

  it('keeps feature text at or below the house font-weight ceiling', () => {
    for (const selector of ['name', 'version']) {
      const weight = /font-weight:\s*(\d+)/u.exec(block(selector))?.[1]
      expect(Number(weight)).toBeLessThanOrEqual(500)
    }
  })

  it('keeps the version pill inside the row', () => {
    const version = block('version')
    expect(version).toContain('height: 12px')
    expect(version).toContain('line-height: 12px')
    expect(version).toContain('overflow: hidden')
    expect(version).toContain('text-overflow: ellipsis')
  })

  it('truncates the name instead of overflowing a narrow sidebar', () => {
    const name = block('name')
    expect(name).toContain('white-space: nowrap')
    expect(name).toContain('overflow: hidden')
    expect(name).toContain('text-overflow: ellipsis')
  })
})
