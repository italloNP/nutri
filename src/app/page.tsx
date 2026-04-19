// =============================================================================
// app/page.tsx
// Página raiz — redireciona para /dashboard.
// Implementado via redirect() do Next.js (Server Component puro).
// =============================================================================
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
