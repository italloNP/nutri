// =============================================================================
// components/chat/ChatIA.tsx
// Componente principal do Chat IA — coluna direita do dashboard.
//
// @ai-sdk/react v1.x API:
//   - useChat retorna { messages, sendMessage, status, stop }
//   - Input é estado local (useState), NÃO vem do hook
//   - sendMessage({ text }) faz o envio + streaming
//   - transport: TextStreamChatTransport (compatível com toTextStreamResponse)
// =============================================================================
'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { PenSquare, MoreHorizontal, Activity } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessageBubble, TypingIndicator } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickActions } from './QuickActions'

// Singleton transport com prepareSendMessagesRequest para injetar inputTimestamp dinâmico
// (não pode ser estático pois varia a cada envio de mensagem)
const chatTransport = new TextStreamChatTransport({
  api: '/api/chat',
  prepareSendMessagesRequest({ body, messages, ...rest }) {
    return {
      ...rest,
      body: {
        ...(body ?? {}),
        messages,
        inputTimestamp: new Date().toISOString(),
      },
    }
  },
})

export function ChatIA() {
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  // Auto-scroll quando chega nova mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  async function submit() {
    const text = inputValue.trim()
    if (!text || isStreaming) return
    setInputValue('')
    await sendMessage({ text })
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit()
  }

  function handleQuickAction(prompt: string) {
    if (isStreaming) return
    void sendMessage({ text: prompt })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-nutri-border flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-nutri-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
            <Activity size={14} className="text-nutri-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-foreground text-sm font-semibold">Sua Nutri IA</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Nova conversa"
            className="text-muted-foreground hover:text-foreground transition-nutri flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
          >
            <PenSquare size={14} />
          </button>
          <button
            type="button"
            aria-label="Mais opções"
            className="text-muted-foreground hover:text-foreground transition-nutri flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <ScrollArea className="nutri-scroll flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
          )}

          {/* Indicador de digitação enquanto aguarda resposta */}
          {isStreaming && messages.at(-1)?.role === 'user' && <TypingIndicator />}

          {/* Âncora de scroll */}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="border-nutri-border flex flex-shrink-0 flex-col gap-2.5 border-t px-4 py-3">
        <QuickActions onSelect={handleQuickAction} disabled={isStreaming} />
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleFormSubmit}
          isLoading={isStreaming}
        />
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="bg-nutri-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
        <Activity size={24} className="text-nutri-primary" strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-foreground text-sm font-medium">Como posso ajudar hoje?</p>
        <p className="text-muted-foreground text-xs">
          Pergunte sobre sua nutrição, registre refeições ou peça dicas personalizadas.
        </p>
      </div>
    </div>
  )
}
