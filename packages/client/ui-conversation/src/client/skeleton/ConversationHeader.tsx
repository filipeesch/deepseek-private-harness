/** Conversation navigation and Session-specific header content. */
import clsx from 'clsx'
import type { ConversationHeaderProps } from '../contract/slots.ts'
import { conversationPhase } from '../contract/snapshot.ts'
import css from './ConversationRoot.module.css'

/**
 * Render the Conversation header for the chrome its window occurrence asked for.
 * @param props - header variant, optional Session sources, and authorized header slots.
 * @returns the resident header row, or the Session header alone when embedded.
 */
export function ConversationHeader({
  variant, sessionId, useSession, useConversation, renderSlot,
}: ConversationHeaderProps) {
  const session = useSession(s => s)
  const conversation = useConversation(s => s)
  const blank = session === undefined || conversation === undefined
    || (session.blank && conversationPhase(session, conversation) === 'blank')
  const sessionHeader = sessionId === undefined
    // The empty title row keeps the blank-Session header height, so the
    // Hero centers its input card at the same offset before a Session exists.
    ? <div className={css.titleRow} />
    : renderSlot('conversation.session.header', { hideChrome: blank })
  if (variant === 'embedded') {
    return (
      <div
        className={clsx(css.header, css.headerEmbedded, blank && css.headerBlank)}
        data-conversation-header-embedded=""
      >
        {sessionHeader}
      </div>
    )
  }
  return (
    <header className={clsx(css.header, blank && css.headerBlank)} data-window-drag>
      <div className={css.headerLeading} data-conversation-header-leading="">
        {renderSlot('conversation.header.leading', {})}
      </div>
      {sessionHeader}
    </header>
  )
}
