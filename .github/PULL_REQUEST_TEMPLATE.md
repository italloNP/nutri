## 📋 Descrição

<!-- Descreva as mudanças deste PR de forma clara e concisa. -->
<!-- Vincule a issue relacionada: Closes #<número>  -->

Closes #

---

## 🔄 Tipo de Mudança

<!-- Marque com [x] o tipo aplicável. -->

- [ ] 🐛 Bug fix (correção que resolve um problema)
- [ ] 🚀 New feature (adição de funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📦 Dependency update (atualização de dependências)
- [ ] 🎨 UI/UX improvement (melhoria de interface)
- [ ] ♻️ Refactor (melhoria de código sem alterar funcionalidade)
- [ ] 🧪 Tests (adição ou atualização de testes)
- [ ] 📝 Documentation (atualização de documentação)
- [ ] ⚙️ CI/CD / Infra (mudanças em pipelines ou infraestrutura)

---

## ✅ Checklist Obrigatório

### Qualidade de Código

- [ ] O código segue os padrões da equipe (linting + Prettier)
- [ ] `npm run lint` roda sem erros
- [ ] `npm run type-check` roda sem erros (`any` e `@ts-ignore` são proibidos)
- [ ] Nenhum arquivo excede 300 linhas (regra anti-monolito)

### Testes

- [ ] Adicionei testes unitários para a lógica nova (se aplicável)
- [ ] Adicionei testes de integração para as rotas de API (se aplicável)
- [ ] Todos os testes existentes passam: `npm test`

### UI & Componentes

- [ ] Dark Mode foi verificado — nenhum elemento aparece em fundo branco
- [ ] A responsividade do layout 2 colunas foi preservada
- [ ] Nenhum componente novo ultrapassa 300 linhas
- [ ] Componentes Shadcn foram instalados via CLI (`npx shadcn-ui@latest add ...`)

### Segurança & Dados

- [ ] Nenhum secret, chave de API ou senha foi commitada
- [ ] `.env.example` foi atualizado para novas variáveis (se necessário)
- [ ] Variáveis de ambiente estão documentadas

### Banco de Dados (se aplicável)

- [ ] Nova migration do Drizzle foi gerada: `npx drizzle-kit generate`
- [ ] Migration foi revisada e não causa perda de dados

---

## 🖼 Screenshots / Gravações

<!-- Se inclui mudaças de UI, adicione antes/depois. -->

| Antes | Depois |
| ----- | ------ |
|       |        |

---

## 📝 Notas para Revisores

<!-- Algo específico que o revisor deve prestar atenção? Decisões de design? Trade-offs? -->
