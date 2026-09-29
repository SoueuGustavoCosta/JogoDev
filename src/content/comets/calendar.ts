import type { Comet } from '@/domain/comets';

/**
 * Calendário dos Cometas de tecnologia. Para trocar datas, edite só este arquivo: cada
 * cometa fica 14 dias no céu, com 1 dia de céu limpo antes do próximo (o teste
 * `content/comets.test.ts` confere). Datas em ISO 8601 com o fuso de São Paulo.
 * Depois do último, o céu mostra "Novos cometas em breve".
 *
 * TODO(autor): confirmar a data do primeiro cometa (proposta: segunda-feira, 12/10/2026).
 */
export const cometCalendar: readonly Comet[] = [
  {
    id: 'cometa-docker-2026',
    trailId: 'cometa-docker',
    name: 'Docker',
    from: '2026-10-12T00:00:00-03:00',
    to: '2026-10-26T00:00:00-03:00',
    rareBadgeId: 'cometa-docker-rara',
    commonBadgeId: 'cometa-docker-comum',
  },
  {
    id: 'cometa-linux-2026',
    trailId: 'cometa-linux',
    name: 'Linux',
    from: '2026-10-27T00:00:00-03:00',
    to: '2026-11-10T00:00:00-03:00',
    rareBadgeId: 'cometa-linux-rara',
    commonBadgeId: 'cometa-linux-comum',
  },
  {
    id: 'cometa-git-2026',
    trailId: 'cometa-git',
    name: 'Git',
    from: '2026-11-11T00:00:00-03:00',
    to: '2026-11-25T00:00:00-03:00',
    rareBadgeId: 'cometa-git-rara',
    commonBadgeId: 'cometa-git-comum',
  },
];
