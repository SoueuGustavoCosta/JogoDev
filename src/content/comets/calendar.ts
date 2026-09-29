import type { Comet } from '@/domain/comets';

/**
 * Calendário dos Cometas de tecnologia. Para trocar datas, edite só este arquivo: cada
 * cometa fica 14 dias no céu, com 1 dia de céu limpo antes do próximo (o teste
 * `content/comets.test.ts` confere). Datas em ISO 8601 com o fuso de São Paulo.
 * Depois do último, o céu mostra "Novos cometas em breve".
 *
 * A Etapa 7 da expansão Nexus acrescenta Docker → Linux → Git.
 */
export const cometCalendar: readonly Comet[] = [];
