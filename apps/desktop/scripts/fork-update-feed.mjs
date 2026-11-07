/**
 * Fork-owned build-time switch that embeds GitHub Releases as the Desktop update feed.
 *
 * Upstream embeds a generic feed on a fixed download origin. When `DSH_DESKTOP_FORK_UPDATE_REPOSITORY`
 * names a repository, electron-builder instead writes an `app-update.yml` with the `github` provider for
 * that repository, so the installed application checks its GitHub Releases and contacts no other update
 * origin. The runtime channel behavior for this provider lives in
 * `src/updates/electron-updater/github-feed.ts`.
 */

import { resolveDesktopUpdateChannel } from './desktop-auto-update-environment.mjs'

/** Environment variable that selects the GitHub Releases feed, as `owner/repository`. */
export const FORK_UPDATE_REPOSITORY_ENV = 'DSH_DESKTOP_FORK_UPDATE_REPOSITORY'

const REPOSITORY = /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})$/u

/**
 * Resolve the GitHub Releases feed selected for this packaging run.
 * @param {NodeJS.ProcessEnv} env - Packaging environment.
 * @param {NodeJS.Platform} platform - Target platform; macOS packages keep their signed generic feed.
 * @returns {{ channel: 'nightly' | 'stable', publish: { provider: 'github', owner: string, repo: string } } | undefined}
 *   The embedded default channel and electron-builder publish entry, or undefined when the variable is unset.
 * @throws {Error} When the repository is malformed or the target is macOS.
 */
export function resolveForkUpdateFeed(env, platform) {
  const value = env[FORK_UPDATE_REPOSITORY_ENV]?.trim()
  if (value === undefined || value === '') return undefined
  const match = REPOSITORY.exec(value)
  if (match === null) throw new Error(`desktop fork update: ${FORK_UPDATE_REPOSITORY_ENV} must be owner/repository`)
  if (platform === 'darwin') throw new Error(`desktop fork update: ${FORK_UPDATE_REPOSITORY_ENV} supports Windows and Linux targets only`)
  return {
    // The installed default is nightly for pre-release builds and stable for normal releases.
    channel: resolveDesktopUpdateChannel(env),
    publish: { provider: 'github', owner: match[1], repo: match[2] },
  }
}
