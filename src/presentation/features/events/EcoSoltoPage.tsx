import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getEcoSolto, loseEcoSolto, startEcoSolto, winEcoSolto, ECO_SOLTO_ROUNDS, type EcoSoltoReward } from '@/application/usecases';
import { cosmetics } from '@/content/cosmetics';
import { eventCalendar } from '@/content/events/calendar';
import { ecoSoltoRounds } from '@/content/events/ecoSolto';
import {
  applyBossAttempt,
  checkSingleShot,
  createBossFightState,
  DEFAULT_BOSS_FIGHT_CONFIG,
  type BossFightConfig,
  type BossFightState,
} from '@/domain/bossFight';
import { shuffledOrder } from '@/domain/progress';
import { Avatar, Confetti } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import { dayLabel } from './multiplier';
import styles from './EcoSoltoPage.module.css';

const CONFIG: BossFightConfig = { ...DEFAULT_BOSS_FIGHT_CONFIG, roundCount: ECO_SOLTO_ROUNDS, pointsPerStep: 100 };

type Phase = 'intro' | 'fight' | 'won' | 'lost';

/**
 * Eco Solto (Etapa 11): mini-chefe de 3 rodadas no dia do evento, com o mesmo motor do chefe
 * de fase (src/domain/bossFight). Tudo de tocar. A primeira vitória dá um cosmético raro;
 * as seguintes, Fragmentos. Perder não tira nada: é só tentar de novo.
 */
