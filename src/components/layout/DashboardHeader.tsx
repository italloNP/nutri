// =============================================================================
// components/layout/DashboardHeader.tsx
// Barra de topo: logo textual, pesquisa, ícones de notificação e avatar.
// "use client" — usa estado para input de pesquisa.
// =============================================================================
'use client'

import { useState } from 'react'
import { Search, Bell, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MOCK_USER } from '@/lib/mock-data'

export function DashboardHeader() {
  const [searchValue, setSearchValue] = useState('')

  const initials = MOCK_USER.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <header
      className={cn(
        'flex h-14 flex-shrink-0 items-center gap-4 px-6',
        'border-nutri-border bg-background/80 border-b backdrop-blur-sm',
      )}
    >
      {/* Logo / Title */}
      <div className="mr-2 flex items-center gap-2">
        <span className="text-foreground text-base font-bold tracking-tight">Nutri</span>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm flex-1">
        <Search
          size={14}
          className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
        />
        <Input
          id="dashboard-search"
          type="search"
          placeholder="Pesquisar dashboard..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            'h-8 pl-8 text-xs',
            'bg-nutri-surface border-nutri-border',
            'placeholder:text-muted-foreground/50',
            'focus-visible:ring-nutri-primary/40',
          )}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action icons */}
      <div className="flex items-center gap-1">
        {/* Mail */}
        <button
          type="button"
          aria-label="Mensagens"
          className="text-muted-foreground transition-nutri hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5"
        >
          <Mail size={16} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notificações"
          className="text-muted-foreground transition-nutri hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5"
        >
          <Bell size={16} />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
          >
            3
          </Badge>
        </button>

        {/* Avatar */}
        <Avatar className="border-nutri-border ml-1 h-7 w-7 cursor-pointer border">
          <AvatarFallback className="bg-nutri-primary text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
