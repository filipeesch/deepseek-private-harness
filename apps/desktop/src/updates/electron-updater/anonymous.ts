/** Keeps electron-updater from creating, persisting, or sending an installation identifier. */
import type { AppUpdater } from 'electron-updater'
import type { ElectronHttpExecutor } from 'electron-updater/out/electronHttpExecutor.js'
import { DesktopUpdateHttpExecutor } from './http-executor.ts'

/** Header electron-updater adds to every feed metadata request. */
const STAGING_HEADER = 'x-user-staging-id'

/** Fixed identifier substituted for the per-installation UUID that electron-updater stores in `.updaterId`. */
const ANONYMOUS_STAGING_ID = '00000000-0000-0000-0000-000000000000'

/** Updater transport that removes the staging identifier from every request, including redirects. */
export class AnonymousUpdateHttpExecutor extends DesktopUpdateHttpExecutor {
  override createRequest(
    options: { headers?: Record<string, unknown>; [name: string]: unknown },
    callback: Parameters<ElectronHttpExecutor['createRequest']>[1],
  ): ReturnType<ElectronHttpExecutor['createRequest']> {
    const { headers, ...rest } = options
    if (headers === undefined) return super.createRequest(options, callback)
    const kept = Object.entries(headers).filter(([name]) => name.toLowerCase() !== STAGING_HEADER)
    return super.createRequest({ ...rest, headers: Object.fromEntries(kept) }, callback)
  }
}

/**
 * Replace the updater's lazily generated installation UUID with a constant.
 * The library otherwise reads or writes `.updaterId` in the user data directory before every metadata check.
 * A feed `stagingPercentage` still applies, but every installation resolves to the same bucket.
 * Depends on a protected electron-updater 6.x field, covered by the real-library qualification.
 * @param updater - Process-owned updater, before its first check.
 */
export function withholdUpdaterIdentity(updater: AppUpdater): void {
  Object.assign(updater, { stagingUserIdPromise: { value: Promise.resolve(ANONYMOUS_STAGING_ID) } })
}
