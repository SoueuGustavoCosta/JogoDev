/**
 * Configuração do projeto Supabase que sustenta o "Hall dos Viajantes" (leaderboard
 * público, sem login). Mesmo padrão de `config/pix.ts`: valores públicos, comprometidos
 * no repositório — a chave "publishable"/anon não é segredo (o mesmo modelo de confiança
 * da chave Pix): quem protege os dados é o RLS do banco, não o sigilo da chave.
 *
 * AVISO(autor): o projeto Supabase é do plano gratuito e **pausa sozinho depois de
 * cerca de 1 semana sem chamadas de API**. Se o Hall dos Viajantes parar de funcionar
 * depois de um período sem visitas, entre no painel do Supabase
 * (https://supabase.com/dashboard/project/haukhnpiaczkkwncnmlu) e reative o projeto.
 * Não há mecanismo automático de "keep-alive" aqui de propósito (fora de escopo).
 */
export const SUPABASE_URL = 'https://haukhnpiaczkkwncnmlu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_IyKsl-wwwGuvp5uQ1gDusQ_uEbfN9NY';
