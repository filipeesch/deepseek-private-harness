// @vitest-environment jsdom
/**
 * The private brand as the shipped browser composition assembles it: the real
 * slot registry, the real locale face, and the package's own apply. The seat
 * is declared by the test because the sidebar package is not mounted here.
 */
import { act, cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { de as commonDe } from '@deepseek-ai/dsh-client-locale/src/locales/de.ts'
import { en as commonEn } from '@deepseek-ai/dsh-client-locale/src/locales/en.ts'
import { es as commonEs } from '@deepseek-ai/dsh-client-locale/src/locales/es.ts'
import { fr as commonFr } from '@deepseek-ai/dsh-client-locale/src/locales/fr.ts'
import { ja as commonJa } from '@deepseek-ai/dsh-client-locale/src/locales/ja.ts'
import { pt as commonPt } from '@deepseek-ai/dsh-client-locale/src/locales/pt.ts'
import { ru as commonRu } from '@deepseek-ai/dsh-client-locale/src/locales/ru.ts'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { apply as sidebarApply, inject as sidebarInject } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { SlotTestRuntime } from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject } from '../src/client/index.ts'
import { apply as hostApply } from '../src/index.ts'

/** Seats this package occupies. */
const HOLE = 'sidebar.brand.name'
const MARK_HOLE = 'sidebar.brand.mark'
const HERO_HOLE = 'conversation.hero.brand.mark'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

/**
 * Assemble the runtime the shipped client uses: slot registry, locale face, and
 * this package's apply over a declared brand-name seat.
 * @returns the mounted runtime plus the feature handle owning its fiber.
 */
async function bench(language = 'en') {
  const runtime = await SlotTestRuntime.create()
  const locale = new LocaleRuntime(runtime.ctx)
  locale.register('common', { zh: commonZh, en: commonEn, ja: commonJa, es: commonEs, fr: commonFr, de: commonDe, ru: commonRu, pt: commonPt })
  if (language !== 'en' && language !== 'zh') {
    locale.addLanguage({ id: language, label: language, fallback: 'en' })
  }
  locale.setLocale(language)
  runtime.ctx.provide('locale', locale)
  runtime.slots.installLocale(locale)
  await runtime.declare({
    [HOLE]: { kind: 'single', scope: 'root' },
    [MARK_HOLE]: { kind: 'single', scope: 'root' },
    [HERO_HOLE]: { kind: 'single', scope: 'root' },
  })
  const feature = await runtime.mount({ inject: [...inject], apply })
  return { runtime, feature, locale }
}

/**
 * Swap the mounted runtime's locale before rendering.
 * @param language - shipped locale id to activate.
 * @returns the mounted runtime with that locale active.
 */
async function benchLocale(language: string) {
  const { runtime, locale } = await bench(language)
  return { runtime, locale }
}

