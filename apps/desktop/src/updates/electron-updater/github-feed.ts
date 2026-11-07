/** Channel behavior for a packaged application whose update feed is GitHub Releases. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AppUpdater } from 'electron-updater'

/** Updaters whose packaged `app-update.yml` uses the `github` provider. */
const githubFeedUpdaters = new WeakSet<AppUpdater>()

/**
 * Record whether the packaged feed is GitHub Releases.
 * @param updater - Process-owned updater that will read `app-update.yml` from the application resources.
 * @param resourcesPath - Directory holding `app-update.yml`; defaults to the packaged application's resources.
 * @throws {Error} When the file exists but cannot be read.
 */
export function registerGithubFeed(updater: AppUpdater, resourcesPath: string = process.resourcesPath): void {
  let config: string
  try {
    config = readFileSync(join(resourcesPath, 'app-update.yml'), 'utf8')
  } catch (error) {
    // Unpackaged runs have no feed file; the coordinator reports that when a check starts.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  if (/^provider:\s*github\s*$/mu.test(config)) githubFeedUpdaters.add(updater)
}

/**
 * Whether the updater's feed is GitHub Releases.
 * @param updater - Updater passed to {@link registerGithubFeed} or any other updater.
 * @returns True only for a registered updater.
 */
export function usesGithubFeed(updater: AppUpdater): boolean {
  return githubFeedUpdaters.has(updater)
}

/**
 * Map a Desktop channel onto the GitHub provider's release selection.
 * Stable reads the repository's latest non-pre-release release. Nightly also considers pre-releases.
 * The library channel stays unset because it treats an explicit channel as a version pre-release
 * identifier to match against release tags; Desktop channel names are not tag identifiers.
 * Both channels read the default `latest.yml` (or `latest-linux.yml`) from the selected release.
 * @param updater - Updater whose prior operations have settled.
 * @param channel - Selected distribution channel.
 */
export function selectGithubChannel(updater: AppUpdater, channel: 'nightly' | 'stable'): void {
  updater.allowDowngrade = false
  updater.allowPrerelease = channel === 'nightly'
}
