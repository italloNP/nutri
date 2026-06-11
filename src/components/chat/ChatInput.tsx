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
      translate="no"
      className="border-nutri-border bg-nutri-surface notranslate focus-within:border-nutri-primary/30 focus-within:ring-nutri-primary/20 flex items-end gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-all focus-within:ring-1"
    >
      {/* Sparkle icon */}
      <Sparkles
        size={15}
        className="text-muted-foreground/60 mb-1.5 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id="chat-input"
        translate="no"
        aria-label="Mensagem para a Nutri IA"
        placeholder="Digite sua mensagem..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={isLoading}
        rows={1}
        className={cn(
          'text-foreground placeholder:text-muted-foreground/40 bg-transparent',
          'flex-1 resize-none text-[13px] leading-relaxed',
          'focus:outline-none disabled:opacity-50',
          'max-h-[120px] overflow-y-auto',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
          'notranslate',
        )}
      />

      {/* Send button */}
      <button
        type="submit"
        id="chat-send-button"
        aria-label="Enviar mensagem"
        disabled={isLoading || !value.trim()}
        className={cn(
          'mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl',
          'focus-visible:ring-nutri-primary transition-all duration-200 focus-visible:ring-1 focus-visible:outline-none',
          'active:scale-95',
          value.trim() && !isLoading
            ? 'bg-nutri-primary glow-primary hover:bg-nutri-primary/90 text-white hover:scale-105'
            : 'text-muted-foreground/40 cursor-not-allowed bg-white/5',
        )}
      >
        <ArrowUp size={15} strokeWidth={2.5} className="transition-transform duration-200" />
      </button>
    </form>
  )
}
