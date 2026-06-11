// =============================================================================
// components/chat/ChatMessage.tsx
// Bolha de mensagem individual do Chat IA.
// Suporta role "user" e "assistant" com estilos distintos.
// =============================================================================

import { cn } from '@/lib/utils'
import { Activity } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CURRENT_USER_NAME } from '@/lib/current-user'
import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

function getTextContent(message: UIMessage): string {
  if (!message.parts) return ''
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('')
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const text = getTextContent(message)

  const userInitials = CURRENT_USER_NAME.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  if (!text) return null

  return (
    <div
      className={cn(
        'flex w-full gap-3',
        isUser ? 'flex-row-reverse items-end' : 'flex-row items-start',
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar className="border-nutri-border h-7 w-7 flex-shrink-0 border">
          <AvatarFallback className="bg-nutri-primary text-xs font-semibold text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="bg-nutri-surface-elevated border-nutri-border flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border">
          <Activity size={13} className="text-nutri-primary" strokeWidth={2.5} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed',
          isUser
            ? 'bg-nutri-primary/15 text-foreground rounded-br-sm'
            : 'bg-nutri-surface border-nutri-border text-foreground rounded-bl-sm border',
        )}
      >
        {text}
      </div>
    </div>
  )
}

// ─── Typing indicator (while streaming) ──────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-nutri-surface-elevated border-nutri-border flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border">
        <Activity size={13} className="text-nutri-primary" strokeWidth={2.5} />
      </div>
      <div className="bg-nutri-surface border-nutri-border flex items-center gap-1.5 rounded-2xl rounded-bl-sm border px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-muted-foreground h-1.5 w-1.5 rounded-full opacity-60"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
