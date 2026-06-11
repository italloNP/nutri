// =============================================================================
// components/chat/QuickActions.tsx
// Botões de atalho rápido para o Chat IA.
// Cada botão envia um prompt pré-definido via onSelect callback.
// =============================================================================

import { cn } from '@/lib/utils'
import { CHAT_QUICK_ACTIONS } from '@/constants/nutrition'

interface QuickActionsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function QuickActions({ onSelect, disabled = false }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ações rápidas do chat">
      {CHAT_QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          id={`quick-action-${action.id}`}
          aria-label={action.label}
          disabled={disabled}
          onClick={() => onSelect(action.prompt)}
          className={cn(
            'border-nutri-border bg-nutri-surface hover:bg-nutri-surface-elevated',
            'text-muted-foreground hover:text-foreground transition-nutri',
            'rounded-full border px-3 py-1.5 text-[11px] font-medium',
            'focus-visible:ring-nutri-primary/40 focus-visible:ring-1 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
