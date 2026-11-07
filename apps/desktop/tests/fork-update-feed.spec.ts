import { describe, expect, it } from 'vitest'
import { createElectronBuilderConfig } from '../scripts/electron-builder-config.mjs'
import { validateDesktopPackageEnvironment } from '../scripts/desktop-package-environment.mjs'
import { FORK_UPDATE_REPOSITORY_ENV, resolveForkUpdateFeed } from '../scripts/fork-update-feed.mjs'

const forkEnvironment = {
  DSH_DESKTOP_APP_ID: 'io.example.fork-test',
  DSH_DESKTOP_UNSIGNED: '1',
  [FORK_UPDATE_REPOSITORY_ENV]: 'example-owner/example-repo',
}

describe('fork GitHub Releases update feed', () => {
  it('is absent unless a repository is selected', () => {
    expect(resolveForkUpdateFeed({}, 'win32')).toBeUndefined()
    expect(resolveForkUpdateFeed({ [FORK_UPDATE_REPOSITORY_ENV]: ' ' }, 'linux')).toBeUndefined()
  })

  it.each(['owner', 'owner/', '/repo', 'owner/repo/extra', 'owner/re po', '-owner/repo', 'owner/repo\nx', 'https://github.com/o/r'])(
    'rejects malformed repository %j', (value) => {
      expect(() => resolveForkUpdateFeed({ [FORK_UPDATE_REPOSITORY_ENV]: value }, 'win32')).toThrow(/owner\/repository/u)
    })

  it('rejects macOS packages, which keep the signed generic feed', () => {
    expect(() => resolveForkUpdateFeed({ [FORK_UPDATE_REPOSITORY_ENV]: 'o/r' }, 'darwin')).toThrow(/Windows and Linux/u)
  })

  it.each([[undefined, 'nightly'], ['stable', 'stable'], ['nightly', 'nightly']] as const)(
    'embeds channel %s as %s', (selected, expected) => {
      expect(resolveForkUpdateFeed({ [FORK_UPDATE_REPOSITORY_ENV]: 'o/r', DSH_DESKTOP_UPDATE_CHANNEL: selected }, 'win32'))
        .toEqual({ channel: expected, publish: { provider: 'github', owner: 'o', repo: 'r' } })
    })

  it('packages an unsigned Windows build with the github provider and no policy service', () => {
    const config = createElectronBuilderConfig({ ...forkEnvironment, DSH_DESKTOP_UPDATE_CHANNEL: 'stable' }, 'win32', 'x64')
    expect(config.publish).toEqual([{ provider: 'github', owner: 'example-owner', repo: 'example-repo' }])
    expect(config.extraMetadata).toMatchObject({ dshDesktopUpdateChannel: 'stable' })
    expect(config.extraMetadata).not.toHaveProperty('dshMandatoryUpdatePolicy')
  })

  it('does not require mandatory-update origins when validating a fork Windows package', () => {
    expect(() => { validateDesktopPackageEnvironment(forkEnvironment, { platform: 'win32', arch: 'x64' }, { unsigned: true }) }).not.toThrow()
    const { [FORK_UPDATE_REPOSITORY_ENV]: _repository, ...upstream } = forkEnvironment
    expect(() => { validateDesktopPackageEnvironment(upstream, { platform: 'win32', arch: 'x64' }, { unsigned: true }) })
      .toThrow(/MANDATORY_UPDATE/u)
  })

  it('leaves an unsigned build without a feed when no repository is selected', () => {
    const { [FORK_UPDATE_REPOSITORY_ENV]: _repository, ...upstream } = forkEnvironment
    const config = createElectronBuilderConfig({ ...upstream, DSH_DESKTOP_MANDATORY_UPDATE_TEST_ORIGIN: 'https://policy.example.com',
      DSH_DESKTOP_MANDATORY_UPDATE_CONFIG: '{"allowedAuthOrigins":["https://login.example.com"]}' }, 'win32', 'x64')
    expect(config.publish).toBeNull()
  })
})
