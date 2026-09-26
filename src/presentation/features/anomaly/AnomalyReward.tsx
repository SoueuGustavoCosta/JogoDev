import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SolveAnomalyResult } from '@/application/usecases';
import { ANCHOR_EVERY_DAYS } from '@/domain/traveler';
import { TimelineNodes } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './AnomalyReward.module.css';

/** Recompensa depois da anomalia (mockup novo-5-e-recompensa): dias de linha estável e a próxima âncora. */
export function AnomalyReward({ number, reward }: { number: number; reward: SolveAnomalyResult }) {
  const { clipboard, shareText } = useServices();
  const [shared, setShared] = useState<string | null>(null);
  const t = reward.timeline;
  const current = t?.current ?? 0;
  const inCycle = current > 0 ? ((current - 1) % ANCHOR_EVERY_DAYS) + 1 : 0;
  const nodes = Array.from({ length: ANCHOR_EVERY_DAYS }, (_, i) => ({
    label: i === ANCHOR_EVERY_DAYS - 1 ? 'âncora' : '',
    state: i < inCycle ? ('played' as const) : i === ANCHOR_EVERY_DAYS - 1 ? ('anchor-goal' as const) : ('future' as const),
  }));

  async function share() {
    const text = `Consertei a anomalia #${number} no Arquipélago: ${current} ${current === 1 ? 'dia' : 'dias'} de linha estável. Bora?`;
    const outcome = await shareText(clipboard, { text, url: window.location.origin });
    setShared(outcome === 'copied' ? 'Texto copiado. É só colar no grupo da turma.' : outcome === 'shared' ? 'Enviado!' : null);
  }

  return (
    <div className={styles.root} role="status">
      <p className={styles.eyebrow}>anomalia #{number} consertada</p>
      <p className={styles.big}>{current}</p>
      <p className={styles.caption}>{current === 1 ? 'dia de linha estável' : 'dias de linha estável'}</p>
      <TimelineNodes nodes={nodes} caption={`${inCycle} de ${ANCHOR_EVERY_DAYS} dias até a próxima âncora`} />
      <div className={styles.chips}>
        <span className={styles.xp}>+{reward.xp} XP</span>
        <span className={styles.fragment}>+{reward.fragments} ◆</span>
      </div>
      <p className={styles.text}>
        {t?.gainedAnchor ? (
          <>
            Você ganhou uma <b>Âncora Temporal</b>! Ela segura a linha num dia que você não puder jogar.
          </>
        ) : t && t.daysToAnchor > 0 ? (
          <>
            Mais {t.daysToAnchor === 1 ? '1 dia' : `${t.daysToAnchor} dias`} e você ganha uma <b>Âncora Temporal</b>: ela segura a
            linha num dia que você não puder jogar.
          </>
        ) : (
          <>Suas âncoras estão no máximo. A linha está bem protegida.</>
        )}
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primary}>
          Continuar
        </Link>
        <button type="button" className={styles.ghost} onClick={() => void share()}>
          Mandar pra turma
        </button>
        {shared ? <p className={styles.shared}>{shared}</p> : null}
      </div>
    </div>
  );
}
