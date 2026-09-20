import type { ExplorationMode } from '@/domain/progress';

/**
 * Padrão dentro de uma ilha: "sequential" (módulos liberam em ordem) ou "free"
 * (todos os módulos abertos). Decisão em aberto com o autor (seção 14 do
 * CLAUDE.md) — trocar aqui quando ele decidir.
 */
export const DEFAULT_EXPLORATION_MODE: ExplorationMode = 'sequential';
