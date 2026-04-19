import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── Strict TypeScript rules (Padrão Ouro) ──────────────────────────────────
  {
    rules: {
      // Proibido: any explícito ou inferido
      '@typescript-eslint/no-explicit-any': 'error',
      // Proibido: suprimir erros de tipo com comentário
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      // Proibido: variáveis e imports não utilizados
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Prefer interfaces over type aliases for object shapes
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      // Enforce explicit return types on public API functions
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Warn on non-null assertions (prefer safe narrowing)
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // General code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // ── Ignores ────────────────────────────────────────────────────────────────
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'drizzle/**']),
])

export default eslintConfig
