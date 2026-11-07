/**
 * Format the build metadata embedded in the client bundle. The sidebar keeps
 * its own copy of this format for the shell fallback; the two carry the same
 * test cases so a change to one is visible in the other.
 * @returns `version[-commit][-dirty]`, or undefined when the build embeds no version.
 */
export function privateBrandVersion(): string | undefined {
  const version = process.env.DSH_CLIENT_VERSION
  if (version === undefined) return undefined
  const commit = process.env.DSH_CLIENT_COMMIT_HASH
  return version
    + (commit === undefined ? '' : `-${commit}`)
    + (process.env.DSH_CLIENT_GIT_DIRTY === 'true' ? '-dirty' : '')
}
