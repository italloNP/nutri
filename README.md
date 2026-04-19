<div align="center">
  <h1>🥦 Nutri</h1>
  <p><strong>SaaS de Monitoramento Nutricional com IA — Dark Mode First</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-4.x-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Shadcn%20UI-dark-000000?style=flat-square" alt="Shadcn UI" />
    <img src="https://img.shields.io/badge/Drizzle%20ORM-PostgreSQL-C5F74F?style=flat-square" alt="Drizzle" />
    <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions" alt="CI" />
  </p>
</div>

---

## 📖 Visão Geral

**Nutri** é uma plataforma SaaS de monitoramento nutricional com inteligência artificial integrada. A aplicação oferece:

- 📅 **Calendário de Nutrição** — Visualização diária de macros e calorias com modal de detalhes
- 📊 **Gráfico de Análise** — Consumo vs. Meta de Manutenção com anotações contextuais
- 🤖 **Chat com IA** — Assistente nutricional em tempo real via streaming (Vercel AI SDK)
- 🔐 **Autenticação Segura** — NextAuth.js com soberania total dos dados (PostgreSQL)

---

## 🏗 Arquitetura

```
nutri/
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── (auth)/             # Route group: login, register
│   │   ├── (dashboard)/        # Route group: área logada
│   │   │   └── dashboard/      # Página principal
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth handler
│   │       └── chat/           # Vercel AI SDK streaming endpoint
│   ├── components/
│   │   ├── ui/                 # Shadcn UI primitives (auto-gerado)
│   │   ├── layout/             # Sidebar, LeftColumn, RightColumn
│   │   ├── calendar/           # <Calendar />, <DayModal />
│   │   ├── chart/              # <CalorieChart />
│   │   └── chat/               # <ChatIA />, <ChatMessage />
│   ├── context/                # <ClientProvider /> com Context + TanStack Query
│   ├── hooks/                  # Custom hooks (useDayLogs, useCalorieChart, etc.)
│   ├── lib/
│   │   ├── db/                 # Drizzle ORM: schema, migrations, client
│   │   ├── auth/               # NextAuth config e adapters
│   │   └── utils.ts            # Utilitários genéricos
│   ├── types/                  # Interfaces TypeScript exportáveis
│   └── constants/              # Constantes de domínio (macros default, etc.)
├── .github/
│   ├── workflows/ci.yml        # CI: lint + type-check + build
│   ├── ISSUE_TEMPLATE/         # Bug Report & Feature Request
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/pre-commit           # Hook: lint-staged antes de cada commit
├── .env.example                # Mapa de todas as variáveis de ambiente
├── .prettierrc                 # Configuração Prettier + plugin Tailwind
├── eslint.config.mjs           # ESLint strict + no-any enforced
└── drizzle.config.ts           # Configuração Drizzle Kit
```

---

## 🚀 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** v20+ (recomendamos via [nvm](https://github.com/nvm-sh/nvm))
- **PostgreSQL** 15+ (local ou via Docker)
- **npm** v10+

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/nutri.git
cd nutri
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais reais. Nunca commite este arquivo.

### 3. Configure o banco de dados

```bash
# Inicie um PostgreSQL local via Docker (opcional)
docker run --name nutri-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nutri_db -p 5432:5432 -d postgres:15

# Gere e aplique as migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🧰 Stack Técnica

| Camada         | Tecnologia            | Versão |
| -------------- | --------------------- | ------ |
| Framework      | Next.js (App Router)  | 16+    |
| Linguagem      | TypeScript Strict     | 5+     |
| UI Primitives  | Shadcn UI (Dark Mode) | Latest |
| Estilização    | Tailwind CSS          | 4+     |
| IA / Chat      | Vercel AI SDK         | Latest |
| Banco de Dados | PostgreSQL            | 15+    |
| ORM            | Drizzle ORM           | Latest |
| Autenticação   | NextAuth.js (Auth.js) | 5+     |
| Server State   | TanStack Query        | 5+     |
| Gráficos       | Recharts              | 2+     |
| Ícones         | Lucide React          | Latest |

---

## 🔧 Comandos Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint
npm run lint:fix     # ESLint com auto-fix
npm run format       # Prettier (formatar)
npm run format:check # Prettier (verificar)
npm run type-check   # TypeScript sem emitir arquivos
```

---

## 📦 Componentes Shadcn UI

Antes de usar qualquer componente, instale-o via CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tooltip
```

---

## 🔒 Regras de Contribuição

1. **Sem `any`** — O ESLint bloqueia o uso de `any` explícito e `@ts-ignore`.
2. **Sem monolitos** — Nenhum arquivo deve ultrapassar 300 linhas.
3. **Dark Mode obrigatório** — Nenhum elemento deve aparecer em fundo claro.
4. **Commit limpo** — O Husky executa `lint-staged` antes de cada commit.
5. **PR obrigatório** — Toda mudança deve passar pelo template de PR e pelo CI.

Consulte [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) e os [templates de issue](.github/ISSUE_TEMPLATE/).

---

## 📄 Licença

Este projeto é **Closed Source** e de propriedade privada. Todos os direitos reservados.
