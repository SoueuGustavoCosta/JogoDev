import { migrateQuizResultKeys, type Progress, type QuizIdIndex } from '@/domain/progress';
import type { ProgressRepository } from '../ports';

/**
 * Envolve o repositório de progresso para que ninguém veja nem grave o formato antigo do
 * quiz (resultado pela posição da pergunta, antes da Etapa 3.5): a leitura devolve já
 * convertido para id, e toda gravação converte antes de salvar.
 *
 * É o único ponto por onde passam todas as fontes de progresso: o do aparelho
 * (localStorage), a cópia da nuvem (`adoptAccountProgress`/`syncProgressSafely` juntam e
 * gravam aqui) e o código importado (`importProgress`). Por isso a migração não precisa
 * ser repetida em cada caso de uso. O formato continua v1: nada de subir versão.
 *
 * `index` vem do conteúdo (`buildQuizIdIndex(trailRegistry)`), que só a apresentação conhece.
 */
export function withQuizIdMigration(repository: ProgressRepository, index: QuizIdIndex): ProgressRepository {
  const migrate = (progress: Progress) => migrateQuizResultKeys(progress, index);
  return {
    load() {
      const progress = repository.load();
      return progress ? migrate(progress) : progress;
    },
    save(progress) {
      repository.save(migrate(progress));
    },
    clear() {
      repository.clear();
    },
  };
}
