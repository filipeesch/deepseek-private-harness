/**
 * The private brand mark: a solid shield whose whale silhouette is a mask hole,
 * so the whale shows whatever surface sits behind the mark and no color is
 * carried into a theme.
 */
import { useId } from 'react'
import { FISH_LOGO_PATH, FISH_LOGO_VIEWBOX } from '@deepseek-ai/dsh-client-ui-primitives'
import { MARK_SHIELD_PATH, MARK_VIEWBOX, MARK_WHALE_OFFSET, MARK_WHALE_SHARE } from './mark.ts'

/** Mark presentation requested by the hosting seat. */
export interface PrivateBrandMarkProps {
  /** Requested square edge in pixels. */
  size: number
  /** Extra class supplied by the host surface. */
  className?: string | undefined
}

/**
 * Render the private mark.
 * @param props.size - square edge in pixels.
 * @param props.className - host class preserving the surrounding mark geometry.
 * @returns the shield with the whale knocked out.
 */
export function PrivateBrandMark({ size, className }: PrivateBrandMarkProps) {
  // Colons from useId do not belong in an SVG fragment reference.
  const maskId = `dsh-private-mark-${useId().replaceAll(':', '')}`
  const scale = (MARK_VIEWBOX * MARK_WHALE_SHARE) / FISH_LOGO_VIEWBOX.width
  const x = (MARK_VIEWBOX - FISH_LOGO_VIEWBOX.width * scale) / 2
  const y = (MARK_VIEWBOX - FISH_LOGO_VIEWBOX.height * scale) / 2 + MARK_WHALE_OFFSET
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={MARK_VIEWBOX} height={MARK_VIEWBOX}>
        <rect x="0" y="0" width={MARK_VIEWBOX} height={MARK_VIEWBOX} fill="white" />
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <path d={FISH_LOGO_PATH} fill="black" />
        </g>
      </mask>
      <path d={MARK_SHIELD_PATH} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}
