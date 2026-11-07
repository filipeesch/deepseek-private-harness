import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AppUpdater } from 'electron-updater'
import { selectUpdateChannel } from '../src/updates/electron-updater/channel.ts'
import { registerGithubFeed, usesGithubFeed } from '../src/updates/electron-updater/github-feed.ts'

let resources: string
beforeEach(() => { resources = mkdtempSync(join(tmpdir(), 'dsh-github-feed-')) })
afterEach(() => { rmSync(resources, { recursive: true, force: true }) })

function updater(): AppUpdater {
  return { channel: null, allowDowngrade: true, allowPrerelease: false } as AppUpdater
}

describe('feed detection', () => {
  it('recognizes the github provider in the packaged update configuration', () => {
    writeFileSync(join(resources, 'app-update.yml'), 'owner: example\nrepo: example\nprovider: github\nupdaterCacheDirName: example-updater\n')
    const target = updater()
    registerGithubFeed(target, resources)
    expect(usesGithubFeed(target)).toBe(true)
  })

  it('leaves a generic feed on the library channel behavior', () => {
    writeFileSync(join(resources, 'app-update.yml'), 'provider: generic\nurl: https://updates.example.com/\nchannel: stable\n')
    const target = updater()
    registerGithubFeed(target, resources)
    expect(usesGithubFeed(target)).toBe(false)
  })

  it('treats an absent configuration as no feed', () => {
    const target = updater()
    registerGithubFeed(target, resources)
    expect(usesGithubFeed(target)).toBe(false)
  })

  it('reports a configuration that exists but cannot be read', () => {
    mkdirSync(join(resources, 'app-update.yml'))
    expect(() => { registerGithubFeed(updater(), resources) }).toThrow(/EISDIR/u)
  })
})

describe('channel selection', () => {
  it('keeps the library channel and accepts pre-releases for nightly on the generic feed', () => {
    const target = updater()
    selectUpdateChannel(target, 'nightly')
    expect(target).toMatchObject({ channel: 'nightly', allowDowngrade: false, allowPrerelease: true })
  })

  it.each([['nightly', true], ['stable', false]] as const)(
    'selects pre-release visibility for %s on the GitHub feed without naming a library channel', (channel, prerelease) => {
      writeFileSync(join(resources, 'app-update.yml'), 'provider: github\nowner: example\nrepo: example\n')
      const target = updater()
      registerGithubFeed(target, resources)
      selectUpdateChannel(target, channel)
      expect(target).toMatchObject({ channel: null, allowDowngrade: false, allowPrerelease: prerelease })
    })
})
