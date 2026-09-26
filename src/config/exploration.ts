import type { ExplorationMode, LessonMode } from '@/domain/progress';

/**
 * Padrão dentro de uma ilha: "sequential" (módulos liberam em ordem) ou "free"
 * (todos os módulos abertos). Decisão em aberto com o autor (seção 14 do
 * CLAUDE.md) — trocar aqui quando ele decidir.
 */
export const DEFAULT_EXPLORATION_MODE: ExplorationMode = 'sequential';

/**
 * Como a lição aparece por padrão (plano de engajamento, Etapa 3): "telas" (telas curtas
 * com perguntas intercaladas, o `LessonPlayer`) ou "rolagem" (tudo numa página com o quiz
 * no fim, o formato antigo). Cada viajante pode trocar em Viajante → "Modo leitura".
 */
export const DEFAULT_LESSON_MODE: LessonMode = 'telas';
