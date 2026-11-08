/** Geometry of the private brand mark: one compact shield with the whale knocked out. */

/** Side of the square mark view box, in user units. */
export const MARK_VIEWBOX = 24

/** Compact shield silhouette: straight shoulders, short point. */
export const MARK_SHIELD_PATH = 'M12 1.6H20.9C21.5 1.6 21.9 2 21.9 2.6V11C21.9 15.6 17.7 19.6 12 21.6C6.3 19.6 2.1 15.6 2.1 11V2.6C2.1 2 2.5 1.6 3.1 1.6Z'

/** Whale width as a share of the shield width; below roughly 0.7 it stops reading at 24px. */
export const MARK_WHALE_SHARE = 0.72

/** Vertical nudge that keeps the knocked-out whale optically centred in the shield. */
export const MARK_WHALE_OFFSET = -0.4
