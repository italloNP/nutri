// =============================================================================
// lib/db/index.ts
// Singleton de conexão com o PostgreSQL via Drizzle ORM.
//
// Usa o padrão global singleton para evitar múltiplas conexões no
// hot reload do Next.js dev mode (cada save recria o módulo).
// Em produção, o pool é gerenciado automaticamente.
// =============================================================================
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

type PostgresClient = ReturnType<typeof postgres>

// Evita múltiplas conexões durante hot-reload no dev
import { env } from '@/env.mjs'

const globalForDb = globalThis as typeof globalThis & {
  _nutri_pg?: PostgresClient
}

function createClient(): PostgresClient {
  const url = env.DATABASE_URL
  if (!url) {
    throw new Error(
      '[nutri/db] DATABASE_URL não definida. ' +
        'Adicione ao .env.local e reinicie o servidor de desenvolvimento.',
    )
  }
  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

const client = globalForDb._nutri_pg ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalForDb._nutri_pg = client
}

export const db = drizzle(client, { schema })
