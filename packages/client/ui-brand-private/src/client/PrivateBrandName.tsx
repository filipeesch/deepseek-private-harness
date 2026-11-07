/**
 * Private sidebar brand name: the product name with the build version stacked
 * beneath it. Occupies `sidebar.brand.name`; the shell keeps rendering the
 * whale mark in the sibling slot, so this component owns no artwork.
 */
import { useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { Toast, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives'
// Type-only: pulls the ui-sidebar SlotMap merge that declares this seat.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { privateBrandVersion } from './version.ts'
import css from './PrivateBrandName.module.css'

/** Full component props: the seat's runtime share plus this package's namespace. */
export type PrivateBrandNameProps = PropsRuntime<'sidebar.brand.name'> & PropsLocale<'brand.private'>

/**
 * Render the product name and, when the build embeds metadata, the version below it.
 * @param props - composed slot props carrying the bound translation seat.
 * @returns the brand name with its optional version pill.
 */
export function PrivateBrandName({ t }: PrivateBrandNameProps) {
  const version = privateBrandVersion()
  // Each successful copy bumps the key so a repeated copy replays the toast.
  const [copied, setCopied] = useState<number | null>(null)
  return (
    <span className={css.root}>
      <span className={css.name}>{t('name')}</span>
      {version !== undefined && (
        <span
          className={css.version}
          // The shell's brand button skips New Session for clicks inside this marker.
          data-copy-version
          onClick={() => {
            void writeClipboard(version).then((ok) => {
              if (ok) setCopied(seq => (seq ?? 0) + 1)
            })
          }}
        >
          {version}
        </span>
      )}
      {copied !== null && (
        <Toast key={copied} tone="success" text={t('copied')} onDone={() => { setCopied(null) }} />
      )}
    </span>
  )
}
