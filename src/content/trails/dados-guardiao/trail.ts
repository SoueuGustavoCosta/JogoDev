import type { Trail } from '@/domain/trail/types';
import { dadosGuardiaoModules } from './modules';

/**
 * Lua do Guardião (Etapa 14A): segunda lua da Era dos Dados. Recebeu os módulos avançados
 * que antes fechavam a ilha principal: índices, transações, views, segurança e o projeto
 * final (os ids não mudaram; o progresso foi junto, ver `content/relocations.ts`). O chefe
 * e a insígnia chegam na Etapa 14C; o lugar da lua no mapa, na 14B.
 */
export const dadosGuardiaoTrail: Trail = {
  id: 'dados-guardiao',
  title: 'Lua do Guardião',
  tagline: 'Um banco de verdade precisa ser rápido, consistente e bem trancado.',
  symbol: 'data-guard',
  accent: '#3ee0a1',
  eyebrow: 'Satélite dos Dados · Lua do Guardião',
  intro: [
    'Viajante, esta é a lua de quem cuida do banco depois que ele está no ar. Aqui ninguém pergunta só "funciona?", pergunta também "aguenta?".',
    'O Eco deixou armadilhas: consultas lentas, transações pela metade e portas abertas para quem não devia entrar.',
    'Vamos acelerar com índices, fechar transações do jeito certo e dar a cada pessoa só a permissão que ela precisa. No fim, um projeto inteiro seu. Bora?',
  ],
  modules: dadosGuardiaoModules,
  lab: 'sql',
};