export function EcoSoltoPage() {
  const { progressRepository, analytics } = useServices();
  const { summary, refreshSummary } = useOutletContext<LayoutOutletContext>();
  const eco = useMemo(
    () => getEcoSolto({ repository: progressRepository }, { calendar: eventCalendar, pool: ecoSoltoRounds }),
    [progressRepository],
  );
  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<BossFightState>(() => createBossFightState(CONFIG));
  const [wrong, setWrong] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const [reward, setReward] = useState<EcoSoltoReward | null>(null);

  const round = eco.rounds[state.roundIndex];
  const options = useMemo(() => {
    if (!round?.choices) return [];
    const all = [round.choices.correct, ...round.choices.wrong];
    return shuffledOrder(all.length, Math.random).map((i) => all[i]);
  }, [round]);

  useEffect(() => {
    if (phase === 'fight') setWrong([]);
    setHint(false);
  }, [state.roundIndex, state.lives, phase]);

  if (!eco.event) return <Navigate404 />;

  if (!eco.active) {
    return (
      <article className={styles.root}>
        <p className="eyebrow">Evento</p>
        <h1>{eco.event.title}</h1>
        <p className={styles.lead}>
          O Eco só se solta em dias de evento. {eco.nextDay ? `Próxima vez: ${dayLabel(eco.nextDay)}.` : ''}
        </p>
        <Link to="/" className={styles.secondary}>
          Voltar ao Início
        </Link>
      </article>
    );
  }

  function start() {
    startEcoSolto({ analytics });
    setState(createBossFightState(CONFIG));
    setPhase('fight');
  }

  function pick(option: string) {
    if (!round) return;
    const correct = checkSingleShot(round, option);
    const next = applyBossAttempt(state, CONFIG, { correct, stepsInRound: 1 });
    if (!correct) setWrong((w) => [...w, option]);
    setState(next);
    if (next.status === 'won') {
      const r = eco.event && eco.event.kind === 'eco-solto' ? winEcoSolto({ repository: progressRepository, analytics }, { event: eco.event }) : null;
      setReward(r);
      refreshSummary();
      setPhase('won');
    } else if (next.status === 'lost') {
      loseEcoSolto({ analytics });
      setPhase('lost');
    }
  }

  const rewardItem = reward?.kind === 'item' ? cosmetics.find((c) => c.id === reward.itemId) : undefined;
  const prize = cosmetics.find((c) => c.id === eco.event?.rewardItemId);

  return (
    <article className={styles.root}>
      <p className="eyebrow">Evento de hoje</p>
      <h1>{eco.event.title}</h1>

      {phase === 'intro' ? (
        <>
          <p className={styles.eco}>
            <b>Eco:</b> Escapei da última era e trouxe três problemas comigo. Conserte os três antes que eu fuja de novo.
          </p>
          <ul className={styles.rules}>
            <li>{ECO_SOLTO_ROUNDS} rodadas, tudo de tocar.</li>
            <li>3 erros na mesma rodada custam uma vida; você tem 3.</li>
            <li>
              {eco.ownsReward || !prize
                ? `Prêmio: +${eco.event.kind === 'eco-solto' ? eco.event.bonusFragments : 0} ◆ (uma vez por dia de evento).`
                : `Prêmio da primeira vitória: ${prize.name}, um visual raro para o seu avatar.`}
            </li>
          </ul>
          {eco.wonToday ? <p className={styles.lead}>Você já prendeu o Eco hoje. Pode jogar de novo, só por diversão.</p> : null}
          <button type="button" className={styles.primary} onClick={start}>
            Enfrentar o Eco
          </button>
        </>
      ) : null}

      {phase === 'fight' && round ? (
        <section className={styles.fight} aria-live="polite">
          <div className={styles.status}>
            <span>
              Rodada {state.roundIndex + 1} de {ECO_SOLTO_ROUNDS}
            </span>
            <span aria-label={`${state.lives} vidas`}>{'♥'.repeat(state.lives)}</span>
          </div>
          <p className={styles.eco}>
            <b>Eco:</b> {round.talk}
          </p>
          <h2 className={styles.roundTitle}>{round.title}</h2>
          <pre className={styles.task}>{round.description}</pre>
          <div className={styles.options} role="group" aria-label="Escolha o bloco certo">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.option} ${wrong.includes(option) ? styles.optionNo : ''}`}
                disabled={wrong.includes(option)}
                onClick={() => pick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {state.attempts > 0 ? (
            <p className={styles.miss}>
              Ainda não. {CONFIG.maxAttempts - state.attempts} {CONFIG.maxAttempts - state.attempts === 1 ? 'tentativa' : 'tentativas'} antes de perder uma vida.
            </p>
          ) : null}
          {hint ? (
            <p className={styles.hint}>
              <b>💡 Dica:</b> {round.hint}
            </p>
          ) : (
            <button type="button" className={styles.secondary} onClick={() => setHint(true)}>
              💡 Ver dica
            </button>
          )}
        </section>
      ) : null}

      {phase === 'won' ? (
        <section className={styles.result}>
          <Confetti />
          <h2>O Eco voltou para a garrafa!</h2>
          {rewardItem ? (
            <>
              <Avatar name={summary.name} url={summary.avatarUrl} size={88} look={{ ...summary.look, [rewardItem.slot]: rewardItem }} />
              <p>
                Você ganhou <b>{rewardItem.name}</b>. Equipe na <Link to="/configuracoes/loja">Loja do Viajante</Link>.
              </p>
            </>
          ) : reward?.kind === 'fragments' ? (
            <p>
              +{reward.amount} ◆ Fragmentos Temporais. Até a próxima sexta!
            </p>
          ) : (
            <p>Vitória registrada. O prêmio de hoje você já tinha levado.</p>
          )}
          <Link to="/" className={styles.primary}>
            Voltar ao Início
          </Link>
        </section>
      ) : null}

      {phase === 'lost' ? (
        <section className={styles.result}>
          <h2>O Eco escapou desta vez.</h2>
          <p>Nada foi perdido. Leia as dicas com calma e tente de novo.</p>
          <button type="button" className={styles.primary} onClick={start}>
            Tentar de novo
          </button>
        </section>
      ) : null}
    </article>
  );
}

function Navigate404() {
  return (
    <article>
      <h1>Sem evento</h1>
      <Link to="/">Voltar ao Início</Link>
    </article>
  );
}
