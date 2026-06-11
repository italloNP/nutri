// =============================================================================
// drizzle.config.ts
// Configuração do Drizzle Kit — CLI para migrations e schema inspection.
// =============================================================================
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import { resolve } from 'path'

// drizzle-kit não carrega .env.local automaticamente (só o Next.js dev server faz isso)
config({ path: resolve(process.cwd(), '.env.local') })

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
