// =============================================================================
// app/layout.tsx
// Root Layout — Server Component.
// Aplica a classe "dark" no <html> e injeta o <ClientProvider>.
// NÃO tem "use client" — mantém todos os benefícios de Server Components.
// =============================================================================
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ClientProvider } from '@/components/providers/ClientProvider'
import './globals.css'

// ─── Fontes ───────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Nutri — Monitoramento Nutricional com IA',
    template: '%s | Nutri',
  },
  description:
    'Plataforma SaaS de monitoramento nutricional com inteligência artificial. Acompanhe calorias, macros e receba insights personalizados.',
  keywords: ['nutrição', 'monitoramento nutricional', 'dieta', 'macros', 'IA', 'saúde'],
  authors: [{ name: 'Nutri' }],
  robots: { index: false, follow: false }, // Closed source — não indexar
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Nutri',
    title: 'Nutri — Monitoramento Nutricional com IA',
    description: 'Acompanhe sua nutrição com o poder da inteligência artificial.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0e18',
  colorScheme: 'dark',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode
}

import { Suspense } from 'react'

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NuqsAdapter>
          <Suspense fallback={null}>
            <ClientProvider>{children}</ClientProvider>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  )
}
