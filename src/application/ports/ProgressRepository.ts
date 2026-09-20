import type { Progress } from '@/domain/progress';

export interface ProgressRepository {
  load(): Progress | null;
  save(progress: Progress): void;
  clear(): void;
}
