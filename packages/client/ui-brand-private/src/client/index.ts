/**
 * Private brand plugin, browser half. Fills the sidebar brand mark, the sidebar
 * brand name, and the home hero mark for every build that is not an official
 * build, so official artifacts keep the upstream artwork.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { PRIVATE_BRAND_NS } from './contract.ts'
import { de, en, es, fr, ja, pt, ru, zh } from './locales.ts'
import { PrivateBrandMark } from './PrivateBrandMark.tsx'
import { PrivateBrandName } from './PrivateBrandName.tsx'

/** Required services: the slot registry and the locale dictionaries this brand renders. */
export const inject = ['slots', 'locale']

/**
 * Register the brand dictionaries and occupy the sidebar and hero brand seats.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(PRIVATE_BRAND_NS, { zh, en, ja, es, fr, de, ru, pt }), 'ui-brand-private: brand dictionaries')
  if (process.env.DSH_CLIENT_BUILD_PROFILE === 'official') return
  // The mark is decorative: in the collapsed rail it sits inside the expand
  // toggle, so a click affordance here would fire while expanding.
  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({ name: 'sidebar.brand.mark' }, PrivateBrandMark))
  ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
    name: 'sidebar.brand.name',
    locale: PRIVATE_BRAND_NS,
  }, PrivateBrandName))
  ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({ name: 'conversation.hero.brand.mark' }, PrivateBrandMark))
}
