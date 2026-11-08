/**
 * The private brand mark: a solid shield whose whale is an even-odd hole, so
 * the whale shows whatever surface sits behind the mark and no color is
 * carried into a theme. The transform is baked into the path, so the mark is
 * one shape that rasterizes the same in the browser and in the static artwork.
 */
import { MARK_PATH, MARK_VIEWBOX } from './mark.ts'

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
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d={MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
