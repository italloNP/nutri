// =============================================================================
// app/dashboard/layout.tsx
// Layout do dashboard — Server Component.
// Estrutura: [Sidebar 64px] | [Header + Conteúdo (60%) | Chat IA (40%)]
// overflow-hidden no container raiz, scroll localizado por coluna.
// =============================================================================
import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { ChatIA } from '@/components/chat/ChatIA'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Painel principal de monitoramento nutricional.',
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    /*
     * Container raiz: 100dvh, overflow-hidden.
     * Scroll acontece APENAS dentro das colunas (nutri-scroll).
     */
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      {/* ── Sidebar esquerda (64px fixos) ── */}
      <Sidebar />

      {/* ── Área principal: Header + conteúdo de duas colunas ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header global do dashboard */}
        <DashboardHeader />

        {/* Conteúdo principal: duas colunas lado a lado */}
        <main className="flex flex-1 overflow-hidden">
          {/*
           * Coluna esquerda — 60%
           * Contém: Calendário (topo) + Gráfico (base)
           * Scroll localizado com nutri-scroll
           */}
          <section
            aria-label="Calendário e análise calórica"
            className="border-nutri-border nutri-scroll flex w-[60%] flex-shrink-0 flex-col gap-4 overflow-hidden border-r p-4"
          >
            {children}
          </section>

          {/*
           * Coluna direita — 40%
           * Contém: Chat IA (100% height, sem scroll externo)
           * O scroll interno é gerenciado pelo <ChatIA />
           */}
          <section
            aria-label="Assistente Nutri IA"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <ChatIA />
          </section>
        </main>
      </div>
    </div>
  )
}
