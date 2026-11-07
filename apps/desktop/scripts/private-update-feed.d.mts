/** Environment variable that selects the GitHub Releases feed, as `owner/repository`. */
export const PRIVATE_UPDATE_REPOSITORY_ENV: 'DSH_DESKTOP_PRIVATE_UPDATE_REPOSITORY'

/** GitHub Releases feed embedded in a packaged application. */
export interface PrivateUpdateFeed {
  readonly channel: 'nightly' | 'stable'
  readonly publish: { readonly provider: 'github', readonly owner: string, readonly repo: string }
}

/**
 * Resolve the GitHub Releases feed selected for this packaging run.
 * @param env Packaging environment.
 * @param platform Target platform; macOS packages keep their signed generic feed.
 * @returns The embedded default channel and electron-builder publish entry, or undefined when the variable is unset.
 */
export function resolvePrivateUpdateFeed(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): PrivateUpdateFeed | undefined
