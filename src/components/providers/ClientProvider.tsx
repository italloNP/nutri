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

import { useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const cleanUpExtensions = () => {
      // Classes, IDs e seletores comuns que a extensão de tradução injeta
      const selectors = [
        '[class*="immersive-translate"]',
        '[id*="immersive-translate"]',
        '[class*="imt-fb"]',
        'immersive-translate-input-button',
        'immersive-translate-hover-button',
        'immersive-translate-floating-ball',
        '.immersive-translate-clickable-button',
        '.immersive-translate-input-button',
      ]

      selectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((el) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.setProperty('display', 'none', 'important')
            htmlEl.style.setProperty('opacity', '0', 'important')
            htmlEl.style.setProperty('pointer-events', 'none', 'important')
            htmlEl.style.setProperty('visibility', 'hidden', 'important')
            htmlEl.style.setProperty('width', '0', 'important')
            htmlEl.style.setProperty('height', '0', 'important')
          })
        } catch {
          // ignorar erros de seletor
        }
      })

      // Buscar por qualquer custom element que comece com 'immersive-translate' ou 'imt-'
      const allElements = document.getElementsByTagName('*')
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i]
        const tagName = el.tagName.toLowerCase()
        if (tagName.startsWith('immersive-translate') || tagName.startsWith('imt-')) {
          const htmlEl = el as HTMLElement
          htmlEl.style.setProperty('display', 'none', 'important')
          htmlEl.style.setProperty('opacity', '0', 'important')
          htmlEl.style.setProperty('pointer-events', 'none', 'important')
          htmlEl.style.setProperty('visibility', 'hidden', 'important')
        }
      }
    }

    // Executar limpeza inicial
    cleanUpExtensions()

    // Configurar MutationObserver para capturar e limpar injeções assíncronas da extensão
    const observer = new MutationObserver(() => {
      cleanUpExtensions()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <NutriProvider>{children}</NutriProvider>
    </QueryClientProvider>
  )
}
