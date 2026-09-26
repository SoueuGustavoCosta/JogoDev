import type { ModuleRecap } from '@/domain/progress';
import { XP_MODULE_COMPLETION_BONUS } from '@/domain/progress';
import type { Module, Trail } from '@/domain/trail';
import { Confetti, SintaxeFace } from '@/presentation/design-system';
import { SaveProgressNudge } from '@/presentation/features/save-progress';
import styles from './ModulePage.module.css';

export type ModuleResult = {
  fresh: boolean;
  trailCompleted: boolean;
  recap: ModuleRecap;
  firstBadge: boolean;
};

function sintaxeRecapLine(recap: ModuleRecap, name: string): string {
  const score = `${recap.firstTry} de ${recap.total} de primeira`;
  if (recap.tier === 'perfect') return `Perfeito, ${name}! ${score}. Você tá voando nesta era.`;
  if (recap.tier === 'good') return `Mandou bem, ${name}! ${score}, e o resto você destravou na insistência.`;
  return `Esse foi puxado, ${name}, e você não desistiu. É errando que a gente aprende de verdade.`;
}

function sintaxeTrailLine(recap: ModuleRecap, trailCompleted: boolean): string {
  if (trailCompleted || recap.modulesLeft === 0) return 'Você fechou a era inteira! O artefato está te esperando.';
  if (recap.modulesLeft === 1) return 'Falta só 1 salto pra fechar a era.';
  return `Faltam ${recap.modulesLeft} saltos pra fechar a era.`;
}

/** Fechamento de um salto (cristal, comentário da Sintaxe, próximo passo), igual nos dois modos de lição. */
export function ModuleCompletion({
  trail,
  next,
  result,
  travelerName,
  onNavigate,
}: {
  trail: Trail;
  next: Module | undefined;
  result: ModuleResult;
  travelerName: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className={styles.done}>
      {result.fresh ? <Confetti /> : null}
      <div className={styles.recap}>
        <SintaxeFace size={52} className={result.fresh ? styles.recapFace : undefined} />
        <div className={styles.bubble}>
          <b className={styles.bubbleName}>Senhorita Sintaxe</b>
          <p>
            {result.fresh ? sintaxeRecapLine(result.recap, travelerName) : 'Você já passou por aqui, e o XP deste salto já está contado.'}{' '}
            {sintaxeTrailLine(result.recap, result.trailCompleted)}
          </p>
        </div>
      </div>
      {result.firstBadge ? <SaveProgressNudge /> : null}
      <p>
        <b>Cristal aceso!</b>{' '}
        {result.fresh ? `Salto concluído: +${XP_MODULE_COMPLETION_BONUS} XP.` : 'XP já contabilizado.'}
      </p>
      {next ? (
        <button type="button" className={styles.next} onClick={() => onNavigate(`/trilhas/${trail.id}/modulos/${next.id}`)}>
          Saltar para o próximo ano ▸
        </button>
      ) : (
        <button type="button" className={styles.next} onClick={() => onNavigate(`/trilhas/${trail.id}`)}>
          {result.trailCompleted ? 'Ver o artefato da era ▸' : 'Voltar ao início da era ▸'}
        </button>
      )}
    </div>
  );
}
