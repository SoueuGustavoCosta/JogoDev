import { useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './ForLoopBuilderWidget.module.css';

const SAFETY_CAP = 30;

type Result = { infinite: boolean; values: number[] };

function simulate(start: number, end: number, step: number): Result {
  if (step === 0) return { infinite: true, values: [] };
  const values: number[] = [];
  let i = start;
  while (step > 0 ? i <= end : i >= end) {
    values.push(i);
    i += step;
    if (values.length > SAFETY_CAP) return { infinite: true, values };
  }
  return { infinite: false, values };
}

/**
 * Farol 6 (loops.ts): monte um `for` e veja as voltas, ou descubra na prática por que um
 * passo no sentido errado nunca termina. Widget registrado como
 * `{ t: 'gui', widget: 'laco-for' }`.
 */
export function ForLoopBuilderWidget() {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(5);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<Result | null>(null);

  function run() {
    setResult(simulate(start, end, step));
  }

  return (
    <NotebookFrame title="for.php (monte o seu)">
      <div className={styles.wrap}>
        <div className={styles.controls}>
          <label className={styles.field}>
            <span>início ($i =)</span>
            <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} />
          </label>
          <label className={styles.field}>
            <span>fim ($i &lt;=)</span>
            <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} />
          </label>
          <label className={styles.field}>
            <span>passo ($i +=)</span>
            <input type="number" value={step} onChange={(e) => setStep(Number(e.target.value))} />
          </label>
        </div>
        <Button size="sm" onClick={run}>
          Rodar ▸
        </Button>
        {result ? (
          result.infinite ? (
            <div className={styles.warn}>
              Isso nunca para! Parei em {SAFETY_CAP} voltas por segurança — na vida real, o navegador travaria.
            </div>
          ) : result.values.length === 0 ? (
            <div className={styles.info}>O teste já começa falso: o corpo do laço nunca executa.</div>
          ) : (
            <div className={styles.values}>
              {result.values.map((v, i) => (
                <span key={i} className={styles.chip}>
                  {v}
                </span>
              ))}
            </div>
          )
        ) : null}
      </div>
    </NotebookFrame>
  );
}
