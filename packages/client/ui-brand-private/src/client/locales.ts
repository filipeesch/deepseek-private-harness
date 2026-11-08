/** Locale bundles for the private sidebar brand name and its version confirmation. */

/** Locale keys this surface renders. */
export type PrivateBrandKey = 'name' | 'copied'

/** Chinese dictionary; one of the two baseline locales. */
export const zh = {
  name: 'Private DSH',
  copied: '版本号复制成功',
} satisfies Record<PrivateBrandKey, string>

/** English dictionary; one of the two baseline locales. */
export const en = {
  name: 'Private DSH',
  copied: 'Version copied',
} satisfies Record<PrivateBrandKey, string>

/** Japanese dictionary. */
export const ja = {
  name: 'Private DSH',
  copied: 'バージョンをコピーしました',
} satisfies Record<PrivateBrandKey, string>

/** Spanish dictionary. */
export const es = {
  name: 'Private DSH',
  copied: 'Versión copiada',
} satisfies Record<PrivateBrandKey, string>

/** French dictionary. */
export const fr = {
  name: 'Private DSH',
  copied: 'Version copiée',
} satisfies Record<PrivateBrandKey, string>

/** German dictionary. */
export const de = {
  name: 'Private DSH',
  copied: 'Version kopiert',
} satisfies Record<PrivateBrandKey, string>

/** Russian dictionary. */
export const ru = {
  name: 'Private DSH',
  copied: 'Версия скопирована',
} satisfies Record<PrivateBrandKey, string>

/** Brazilian Portuguese dictionary. */
export const pt = {
  name: 'Private DSH',
  copied: 'Versão copiada',
} satisfies Record<PrivateBrandKey, string>
