import { quizKind } from '@/domain/progress';
import type { QuizItem } from '@/domain/trail';

/** O que dizer depois de um erro, conforme o formato da pergunta. */
export function retryText(item: QuizItem): string {
  switch (quizKind(item)) {
    case 'order':
      return 'Toque numa peça da linha para tirá-la e verifique de novo.';
    case 'bug':
      return 'Tente outra linha.';
    default:
      return 'Tente outra opção.';
  }
}
