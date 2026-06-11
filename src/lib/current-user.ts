// =============================================================================
// lib/current-user.ts
// Constantes do usuário ativo para a fase sem autenticação (Etapas 6).
//
// TEMPORÁRIO: Quando Auth.js for adicionado na Etapa 7, este arquivo
// será substituído por session.user obtido via getServerSession() ou useSession().
// =============================================================================

/** ID do usuário fixo (Ana Carolina) — gerado no seed e nunca alterado */
export const CURRENT_USER_ID = 'usr_ana_carolina_001'

/** Nome do usuário para exibição em componentes client-side */
export const CURRENT_USER_NAME = 'Ana Carolina'