describe('private browser-brand plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(() => { hostApply() }).not.toThrow()
  })

  it('declares the services it reads', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('occupies the brand-name seat on a local build', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const { runtime } = await bench()
    expect(runtime.slots.entries(HOLE)).toHaveLength(1)
    await runtime.dispose()
  })

  it('leaves the seat to the official brand on an official build', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const { runtime } = await bench()
    expect(runtime.slots.entries(HOLE)).toHaveLength(0)
    await runtime.dispose()
  })

  it('renders the private name and the version pill', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    vi.stubEnv('DSH_CLIENT_COMMIT_HASH', 'abcdef0')
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HOLE, {})

    expect(slot.view.getByText('Private DSH')).toBeTruthy()
    const pill = slot.view.getByText('1.2.3-abcdef0')
    expect(pill.hasAttribute('data-copy-version')).toBe(true)
    await runtime.dispose()
  })

  it('renders the name alone when the build embeds no version', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', undefined)
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HOLE, {})

    expect(slot.view.getByText('Private DSH')).toBeTruthy()
    expect(slot.container.querySelector('[data-copy-version]')).toBeNull()
    await runtime.dispose()
  })

  it('copies the version and confirms it without leaking into the shell', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HOLE, {})

    await act(async () => {
      slot.view.getByText('1.2.3').click()
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith('1.2.3')
    // The confirmation renders through a body portal, outside the slot container.
    expect(screen.getByText('Version copied')).toBeTruthy()
    await runtime.dispose()
  })

  it('dismisses the confirmation after its hold', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HOLE, {})
    vi.useFakeTimers()

    await act(async () => {
      slot.view.getByText('1.2.3').click()
      await Promise.resolve()
    })
    expect(screen.getByText('Version copied')).toBeTruthy()

    await act(async () => { vi.advanceTimersByTime(4000) })
    expect(screen.queryByText('Version copied')).toBeNull()
    vi.useRealTimers()
    await runtime.dispose()
  })

  it('claims no success when the clipboard refuses the write', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    const writeText = vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HOLE, {})

    await act(async () => {
      slot.view.getByText('1.2.3').click()
      await Promise.resolve()
    })
    expect(screen.queryByText('Version copied')).toBeNull()
    await runtime.dispose()
  })


  it('leaves New Session to the rest of the brand row', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    const startSession = vi.fn()
    const runtime = await SlotTestRuntime.create()
    runtime.ctx.provide('shortcuts', { catalog: createSnapshotStore([]) } as never)
    runtime.ctx.provide('layout', { toggleSidebar: vi.fn() })
    runtime.ctx.provide('uiWorkspace', { startSession } as never)
    const locale = new LocaleRuntime(runtime.ctx)
    locale.register('common', { zh: commonZh, en: commonEn, ja: commonJa, es: commonEs, fr: commonFr, de: commonDe, ru: commonRu, pt: commonPt })
    locale.setLocale('en')
    runtime.ctx.provide('locale', locale)
    runtime.slots.installLocale(locale)
    await runtime.declare({ sidebar: { kind: 'single', scope: 'root' } })
    // The assembled pair: the shell declares the seat and owns the button that
    // would start a session, this package fills it.
    await runtime.mount({ inject: [...sidebarInject], apply: sidebarApply })
    await runtime.mount({ inject: [...inject], apply })
    const slot = runtime.renderSlot('sidebar', { collapsed: false, width: 300, drawer: false })

    await act(async () => { slot.view.getByText('1.2.3').click() })
    expect(startSession).not.toHaveBeenCalled()

    // Contrast: the rest of the brand row still opens a New Session.
    await act(async () => { slot.view.getByText('Private DSH').click() })
    expect(startSession).toHaveBeenCalledTimes(1)
    await runtime.dispose()
  })

  it('fills the seat when the package applies before the declaration', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const runtime = await SlotTestRuntime.create()
    const locale = new LocaleRuntime(runtime.ctx)
    locale.register('common', { zh: commonZh, en: commonEn, ja: commonJa, es: commonEs, fr: commonFr, de: commonDe, ru: commonRu, pt: commonPt })
    runtime.ctx.provide('locale', locale)
    runtime.slots.installLocale(locale)
    await runtime.mount({ inject: [...inject], apply })
    expect(runtime.slots.entries(HOLE)).toHaveLength(0)

    await runtime.declare({
      [HOLE]: { kind: 'single', scope: 'root' },
      [MARK_HOLE]: { kind: 'single', scope: 'root' },
      [HERO_HOLE]: { kind: 'single', scope: 'root' },
    })
    await Promise.resolve()
    expect(runtime.slots.entries(HOLE)).toHaveLength(1)
    await runtime.dispose()
  })

  it('removes the occupant when its own package unloads', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const { runtime, feature } = await bench()
    expect(runtime.slots.entries(HOLE)).toHaveLength(1)

    await feature.dispose()
    expect(runtime.slots.entries(HOLE)).toHaveLength(0)
    expect(runtime.slots.entries(MARK_HOLE)).toHaveLength(0)
    expect(runtime.slots.entries(HERO_HOLE)).toHaveLength(0)
    await runtime.dispose()
  })

  it('renders the private name and its confirmation in a non-English locale', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { runtime, locale } = await benchLocale('pt')
    const slot = runtime.renderSlot(HOLE, {})

    expect(slot.view.getByText('Private DSH')).toBeTruthy()
    await act(async () => {
      slot.view.getByText('1.2.3').click()
      await Promise.resolve()
    })
    expect(screen.getByText('Versão copiada')).toBeTruthy()
    void locale
    await runtime.dispose()
  })

  it('fills the sidebar mark and the hero mark on a local build', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const { runtime } = await bench()
    expect(runtime.slots.entries(MARK_HOLE)).toHaveLength(1)
    expect(runtime.slots.entries(HERO_HOLE)).toHaveLength(1)
    await runtime.dispose()
  })

  it('leaves both mark seats to the official artwork on an official build', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const { runtime } = await bench()
    expect(runtime.slots.entries(MARK_HOLE)).toHaveLength(0)
    expect(runtime.slots.entries(HERO_HOLE)).toHaveLength(0)
    await runtime.dispose()
  })

  it('renders the mark as a shield with the whale knocked out', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const { runtime } = await bench()
    const slot = runtime.renderSlot(MARK_HOLE, { size: 24 })
    const svg = slot.container.querySelector('svg')
    if (svg === null) throw new Error('mark svg missing')
    expect(svg.getAttribute('width')).toBe('24')
    expect(svg.getAttribute('fill')).toBe('none')
    const mask = svg.querySelector('mask')
    if (mask === null) throw new Error('mark mask missing')
    const shield = svg.querySelector('path[mask]')
    if (shield === null) throw new Error('shield path missing')
    expect(shield.getAttribute('fill')).toBe('currentColor')
    // The whale is a hole: the only filled whale path lives inside the mask.
    const whale = mask.querySelector('path')
    if (whale === null) throw new Error('whale path missing')
    expect(whale.getAttribute('fill')).toBe('black')
    await runtime.dispose()
  })

  it('renders the hero mark at the requested size with the host class', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const { runtime } = await bench()
    const slot = runtime.renderSlot(HERO_HOLE, { size: 34, className: 'hero-fish' })
    const svg = slot.container.querySelector('svg')
    if (svg === null) throw new Error('hero mark svg missing')
    expect(svg.getAttribute('width')).toBe('34')
    expect(svg.classList.contains('hero-fish')).toBe(true)
    expect(svg.querySelector('animate')).toBeNull()
    await runtime.dispose()
  })
  it('withdraws the occupant when the declaration collapses', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    // Raw registry bench: the declaration disposer is what this case exercises,
    // and the auto frame owns the only root declaration a rendering bench has.
    const ctx = new Context()
    await ctx.plugin(SlotRegistry).await()
    const locale = new LocaleRuntime(ctx)
    locale.register('common', { zh: commonZh, en: commonEn, ja: commonJa, es: commonEs, fr: commonFr, de: commonDe, ru: commonRu, pt: commonPt })
    ctx.provide('locale', locale)
    const slots = ctx.get('slots') as SlotRegistry
    const declare = () => slots.register({
      name: 'root',
      children: { [HOLE]: { kind: 'single', scope: 'root' } },
    } as never, () => null)
    const withdraw = declare()
    await ctx.plugin({ inject: [...inject], apply }).await()
    expect(slots.entries(HOLE)).toHaveLength(1)

    withdraw()
    expect(slots.entries(HOLE)).toHaveLength(0)
    declare()
    await Promise.resolve()
    expect(slots.entries(HOLE)).toHaveLength(1)
    await ctx.fiber.dispose()
  })
})
