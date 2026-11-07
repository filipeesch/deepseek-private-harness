/** Version formatting, pinned to the same cases the sidebar fallback pins. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { privateBrandVersion } from '../src/client/version.ts'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('privateBrandVersion', () => {
  it('omits itself when the build embeds no version', () => {
    expect(privateBrandVersion()).toBeUndefined()
  })

  it.each([
    [{ DSH_CLIENT_VERSION: '1.2.3' }, '1.2.3'],
    [{ DSH_CLIENT_VERSION: '1.2.3', DSH_CLIENT_COMMIT_HASH: 'abcdef0' }, '1.2.3-abcdef0'],
    [{ DSH_CLIENT_VERSION: '1.2.3', DSH_CLIENT_GIT_DIRTY: 'true' }, '1.2.3-dirty'],
    [{ DSH_CLIENT_VERSION: '1.2.3', DSH_CLIENT_COMMIT_HASH: 'abcdef0', DSH_CLIENT_GIT_DIRTY: 'true' }, '1.2.3-abcdef0-dirty'],
  ])('formats %j as %s', (environment, expected) => {
    for (const [name, value] of Object.entries(environment)) vi.stubEnv(name, value)
    expect(privateBrandVersion()).toBe(expected)
  })
})
