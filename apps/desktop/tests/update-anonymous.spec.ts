import { afterEach, expect, it, vi } from 'vitest'
import type { AppUpdater } from 'electron-updater'
import { ElectronHttpExecutor } from 'electron-updater/out/electronHttpExecutor.js'
import { AnonymousUpdateHttpExecutor, withholdUpdaterIdentity } from '../src/updates/electron-updater/anonymous.ts'

afterEach(() => { vi.restoreAllMocks() })

it('removes the staging identifier header, in any case, before the request is created', () => {
  const create = vi.spyOn(ElectronHttpExecutor.prototype, 'createRequest')
    .mockImplementation(() => { throw new Error('stop before Electron networking') })
  const headers = { 'X-User-Staging-Id': '0b4d7f8e-0000-4000-8000-000000000000', accept: '*/*' }
  expect(() => new AnonymousUpdateHttpExecutor(1000).createRequest({ headers }, () => undefined)).toThrow('stop before')
  expect(create).toHaveBeenCalledOnce()
  expect(create).toHaveBeenCalledWith({ headers: { accept: '*/*' } }, expect.any(Function))
})

it('passes requests without headers through', () => {
  const create = vi.spyOn(ElectronHttpExecutor.prototype, 'createRequest')
    .mockImplementation(() => { throw new Error('stop before Electron networking') })
  expect(() => new AnonymousUpdateHttpExecutor(1000).createRequest({ host: 'github.com' }, () => undefined)).toThrow('stop before')
  expect(create).toHaveBeenCalledWith({ host: 'github.com' }, expect.any(Function))
})

it('replaces the stored installation identifier with a constant so no .updaterId is read or written', async () => {
  const generate = vi.fn(async () => 'random-installation-id')
  const updater = Object.assign({} as AppUpdater, { stagingUserIdPromise: { get value() { return generate() } } })
  withholdUpdaterIdentity(updater)
  const identity: { value: Promise<string> } = Reflect.get(updater, 'stagingUserIdPromise')
  expect(await identity.value).toBe('00000000-0000-0000-0000-000000000000')
  expect(generate).not.toHaveBeenCalled()
})
