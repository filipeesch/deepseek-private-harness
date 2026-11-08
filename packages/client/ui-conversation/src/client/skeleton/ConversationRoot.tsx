// Resident conversation seat. The window composition itself is public, so the
// main panel and an embedded host render the same header and body.

import type { ConversationSlotProps } from '../contract/slots.ts'

/** Full props composed from the main Conversation slot contract. */
export type ConversationRootProps = ConversationSlotProps

/**
 * Render the resident Conversation window.
 * @param props - main-slot inputs and the Factory renderer.
 * @returns the main-variant window occurrence.
 */
export function ConversationRoot({ renderFactorySlot }: ConversationRootProps) {
  return <>{renderFactorySlot('conversation.window', { variant: 'main' })}</>
}
