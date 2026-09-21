import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  getOrCreateTravelerUuid,
  getTraveler,
  getTrailProgress,
  loseBossFight,
  startBossFight,
  winBossFight,
} from '@/application/usecases';
import {
  applyBossAttempt,
  applyBossHint,
  checkSequenceStep,
  checkSingleShot,
  createBossFightState,
  type BossFightConfig,
  type BossFightState,
} from '@/domain/bossFight';
import { isTrailCompleted } from '@/domain/progress';
import type { BossFight, Trail } from '@/domain/trail';
import { getTrailById } from '@/content/registry';
import { Button, NotebookFrame, ProgressBar, BadgeMedal } from '@/presentation/design-system';
import { getBadgeById } from '@/content/badges/catalog';
import { useServices } from '@/presentation/app/ServicesContext';
import { hasSeenTrailIntro, TrailIntroDialogue } from '@/presentation/features/trail';
import styles from './BossFightPage.module.css';

type Phase = 'start' | 'fight' | 'won' | 'lost';
type ConsoleLine = { cls: 'ok' | 'err' | 'info'; text: string };
type Feedback = { kind: 'good' | 'bad'; text: string };

function configFor(bossFight: BossFight): BossFightConfig {
  return {
    roundCount: bossFight.rounds.length,
    maxAttempts: 3,
    pointsPerStep: bossFight.mode === 'single-shot' ? 50 : 30,
    hintPenalty: 25,
    initialLives: 3,
  };
}

/** Metadados da rodada atual, já normalizados entre os dois modos de combate. */
function roundMeta(bossFight: BossFight, roundIndex: number) {
  if (bossFight.mode === 'sequence') {
    const round = bossFight.rounds[roundIndex];
    if (!round) return null;
    return {
      title: round.title,
      description: `${round.description} (${round.steps.length} comandos nesta rodada)`,
      talk: round.talk,
      hint: round.hint,
      stepsInRound: round.steps.length,
    };
  }
  const round = bossFight.rounds[roundIndex];
  if (!round) return null;
  return { title: round.title, description: round.description, talk: round.talk, hint: round.hint, stepsInRound: 1 };
}

function checkAttempt(bossFight: BossFight, state: BossFightState, input: string): boolean {
  if (bossFight.mode === 'sequence') {
    const round = bossFight.rounds[state.roundIndex];
    return round ? checkSequenceStep(round, state.stepIndex, input) : false;
  }
  const round = bossFight.rounds[state.roundIndex];
  return round ? checkSingleShot(round, input) : false;
}

/**
 * Gate + porta de entrada da rota `trilhas/:trailId/chefe`: só entra quem já tem o
 * troféu da trilha (mesma regra que libera o resto do arquipélago), e mostra a
 * conversa da Senhorita Sintaxe antes de liberar o combate (mesmo padrão de
 * `TrailOverview`/`TrailIntroDialogue`, com uma chave de sessão própria).
 */
export function BossFightPage() {
  const { trailId } = useParams<{ trailId: string }>();
  const { progressRepository } = useServices();
  const trail = trailId ? getTrailById(trailId) : undefined;
  const bossFight = trail?.bossFight;

  const [introOpen, setIntroOpen] = useState(() => {
    if (!trail || !bossFight) return false;
    return !hasSeenTrailIntro(`${trail.id}:chefe`);
  });

  if (!trail || !bossFight) return <Navigate to="/" replace />;

  const { trailProgress } = getTrailProgress({ repository: progressRepository }, { trail });
  if (!isTrailCompleted(trail, trailProgress)) return <Navigate to={`/trilhas/${trail.id}`} replace />;

  if (introOpen) {
    return (
      <TrailIntroDialogue
        trailId={`${trail.id}:chefe`}
        lines={bossFight.intro}
        onDone={() => setIntroOpen(false)}
      />
    );
  }

  return <BossFightArena trail={trail} bossFight={bossFight} alreadyDefeated={Boolean(trailProgress?.bossDefeated)} />;
}

