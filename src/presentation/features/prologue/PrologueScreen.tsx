import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completePrologue, getTraveler, markPrologueSkipped } from '@/application/usecases';
import { prologueScript } from '@/content/prologue/script';
import { interpolate } from '@/domain/prologue';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './PrologueScreen.module.css';

const TERMINAL_LINES = ['> compilando a linha do tempo...', '> ola, viajante do tempo_', '> procurando rastros do Eco...', '> tudo certo. quase._'];

function TypingLine() {
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    let n = 0;
    const id = window.setInterval(() => {
      const line = TERMINAL_LINES[i % TERMINAL_LINES.length];
      n += 1;
      setText(line.slice(0, n));
      if (n > line.length + 12) {
        n = 0;
        i += 1;
      }
    }, 70);
    return () => window.clearInterval(id);
  }, []);
  return <span className={styles.typing}>{text}</span>;
}

export function PrologueScreen() {
  const { progressRepository, analytics } = useServices();
  const navigate = useNavigate();
  const [stepId, setStepId] = useState(prologueScript.start);
  const [name, setName] = useState(() => {
    const saved = getTraveler({ repository: progressRepository });
    return saved.prologueSeen ? saved.name : 'Viajante';
  });
  const [draft, setDraft] = useState('');
  const [warping, setWarping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const step = prologueScript.steps[stepId];

  useEffect(() => {
    analytics.track('prologue_started');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [stepId]);

  function skip() {
    markPrologueSkipped({ repository: progressRepository });
    analytics.track('prologue_skipped');
    navigate('/');
  }

  function submitName() {
    const saved = completePrologue({ repository: progressRepository }, { name: draft });
    setName(saved);
    if (step.askName) setStepId(step.askName.next);
  }

  function warp() {
    analytics.track('prologue_completed');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      navigate('/');
      return;
    }
    setWarping(true);
    window.setTimeout(() => navigate('/'), 1700);
  }

  return (
    <div className={`${styles.root} ${warping ? styles.warping : ''}`}>
      <div className={styles.stars} aria-hidden="true" />
      <div className={styles.streaks} aria-hidden="true" />

      <header className={styles.hud}>
        <div className={styles.brand}>
          <i />
          Viajante do Tempo
        </div>
        <button type="button" className={styles.skip} onClick={skip}>
          Pular
        </button>
      </header>

      <div className={styles.stage}>
        <div className={styles.sintaxe} aria-hidden="true">
          <span className={`${styles.glyph} ${styles.gl}`}>{'{'}</span>
          <SintaxeFace size={150} className={styles.face} />
          <span className={`${styles.glyph} ${styles.gr}`}>{'}'}</span>
          <span className={`${styles.glyph} ${styles.gs}`}>;</span>
          <div className={styles.line}>
            <TypingLine />
          </div>
        </div>
      </div>

      <section className={styles.dialog} role="log" aria-live="polite" aria-label="Conversa com a Senhorita Sintaxe" ref={logRef}>
        <div className={styles.bubble} key={stepId}>
          <div className={styles.who}>SENHORITA SINTAXE</div>
          {step.say.map((line, i) => (
            <p key={i}>{interpolate(line, name)}</p>
          ))}

          {step.askName ? (
            <form
              className={styles.row}
              onSubmit={(e) => {
                e.preventDefault();
                submitName();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={20}
                placeholder={step.askName.placeholder}
                autoComplete="off"
                aria-label="Seu nome"
                autoFocus
              />
              <button type="submit" className={styles.btn}>
                {step.askName.button}
              </button>
            </form>
          ) : null}
        </div>

        {step.choices?.map((choice) => (
          <button key={choice.label} type="button" className={styles.choice} onClick={() => setStepId(choice.next)}>
            {choice.label}
          </button>
        ))}
        {step.warp ? (
          <button type="button" className={`${styles.choice} ${styles.primary}`} onClick={warp} disabled={warping}>
            {step.warp.label} ▸
          </button>
        ) : null}
      </section>
    </div>
  );
}
