import type { Trail } from '@/domain/trail/types';
import { dadosModelagemModules } from './modules';

/**
 * Lua da Modelagem (Etapa 14A): primeira lua da Era dos Dados. Recebeu os módulos de
 * modelagem que antes ficavam no fim da ilha principal (os ids não mudaram; o progresso
 * foi junto, ver `content/relocations.ts`). O chefe e a insígnia chegam na Etapa 14C;
 * o lugar da lua no mapa, na 14B.
 */
export const dadosModelagemTrail: Trail = {
  id: 'dados-modelagem',
  title: 'Lua da Modelagem',
  tagline: 'Antes do primeiro CREATE TABLE, alguém precisa desenhar o banco.',
  symbol: 'data-model',
  accent: '#c9a2ff',
  eyebrow: 'Satélite dos Dados · Lua da Modelagem',
  intro: [
    'Viajante, esta lua gira em volta da Era dos Dados. Lá embaixo você aprendeu a escrever SQL. Aqui a pergunta é outra: <b>como decidir que tabelas criar</b>?',
    'O Eco adora este lugar. Ele copia o mesmo dado em três tabelas e depois ri quando uma cópia discorda da outra. Modelar direito é o que tira esse poder dele.',
    'Vamos desenhar entidades, ligar relacionamentos e arrumar tabela bagunçada até nada se repetir à toa. Bora?',
  ],
  modules: dadosModelagemModules,
  lab: 'sql',
};
