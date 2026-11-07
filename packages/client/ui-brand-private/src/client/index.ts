/**
 * Private brand plugin, browser half. Fills the sidebar brand-name seat for
 * every build that is not an official build, so official artifacts keep the
 * upstream wordmark and this distribution presents its own name.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { PRIVATE_BRAND_NS } from './contract.ts'
import { de, en, es, fr, ja, pt, ru, zh } from './locales.ts'
import { PrivateBrandName } from './PrivateBrandName.tsx'

/** Required services: the slot registry and the locale dictionaries this seat renders. */
export const inject = ['slots', 'locale']

/**
 * Register the brand dictionaries and occupy the sidebar brand-name seat.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(PRIVATE_BRAND_NS, { zh, en, ja, es, fr, de, ru, pt }), 'ui-brand-private: brand dictionaries')
  if (process.env.DSH_CLIENT_BUILD_PROFILE === 'official') return
  ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
    name: 'sidebar.brand.name',
    locale: PRIVATE_BRAND_NS,
  }, PrivateBrandName))
}
