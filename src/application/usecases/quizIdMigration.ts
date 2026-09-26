import {
  migrateQuizResultKeys,
  restoreFromQuizBackup,
  withQuizBackup,
  type Progress,
  type QuizIdIndex,
} from '@/domain/progress';
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
 * Transição (decisão do autor, 2026-09-26): toda gravação também guarda uma cópia dos
 * resultados na raiz (`quizBackup`), e toda leitura devolve aos módulos o que só estiver
 * na cópia. Assim, se uma aba com o app antigo juntar cópias com o merge antigo (que
 * descarta as chaves por id), nada se perde. TODO(autor): remover a partir de 2026-10-24.
 *
 * `index` vem do conteúdo (`buildQuizIdIndex(trailRegistry)`), que só a apresentação conhece.
 */
export function withQuizIdMigration(repository: ProgressRepository, index: QuizIdIndex): ProgressRepository {
  const migrate = (progress: Progress) => restoreFromQuizBackup(migrateQuizResultKeys(progress, index));
  return {
    load() {
      const progress = repository.load();
      return progress ? migrate(progress) : progress;
    },
    save(progress) {
      repository.save(withQuizBackup(migrate(progress)));
    },
    clear() {
      repository.clear();
    },
  };
}
