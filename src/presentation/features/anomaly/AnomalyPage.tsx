import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getDailyAnomaly, getTraveler, openAnomaly, solveAnomaly, type SolveAnomalyResult } from '@/application/usecases';
import { anomalies } from '@/content/anomalies';
import { isQuizAnswerCorrect, type QuizAnswer } from '@/domain/progress';
import { trailRegistry } from '@/content/registry';
import { TryBlockView } from '@/presentation/blocks';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { QuizQuestion } from '@/presentation/features/trail';
import { AnomalyReward } from './AnomalyReward';
import styles from './AnomalyPage.module.css';

/** A Anomalia do Dia: a história do Eco, o desafio e a recompensa (uma vez por dia). */
export function AnomalyPage() {
  const { progressRepository, analytics, leaderboard } = useServices();
  const traveler = getTraveler({ repository: progressRepository });
  const daily = useMemo(() => getDailyAnomaly({ repository: progressRepository }, { pool: anomalies }), [progressRepository]);
  const [reward, setReward] = useState<SolveAnomalyResult | null>(null);
  const [showReward, setShowReward] = useState(false);
  const tries = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    openAnomaly({ analytics }, daily.anomaly.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!traveler.prologueSeen) return <Navigate to="/prologo" replace />;

  const { anomaly } = daily;
  const era = trailRegistry.find((t) => t.id === anomaly.era)?.title ?? anomaly.era;

  function solve(totalTries: number) {
    setReward(solveAnomaly({ repository: progressRepository, analytics, leaderboard }, { day: daily.day, anomaly, tries: totalTries }));
  }

  function evaluate(answer: QuizAnswer) {
    tries.current += 1;
    const correct = !('t' in anomaly.challenge) && isQuizAnswerCorrect(anomaly.challenge, answer);
    if (correct) {
      const result = solveAnomaly({ repository: progressRepository, analytics, leaderboard }, { day: daily.day, anomaly, tries: tries.current });
      setReward(result);
      return { correct, xpGained: result.xp };
    }
    return { correct, xpGained: 0 };
  }

  const alreadySolved = daily.solved && !reward;

  return (
    <div className={styles.root}>
      <p className={styles.eyebrow}>
        anomalia #{daily.number} · {era.toLowerCase()}
      </p>
      <h1 className={styles.title}>{anomaly.title}</h1>
      <div className={styles.say}>
        <SintaxeFace size={40} />
        <p>{anomaly.story}</p>
      </div>

      {reward?.added && showReward ? (
        <AnomalyReward number={daily.number} reward={reward} />
      ) : alreadySolved ? (
        <div className={styles.reward} role="status">
          <b>Você já consertou a anomalia de hoje ✓</b>
          <span>A linha está estável. Amanhã surge outra.</span>
          <Link to="/" className={styles.back}>
            Voltar ao início
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.challenge}>
            {'t' in anomaly.challenge ? (
              <TryBlockView block={anomaly.challenge} onSolved={solve} />
            ) : (
              <QuizQuestion
                trailId={anomaly.era}
                moduleId="anomalia"
                item={anomaly.challenge}
                variant="inline"
                position={1}
                total={1}
                label="Anomalia do Dia"
                nextLabel="Ver recompensa ▸"
                onNext={() => (reward?.added ? setShowReward(true) : navigate('/'))}
                evaluate={evaluate}
              />
            )}
          </div>
          {reward?.added && 't' in anomaly.challenge ? (
            <button type="button" className={styles.back} onClick={() => setShowReward(true)}>
              Ver recompensa ▸
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