function BossFightArena({
  trail,
  bossFight,
  alreadyDefeated,
}: {
  trail: Trail;
  bossFight: BossFight;
  alreadyDefeated: boolean;
}) {
  const { progressRepository, analytics, leaderboard } = useServices();
  const config = configFor(bossFight);
  const consoleRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('start');
  const [state, setState] = useState<BossFightState>(() => createBossFightState(config));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [lines, setLines] = useState<ConsoleLine[]>([]);

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight });
  }, [lines]);

  const meta = roundMeta(bossFight, state.roundIndex);
  const isSequence = bossFight.mode === 'sequence';

  function finishWin() {
    const uuid = getOrCreateTravelerUuid({ repository: progressRepository });
    const { name } = getTraveler({ repository: progressRepository });
    winBossFight(
      { repository: progressRepository, analytics, leaderboard },
      { trailId: trail.id, badgeId: bossFight.badgeId, traveler: { uuid, name } },
    );
    setPhase('won');
  }

  function finishLose() {
    loseBossFight({ analytics }, { trailId: trail.id });
    setPhase('lost');
  }

  function start() {
    startBossFight({ analytics }, { trailId: trail.id });
    const initial = createBossFightState(config);
    setState(initial);
    setInput('');
    setFeedback(null);
    setHint(null);
    const first = roundMeta(bossFight, 0);
    setLines(first ? [{ cls: 'info', text: `--- ${first.title} ---` }] : []);
    setPhase('fight');
  }

  function restart() {
    setPhase('start');
    setFeedback(null);
    setHint(null);
    setLines([]);
  }

  function runAttempt() {
    if (!meta || phase !== 'fight') return;
    const trimmed = input.trim();
    if (!trimmed) return;
    const correct = checkAttempt(bossFight, state, input);

    if (correct) {
      setLines((prev) => [
        ...prev,
        { cls: 'ok', text: isSequence ? `$ ${trimmed.toLowerCase()}` : '> consulta aceita.' },
      ]);
      const next = applyBossAttempt(state, config, { correct: true, stepsInRound: meta.stepsInRound });
      setState(next);
      setInput('');
      setHint(null);
      setFeedback({
        kind: 'good',
        text: isSequence
          ? `✓ comando aceito (${next.roundIndex === state.roundIndex ? next.stepIndex : meta.stepsInRound}/${meta.stepsInRound}).`
          : '✓ correto! o chefe perdeu terreno.',
      });

      if (next.status === 'won') {
        window.setTimeout(finishWin, 700);
      } else if (next.roundIndex !== state.roundIndex) {
        window.setTimeout(() => {
          const nextMeta = roundMeta(bossFight, next.roundIndex);
          setLines((prev) => [...prev, ...(nextMeta ? [{ cls: 'info' as const, text: `--- ${nextMeta.title} ---` }] : [])]);
          setFeedback(null);
          setHint(null);
        }, 900);
      }
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        cls: 'err',
        text: isSequence
          ? `$ ${trimmed.toLowerCase()}  → comando inesperado nesta etapa.`
          : '> rejeitado: faltou algo essencial na consulta.',
      },
    ]);
    const next = applyBossAttempt(state, config, { correct: false, stepsInRound: meta.stepsInRound });
    setState(next);

    const lostLife = next.lives < state.lives;
    if (lostLife) {
      setFeedback({
        kind: 'bad',
        text: `✗ ${isSequence ? 'o conflito piorou' : 'o chefe anotou uma falha'}. Você perdeu um ${bossFight.lifeLabel}.`,
      });
      if (next.status === 'lost') {
        window.setTimeout(finishLose, 700);
      }
    } else {
      setFeedback({
        kind: 'bad',
        text: `✗ ${isSequence ? 'não é esse o próximo comando' : 'ainda não é isso'}. Tentativa ${next.attempts}/${config.maxAttempts}.`,
      });
    }
  }

  function askHint() {
    if (!meta) return;
    setState((s) => applyBossHint(s, config));
    setHint(meta.hint);
    setLines((prev) => [...prev, { cls: 'info', text: '> dica solicitada (-25 pontos).' }]);
  }

  const overallPct = bossFight.rounds.length > 0 ? state.roundIndex / bossFight.rounds.length : 0;
  const bossHpPct = Math.round((1 - overallPct) * 100);

  return (
    <article className={styles.root} style={{ '--boss-accent': trail.accent } as CSSProperties}>
      <p className="eyebrow">{bossFight.tagline}</p>
      <h1>{bossFight.bossName}</h1>

      {phase === 'start' ? (
        <StartScreen bossFight={bossFight} alreadyDefeated={alreadyDefeated} onStart={start} />
      ) : null}

      {phase === 'fight' && meta ? (
        <div className={styles.gamegrid}>
          <div>
            <div className={styles.gamehead}>
              <ProgressBar value={state.roundIndex} max={bossFight.rounds.length} label="Progresso do combate" />
              <span className={styles.score}>⭐ {state.score}</span>
              <span className={styles.lives}>
                {bossFight.lifeLabel} {state.lives}
              </span>
            </div>

            <div className={styles.caseBox}>
              <p className={styles.bossHpLabel}>saúde de {bossFight.bossName}</p>
              <div
                className={styles.bossbar}
                role="progressbar"
                aria-valuenow={bossHpPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Saúde de ${bossFight.bossName}`}
              >
                <div className={styles.bossbarFill} style={{ width: `${bossHpPct}%` }} />
              </div>
              <h3>{meta.title}</h3>
              <p>{meta.description}</p>
            </div>

            <NotebookFrame title={isSequence ? 'terminal — repositório' : 'boss-fight.sql'}>
              {isSequence ? (
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="digite o comando git..."
                    aria-label="Comando git"
                    className={styles.termInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runAttempt();
                    }}
                  />
                </div>
              ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Digite seu SQL aqui..."
                  aria-label="SQL do combate"
                  className={styles.textarea}
                />
              )}
              <div className={styles.actions}>
                <Button variant="alt" onClick={runAttempt}>
                  Executar ▶
                </Button>
                <Button variant="ghost" onClick={askHint}>
                  Pedir dica (-25)
                </Button>
                <Button variant="ghost" onClick={() => setInput('')}>
                  Limpar
                </Button>
                <Button variant="ghost" onClick={restart}>
                  Reiniciar ↺
                </Button>
              </div>
              {feedback ? (
                <p className={feedback.kind === 'good' ? styles.feedbackGood : styles.feedbackBad}>{feedback.text}</p>
              ) : null}
              {hint ? (
                <p className={styles.hintBox}>
                  <b>Dica:</b> {hint}
                </p>
              ) : null}
            </NotebookFrame>
          </div>

          <aside className={styles.side}>
            <h3>{bossFight.bossName} está falando</h3>
            <p className={styles.bubble}>{meta.talk}</p>
            <div className={styles.consoleBox} ref={consoleRef} role="log" aria-live="polite" aria-label="Console do combate">
              {lines.map((line, i) => (
                <div key={i} className={styles[`console${line.cls === 'ok' ? 'Ok' : line.cls === 'err' ? 'Err' : 'Info'}`]}>
                  {line.text}
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {phase === 'won' ? (
        <div className={styles.final}>
          <div className={styles.bigEmoji} aria-hidden="true">
            🏆
          </div>
          <h2>Combate vencido!</h2>
          <p className={styles.sub}>
            Pontuação final: {state.score} pontos, com {state.lives} {bossFight.lifeLabel} restantes.
          </p>
          <div className={styles.badgeCard}>
            {(() => {
              const badge = getBadgeById(bossFight.badgeId);
              return badge ? <BadgeMedal badge={badge} earned size={140} showCaption={false} /> : null;
            })()}
            <h3>Insígnia conquistada: {bossFight.badgeTitle}</h3>
            <p>{bossFight.badgeDescription}</p>
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={restart}>
              Jogar de novo ↺
            </Button>
          </div>
        </div>
      ) : null}

      {phase === 'lost' ? (
        <div className={styles.final}>
          <div className={styles.bigEmoji} aria-hidden="true">
            💥
          </div>
          <h2>O chefe achou a falha.</h2>
          <div className={styles.gameOverBox}>
            <h3>GAME OVER</h3>
            <p>
              Sem {bossFight.lifeLabel} suficiente para continuar. Revise a trilha e volte quando quiser.
              {alreadyDefeated ? ' Sua insígnia continua garantida.' : ''}
            </p>
          </div>
          <Button variant="alt" onClick={restart}>
            Tentar de novo ↺
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function StartScreen({
  bossFight,
  alreadyDefeated,
  onStart,
}: {
  bossFight: BossFight;
  alreadyDefeated: boolean;
  onStart: () => void;
}) {
  return (
    <div className={styles.hero}>
      <div>
        <p className={styles.pill}>{bossFight.tagline}</p>
        {bossFight.rounds.map((round, i) => (
          <div key={i} className={styles.mission}>
            <b>{round.title}</b>
            <br />
            <small>{round.description}</small>
          </div>
        ))}
        <div className={styles.actions}>
          <Button variant="primary" onClick={onStart}>
            Enfrentar {bossFight.bossName} ▸
          </Button>
        </div>
        {alreadyDefeated ? (
          <p className={styles.status}>Você já tem a insígnia {bossFight.badgeTitle}. Pode jogar de novo pela pontuação.</p>
        ) : null}
      </div>
      <div className={styles.mascot}>
        {(() => {
          const badge = getBadgeById(bossFight.badgeId);
          return badge ? <BadgeMedal badge={badge} earned={alreadyDefeated} size={140} showCaption={false} /> : null;
        })()}
        <p className={styles.bubble}>{bossFight.rounds[0]?.talk}</p>
      </div>
    </div>
  );
}
