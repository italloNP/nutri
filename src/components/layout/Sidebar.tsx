// =============================================================================
// components/layout/Sidebar.tsx
// Sidebar esquerda de 64px (ícones) com active state e navegação.
// "use client" — usa usePathname para detectar rota ativa.
// Máx 300 linhas — componente dedicado conforme regra anti-monolito.
// =============================================================================
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LayoutDashboard, UtensilsCrossed, User, Settings, Sparkles, Activity } from 'lucide-react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  href: string
  icon: React.ElementType
  label: string
}

// ─── Configuração de navegação ────────────────────────────────────────────────

const TOP_NAV: NavItem[] = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Painel Principal' },
  { id: 'nutri', href: '/dashboard/nutri', icon: UtensilsCrossed, label: 'Painel Nutri' },
  { id: 'profile', href: '/dashboard/profile', icon: User, label: 'Perfil de Usuário' },
]

const BOTTOM_NAV: NavItem[] = [
  { id: 'settings', href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
]

// ─── Sub-componente: Item de navegação ────────────────────────────────────────

interface NavItemButtonProps {
  item: NavItem
  isActive: boolean
}

function NavItemButton({ item, isActive }: NavItemButtonProps) {
  const Icon = item.icon

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                'transition-nutri flex h-10 w-10 items-center justify-center rounded-xl',
                isActive
                  ? 'sidebar-item-active glow-primary'
                  : 'text-sidebar-foreground/60 hover:text-foreground hover:bg-white/5',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          }
        />
        <TooltipContent side="right">
          <p className="text-xs font-medium">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside
      aria-label="Navegação principal"
      className={cn(
        'flex h-full w-16 flex-shrink-0 flex-col items-center',
        'border-nutri-border bg-sidebar border-r py-4',
      )}
    >
      {/* Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center">
        <div className="bg-nutri-primary glow-primary flex h-9 w-9 items-center justify-center rounded-xl">
          <Activity size={18} className="text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Divider */}
      <div className="divider-gradient mb-4 w-8" />

      {/* Top navigation items */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {TOP_NAV.map((item) => (
          <NavItemButton key={item.id} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Sparkles — quick AI access */}
      <div className="mb-2">
        <TooltipProvider delay={300}>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Nutri IA"
                  className="text-sidebar-foreground/40 transition-nutri hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/5"
                >
                  <Sparkles size={18} strokeWidth={2} />
                </button>
              }
            />
            <TooltipContent side="right">
              <p className="text-xs font-medium">Nutri IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom navigation items */}
      <nav className="flex flex-col items-center gap-2">
        {BOTTOM_NAV.map((item) => (
          <NavItemButton key={item.id} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>
    </aside>
  )
}
