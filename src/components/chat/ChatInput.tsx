// =============================================================================
// components/chat/ChatInput.tsx
// Campo de entrada do chat com botão de envio e ícone de sparkle.
// =============================================================================
'use client'

import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { Sparkles, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        const form = textareaRef.current?.closest('form')
        if (form) {
          form.requestSubmit()
        }
      }
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-nutri-border bg-nutri-surface flex items-end gap-2 rounded-2xl border px-3 py-2"
    >
      {/* Sparkle icon */}
      <Sparkles size={16} className="text-muted-foreground mb-2 flex-shrink-0" aria-hidden="true" />

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id="chat-input"
        aria-label="Mensagem para a Nutri IA"
        placeholder="Digite sua mensagem..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={isLoading}
        rows={1}
        className={cn(
          'text-foreground placeholder:text-muted-foreground/50 bg-transparent',
          'flex-1 resize-none text-[12.5px] leading-relaxed',
          'focus:outline-none disabled:opacity-50',
          'max-h-[120px] overflow-y-auto',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        )}
      />

      {/* Send button */}
      <button
        type="submit"
        id="chat-send-button"
        aria-label="Enviar mensagem"
        disabled={isLoading || !value.trim()}
        className={cn(
          'mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl',
          'transition-nutri focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:outline-none',
          value.trim() && !isLoading
            ? 'bg-nutri-primary glow-primary text-white hover:opacity-90'
            : 'bg-nutri-surface-overlay text-muted-foreground cursor-not-allowed',
        )}
      >
        <ArrowUp size={14} strokeWidth={2.5} />
      </button>
    </form>
  )
}
