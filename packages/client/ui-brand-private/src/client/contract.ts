/** Locale namespace this package renders, merged into the slot registry's namespace map. */
import type { PrivateBrandKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Private product name and its version-copied confirmation. */
    'brand.private': PrivateBrandKey
  }
}

/** Namespace the sidebar brand-name occupant translates through. */
export const PRIVATE_BRAND_NS = 'brand.private'
