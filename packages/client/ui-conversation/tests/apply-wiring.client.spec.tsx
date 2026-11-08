// @vitest-environment jsdom
import { apply as applyMenus, inject as injectMenus } from '@deepseek-ai/dsh-client-ui-context-menu/client'
import { describe, expect, it, vi } from 'vitest'
import {
  SlotTestRuntime, stubConfigForm, usePinnedBrowserLanguages,
} from '@deepseek-ai/dsh-client-test-runtime'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { createSnapshotStore, type ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { apply, inject, type ViewTab } from '@deepseek-ai/dsh-client-ui-conversation/client'

usePinnedBrowserLanguages('zh-CN')

const SID = 'session-1' as SessionId

async function bench(options: {
  declareConversation?: boolean
  /** Render the conversation column instead of a frame that renders nothing. */
  renderColumn?: boolean
  /** Register a header leading seat that throws while rendering. */
  crashingLeading?: boolean
} = {}) {
  const runtime = await SlotTestRuntime.create()
  const reported: string[] = []
  runtime.slots.onEntryError((key) => { reported.push(key) })
  const developerTools = createSnapshotStore(true)
  runtime.ctx.provide('uiWorkspace', {
    openWorkspace: vi.fn(async (_workspaceId: unknown, beforeOpen: (id: SessionId) => void) => {
      beforeOpen(SID)
    }),
    openSession: vi.fn(),
  } as never)
  runtime.ctx.provide('configForms', { developerTools: { enabled: developerTools }, get: () => stubConfigForm().scope } as never)
  const locale = new LocaleRuntime(runtime.ctx)
  runtime.ctx.provide('locale', locale)
  runtime.slots.installLocale(locale)
  runtime.ctx.provide('shortcuts', { catalog: createSnapshotStore([]) })
  await runtime.mount({ inject: [...injectMenus], apply: applyMenus })
  if (options.declareConversation !== false) {
    const children = {
      'main': { kind: 'keyed', scope: 'root' },
      'settings.general.item': { kind: 'list', scope: 'root' },
    } as const
    if (options.renderColumn === true) {
      await runtime.root.declare(children, props => props.renderSlot('main', {}, { entryKey: 'conversation' }))
    } else {
      await runtime.root.declare(children, (_props: { renderSlot?: unknown }) => null)
    }
  }
  const feature = await runtime.mount({ inject: [...inject], apply })
  if (options.crashingLeading === true) {
    runtime.slots.register({ name: 'conversation.header.leading' }, () => { throw new Error('header seat failed') })
  }
  const view = options.declareConversation === false ? undefined : runtime.renderRoot()
  return { runtime, feature, developerTools, reported, view }
}

function entry(
  runtime: SlotTestRuntime,
  key: 'main.conversation' | 'conversation.session' | 'conversation.session.header',
) {
  return runtime.slots.entries(key)[0] as { store?: unknown } | undefined
}

describe('target-neutral Conversation apply wiring', () => {
  it('hands every Session header the same in-memory View pins without restoring saved choices', async () => {
    localStorage.setItem('dsh.slot.manual-order.conversation.view.v1', JSON.stringify({ unpinned: ['trajectory'] }))
    try {
      const b = await bench()
      const header = b.runtime.slots.entries('conversation.session.header')[0]!
      type PinHooks = {
        hooks: { entryPins: ObservableSnapshot<readonly string[]>; entryActions: ObservableSnapshot<boolean> }
        setPinned: (id: string, pinned: boolean) => void
      }
      const inject = header.inject as (sessionId: SessionId) => PinHooks
      const injected = inject(SID)
      const first = injected.hooks.entryPins
      expect(first.getSnapshot()).toEqual([])
      expect(inject('session-2' as SessionId).hooks.entryPins).toBe(first)
      injected.setPinned('timeline', false)
      expect(first.getSnapshot()).toEqual(['timeline'])
      const actions = injected.hooks.entryActions
      const changed = vi.fn()
      actions.subscribe(changed)
      expect(actions.getSnapshot()).toBe(false)
      b.runtime.slots.register({ name: 'conversation.session.header.views.actions', id: 'probe' }, (() => null) as never)
      expect(actions.getSnapshot()).toBe(true)
      await vi.waitFor(() => { expect(changed).toHaveBeenCalled() })
      await b.runtime.dispose()
    } finally {
      localStorage.clear()
    }
  })

  it('hides only the Trajectory View while developer tools are disabled and restores it when enabled', async () => {
    const b = await bench()
    const header = b.runtime.slots.entries('conversation.session.header')[0]!
    const source = (header.inject!() as { hooks: { conversationViews: ObservableSnapshot<readonly ViewTab[]> } }).hooks.conversationViews
    for (const id of ['chat', 'trajectory', 'probe']) {
      b.runtime.slots.register({ name: 'conversation.view', id, label: id }, (() => null) as never)
    }
    await vi.waitFor(() => { expect(source.getSnapshot().map(tab => tab.id)).toEqual(['chat', 'trajectory', 'probe']) })
    b.developerTools.set(false)
    expect(source.getSnapshot().map(tab => tab.id)).toEqual(['chat', 'probe'])
    b.developerTools.set(true)
    expect(source.getSnapshot().map(tab => tab.id)).toEqual(['chat', 'trajectory', 'probe'])
    await b.runtime.dispose()
  })
  it('waits for the layout-owned conversation declaration before registering its subtree', async () => {
    const b = await bench({ declareConversation: false })
    expect(b.runtime.slots.entries('main')).toHaveLength(0)
    expect(b.runtime.slots.entries('main.conversation')).toHaveLength(0)

    await b.runtime.root.declare({
      'main': { kind: 'keyed', scope: 'root' },
      'settings.general.item': { kind: 'list', scope: 'root' },
    }, (_props: { renderSlot?: unknown }) => null)
    b.runtime.renderRoot()
    expect(b.runtime.slots.entries('main').map(row => row.options.key)).toEqual(['conversation'])
    expect(b.runtime.slots.entries('main.conversation')).toHaveLength(1)
    expect(b.runtime.slots.spec('main.conversation'))
      .toEqual({ kind: 'single', scope: 'session-maybe' })
    expect(b.runtime.factoryOf('conversation.content').slots)
      .toMatchObject({ views: { scope: 'session' } })
    // The window owns the header declaration, so any host can render the whole
    // window without registering into the main panel.
    const window = b.runtime.slots.snapshot('factory:conversation.window')[0]
    expect(window?.type).toBe('factory')
    expect(window?.children.map(child => child.name)).toEqual(['conversation.header'])
    const headerNode = b.runtime.slots.snapshot('conversation.header')[0]
    if (headerNode?.type !== 'slot') throw new Error('conversation.header is not a declared slot')
    expect(headerNode.declaredBy).toContain('factory "conversation.window"')
    expect(b.runtime.slots.entries('main.conversation')[0]?.children).toBeUndefined()
    expect(b.runtime.slots.entries('conversation.session')).toHaveLength(1)
    expect(b.runtime.slots.entries('conversation.session.header')).toHaveLength(1)
    expect(b.runtime.slots.spec('conversation.header')).toEqual({ kind: 'single', scope: 'session-maybe' })
    expect(b.runtime.slots.spec('conversation.header.leading')).toEqual({ kind: 'single', scope: 'root' })
    expect(b.runtime.slots.entries('conversation.composer.bar')).toHaveLength(1)
    await b.runtime.dispose()
  })

  it('provides both action and assembly services without installing Chat', async () => {
    const b = await bench()
    expect(b.runtime.ctx.get('conversation')).toBeDefined()
    expect(b.runtime.ctx.get('uiConversation')).toBeDefined()
    expect(b.runtime.slots.entries('conversation.view')).toHaveLength(0)
    await b.runtime.dispose()
  })

  it('owns shell slots and shares only the Conversation store', async () => {
    const b = await bench()
    const session = entry(b.runtime, 'conversation.session')
    const header = entry(b.runtime, 'conversation.session.header')
    expect(entry(b.runtime, 'main.conversation')?.store).toBeUndefined()
    expect(b.runtime.factoryOf('conversation.content').store).toBeUndefined()
    // The window must not carry the store: the handle is pinned to `session`
    // scope by the Session body and header, and the window is `session-maybe`.
    const window = b.runtime.factoryOf('conversation.window')
    expect(window.scope).toBe('session-maybe')
    expect(window.store).toBeUndefined()
    expect(window.inject).toBeUndefined()
    expect(session?.store).toBeDefined()
    expect(header?.store).toBe(session?.store)
    expect(b.runtime.slots.spec('conversation.composer'))
      .toEqual({ kind: 'chain', scope: 'session' })
    expect(b.runtime.slots.entries('settings.general.item').map(row => row.options.id))
      .toEqual(['composer-enter'])
    await b.runtime.dispose()
  })

  it('binds a cached locale-aware View roster only to its shell entries', async () => {
    const b = await bench()
    await b.runtime.sessions.add({ id: SID })
    using reference = b.runtime.sessions.retain(SID)
    expect(b.runtime.ctx.uiSession.adapter.bindingSource(reference).getSnapshot().hooks.conversationViews).toBeUndefined()
    const header = b.runtime.slots.entries('conversation.session.header')[0]
    const source = (header?.inject?.() as {
      hooks: { conversationViews: ObservableSnapshot<readonly ViewTab[]> }
    } | undefined)?.hooks.conversationViews
    expect(source).toBeDefined()
    expect(source?.getSnapshot()).toBe(source?.getSnapshot())

    const disposeView = b.runtime.slots.register({
      name: 'conversation.view',
      id: 'probe',
      label: () => b.runtime.ctx.locale.getSnapshot().active,
    }, (() => null) as never)
    await vi.waitFor(() => {
      expect(source?.getSnapshot()).toEqual([{ id: 'probe', label: 'zh' }])
    })
    const chinese = source?.getSnapshot()

    b.runtime.ctx.locale.setLocale('en')
    expect(source?.getSnapshot()).toEqual([{ id: 'probe', label: 'en' }])
    expect(source?.getSnapshot()).not.toBe(chinese)

    disposeView()
    await vi.waitFor(() => { expect(source?.getSnapshot()).toEqual([]) })
    await b.runtime.dispose()
  })


  it('contains a crashing header entry, reports it, and keeps the rest of the window rendering', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const b = await bench({ renderColumn: true, crashingLeading: true })
      // The header renders through ordinary Slot dispatch, so a failing entry
      // stays with the composition: reported against that entry, retired, and
      // replaced by the crash face in its own cell. The rest of the window —
      // header chrome and body — keeps rendering.
      expect(b.reported).toContain('conversation.header.leading')
      expect(b.view?.container.querySelector('[data-slot-error="conversation.header.leading"]')).not.toBeNull()
      expect(b.view?.container.querySelector('[data-conversation-header-leading]')).not.toBeNull()
      expect(b.view?.container.querySelector('[data-conversation-content]')).not.toBeNull()
      await b.runtime.dispose()
    } finally {
      consoleError.mockRestore()
    }
  })

  it('removes services, entries, and declarations with the plugin fiber', async () => {
    const b = await bench()
    await b.feature.dispose()
    expect(b.runtime.ctx.get('conversation')).toBeUndefined()
    expect(b.runtime.ctx.get('uiConversation')).toBeUndefined()
    expect(b.runtime.slots.entries('main')).toHaveLength(0)
    expect(b.runtime.slots.entries('main.conversation')).toHaveLength(0)
    expect(b.runtime.slots.spec('main.conversation')).toBeUndefined()
    expect(b.runtime.slots.spec('conversation.view')).toBeUndefined()
    await b.runtime.dispose()
  })
})
