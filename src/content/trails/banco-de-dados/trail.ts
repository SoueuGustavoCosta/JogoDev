import type { Trail } from '@/domain/trail/types';
import { bancoDeDadosModules } from './modules';
import { bancoDeDadosMissions } from './missions';

export const bancoDeDadosTrail: Trail = {
  id: 'banco-de-dados',
  title: 'Banco de Dados',
  tagline: 'Do primeiro CREATE TABLE às transações: PostgreSQL de verdade, no seu navegador.',
  symbol: 'database-cylinder',
  accent: '#9b4dff',
  modules: bancoDeDadosModules,
  missions: bancoDeDadosMissions,
  lab: 'sql',
};
