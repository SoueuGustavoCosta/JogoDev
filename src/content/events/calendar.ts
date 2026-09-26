import type { GameEvent } from '@/domain/events';

/**
 * CALENDÁRIO DE EVENTOS (Etapa 11). Para criar, mudar ou tirar um evento, edite só esta
 * lista (passo a passo no CLAUDE.md, seção 10). Datas no fuso de São Paulo (AAAA-MM-DD),
 * `to` inclusivo. Dias da semana: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'.
 * O teste `src/content/events.test.ts` confere tudo (datas, ids, prêmios) antes do deploy.
 *
 * Tipos:
 * - 'surto': XP multiplicado (`multiplier`, de 1.1 a 3) nas perguntas, conclusões e anomalia.
 *   Se dois Surtos caírem no mesmo dia, vale o maior (não somam).
 * - 'eco-solto': mini-chefe de 3 rodadas (rodadas em `ecoSolto.ts`). A primeira vitória dá
 *   o cosmético `rewardItemId`; as seguintes dão `bonusFragments` ◆ (uma vez por dia).
 * - 'convergencia': meta da turma no período (`target` anomalias consertadas por todos,
 *   contadas no Supabase). Batida a meta, o cosmético `rewardItemId` fica liberado para todos.
 *
 * Os prêmios precisam ser itens "só de evento" de `src/content/cosmetics` (price: null) com
 * o mesmo `event` (eco-solto ou convergencia).
 */
export const eventCalendar: GameEvent[] = [
  {
    id: 'surto-fim-de-semana',
    kind: 'surto',
    title: 'Surto temporal',
    description: 'XP em dobro',
    multiplier: 2,
    when: { weekly: ['sab', 'dom'] },
  },
  {
    id: 'eco-solto-sexta',
    kind: 'eco-solto',
    title: 'Eco Solto',
    description: 'mini-chefe de 3 rodadas com visual raro',
    rewardItemId: 'moldura-fenda',
    bonusFragments: 15,
    when: { weekly: ['sex'] },
  },
  {
    id: 'convergencia-2026-10',
    kind: 'convergencia',
    title: 'Convergência da turma',
    description: '100 anomalias consertadas juntos liberam a cor Convergência para todos.',
    target: 100,
    rewardItemId: 'cor-convergencia',
    when: { from: '2026-10-01', to: '2026-10-31' },
  },
];
