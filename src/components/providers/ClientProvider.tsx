// =============================================================================
// components/providers/ClientProvider.tsx
// Barreira Client/Server: este arquivo tem "use client" e encapsula todos os
// providers que dependem de APIs de browser. Os Server Components do App Router
// ficam completamente isolados desta camada.
//
// Hierarquia de providers:
//   QueryClientProvider (TanStack Query — server state)
//     └── NutriProvider (UI state partilhado — selectedDate, modal, etc.)
//           └── children (layout, páginas, componentes)
// =============================================================================
'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NutriProvider } from '@/context/NutriContext'

// ─── QueryClient factory ──────────────────────────────────────────────────────
// Criado dentro do componente para evitar compartilhamento entre requests
// (problema clássico de SSR com singletons).

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mantenha dados frescos por 30s antes de refetch em background
        staleTime: 30 * 1000,
        // Retry apenas 1x em caso de falha (defaults são 3x)
        retry: 1,
        // Não refetch ao focar a janela em dev (evita ruído)
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

// ─── Singleton para o client-side (evita recriação em HMR) ───────────────────
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: sempre novo (isolamento por request)
    return makeQueryClient()
  }
  // Browser: singleton (preserva cache entre re-renders e HMR)
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// ─── Provider Component ───────────────────────────────────────────────────────

interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  // useState garante que o QueryClient não seja recriado em re-renders
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <NutriProvider>{children}</NutriProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
