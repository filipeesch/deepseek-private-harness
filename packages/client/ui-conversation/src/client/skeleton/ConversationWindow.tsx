/** The whole Conversation window: its Session header and its body. */
import type { ConversationWindowProps } from '../contract/slots.ts'
import { conversationPhase } from '../contract/snapshot.ts'
import { ConversationWidthControls } from './ConversationWidthControls.tsx'
import css from './ConversationRoot.module.css'

/**
 * Transcript resize handles are resident-panel chrome: an embedded occurrence
 * is sized by the panel it lives in, so it selects no width controls.
 */
const MAIN_CONTENT_SLOTS = { widthControls: ConversationWidthControls }

/**
 * Render one Conversation window occurrence for the Session bound at this
 * render position.
 * @param props - occurrence variant, standard Session sources, the declared
 * Conversation header seat, and the Factory renderer.
 * @returns the window root carrying its header and its body.
 */
export function ConversationWindow(props: ConversationWindowProps) {
  const {
    variant, sessionId, useSession, useSessions, useConversation, renderSlot, renderFactorySlot,
  } = props
  const session = useSession(s => s)
  const conversation = useConversation(s => s)
  const shellPhase = session === undefined || conversation === undefined
    ? 'blank'
    : conversationPhase(session, conversation)
  const openState = session?.openState
  const summaryBlank = useSessions(s => sessionId === undefined ? undefined : s.byId[sessionId]?.blank)

  // While a session is still replaying (loading + blank) the hero/docked
  // choice is unknowable — render the composer hidden instead of flashing
  // the centered hero and snapping to the docked bar (or vice versa).
  // Exemption: a session the list summary already proves blank can only
  // land on the hero, so hiding would blank the column for the whole
  // history round-trip (the startup auto-selection flash) for nothing.
  // The exemption is deliberately open-state-wide, not loading-only: a
  // summary-blank session is the hero before its open starts (`cold`) and
  // after one fails (`error`) for the same reason — there is no history.
  const settling = sessionId !== undefined && shellPhase === 'blank' && openState === 'loading' && summaryBlank !== true
  const hero = sessionId === undefined
    || (shellPhase === 'blank' && (openState === 'open' || summaryBlank === true))
  const phase = settling ? 'settling' : hero ? 'hero' : 'active'

  return (
    <div className={css.root} data-phase={phase}>
      {renderSlot('conversation.header', { variant })}
      {renderFactorySlot(
        'conversation.content',
        { variant, phase, hero },
        variant === 'main' ? { slots: MAIN_CONTENT_SLOTS } : undefined,
      )}
    </div>
  )
}
