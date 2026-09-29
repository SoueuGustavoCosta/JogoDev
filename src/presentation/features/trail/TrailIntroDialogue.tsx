import { useEffect, useState } from 'react';
import { interpolate } from '@/domain/prologue';
import { getTraveler } from '@/application/usecases';
import { playSintaxeTalkSound, SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './TrailIntroDialogue.module.css';

const SEEN_KEY_PREFIX = 'viajante:trail-intro-seen:';

/** Falha silenciosa e segura se o sessionStorage estiver bloqueado (modo privado). */
function readSeen(trailId: string): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY_PREFIX + trailId) === '1';
  } catch {
    return false;
  }
}

function markSeen(trailId: string): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY_PREFIX + trailId, '1');
  } catch {
    // modo privado ou storage bloqueado: segue sem lembrar, sem quebrar a tela.
  }
}

/**
 * Conversa curta e obrigatória com a Senhorita Sintaxe antes de abrir a visão geral de uma
 * trilha (padrão de fluxo do CLAUDE-STORY.md: chegada → conversa → jogo). Só bloqueia a
 * primeira visita nesta aba (sessionStorage, estado de apresentação, não progresso do aluno).
 */
export function TrailIntroDialogue({
  trailId,
  lines,
  onDone,
}: {
  trailId: string;
  lines: string[];
  onDone: () => void;
}) {
  const { progressRepository } = useServices();
  // As falas usam `{name}` para o nome do viajante, como no prólogo e nos blocos `say`.
  const [name] = useState(() => getTraveler({ repository: progressRepository }).name);
  const [step, setStep] = useState(0);
  const isLast = step === lines.length - 1;

  // Cada fala nova da Sintaxe vem com a "voz" dela (bipes curtos, bem baixos).
  useEffect(() => {
    playSintaxeTalkSound();
  }, [step]);

  function finish() {
    markSeen(trailId);
    onDone();
  }

  function next() {
    if (isLast) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button type="button" className={styles.skip} onClick={finish}>
          Pular
        </button>
      </div>

      <div className={styles.stage}>
        <SintaxeFace size={64} />
        <div className={styles.bubble} role="log" aria-live="polite" aria-label="Conversa com a Senhorita Sintaxe" key={step}>
          <div className={styles.who}>Senhorita Sintaxe</div>
          <p dangerouslySetInnerHTML={{ __html: interpolate(lines[step], name) }} />
        </div>
      </div>

      <button type="button" className={styles.continue} onClick={next}>
        {isLast ? 'Começar' : 'Continuar'} ▸
      </button>
    </div>
  );
}

export function hasSeenTrailIntro(trailId: string): boolean {
  return readSeen(trailId);
}
