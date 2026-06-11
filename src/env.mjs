import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Variáveis de ambiente que ficam no servidor.
   * Só estão disponíveis no Node.js/Edge.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    OPENROUTER_API_KEY: z.string().min(1),
    OPENROUTER_MODEL: z.string().optional(),
  },

  /**
   * Variáveis de ambiente expostas para o cliente (precisam do prefixo NEXT_PUBLIC_).
   */
  client: {},

  /**
   * Onde associamos manualmente as variáveis. Evita vazamentos para o client-side.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  },

  /**
   * Skip validation for CI or build steps where these might not be available
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
