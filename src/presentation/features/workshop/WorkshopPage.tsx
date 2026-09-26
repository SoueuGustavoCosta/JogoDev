import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import { runWorkshopTests, solveWorkshop, startWorkshop, type WorkshopRun } from '@/application/usecases';
import { workshops } from '@/content/workshops';
import {
  blocksToCode,
  codeToBlocks,
  describeInputs,
  explainFailure,
  passingSummary,
  type PlacedBlock,
  WORKSHOP_EXTRA_XP,
  WORKSHOP_HINT_COST,
  workshopXp,
  type Workshop,
  type WorkshopLang,
  type WorkshopTest,
} from '@/domain/workshop';
import { Confetti, SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import { BlockEditor } from './BlockEditor';
import { CodeEditor } from './CodeEditor';
import styles from './Workshop.module.css';

const LANG_LABEL: Record<WorkshopLang, string> = { php: 'PHP', js: 'JS', python: 'Python' };

type Phase = 'choose' | 'code' | 'solved';
type Mode = 'blocks' | 'write';

/** Código inicial: só um comentário lembrando as variáveis que já chegam prontas. */
function starterFor(workshop: Workshop, lang: WorkshopLang): string {
  const names = workshop.inputs.map((i) => (lang === 'php' ? `$${i.name}` : i.name));
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}` : names[0];
  const comment = lang === 'python' ? '#' : '//';
  const head = lang === 'php' ? '<?php\n' : '';
  return `${head}${comment} Você já recebe pronto: ${list}\n\n`;
}

/** Como um teste aparece em "o que vou testar": entrada → saída (só a 1ª linha, se forem várias). */
function testLine(lang: WorkshopLang, test: WorkshopTest): { given: string; expected: string } {
  const lines = test.expected.split('\n');
  return { given: describeInputs(lang, test.inputs), expected: lines.length > 1 ? `${lines[0]} … (${lines.length} linhas)` : lines[0] };
}

/**
 * Uma oficina (Etapa 13A, modo escrever): o viajante escolhe a linguagem, escreve do jeito
 * dele e toca em "Testar". O jogo confere só a saída. A Sintaxe explica o teste que falhou e
 * nunca mostra a solução antes do acerto; depois, mostra "outros jeitos certos".
 */
export function WorkshopPage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const workshop = workshops.find((w) => w.id === workshopId);
  if (!workshop) return <Navigate to="/oficina" replace />;
  return <WorkshopScreen key={workshop.id} workshop={workshop} />;
}

function WorkshopScreen({ workshop }: { workshop: Workshop }) {
  const { progressRepository, analytics, leaderboard, codeRunner } = useServices();
  const { refreshSummary } = useOutletContext<LayoutOutletContext>();
  const available = useMemo(() => workshop.languages.filter((l) => codeRunner.supports(l)), [workshop, codeRunner]);
  const already = progressRepository.load()?.workshops?.[workshop.id] ?? null;
  const [phase, setPhase] = useState<Phase>('choose');
  const [lang, setLang] = useState<WorkshopLang>(available[0] ?? 'php');
  const [codes, setCodes] = useState<Partial<Record<WorkshopLang, string>>>({});
  const [blocks, setBlocks] = useState<Partial<Record<WorkshopLang, PlacedBlock[]>>>({});
  const [mode, setMode] = useState<Mode>(workshop.palettes ? 'blocks' : 'write');
  const [modeWarning, setModeWarning] = useState<string | null>(null);
  const [withExtra, setWithExtra] = useState(false);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<WorkshopRun | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gained, setGained] = useState<{ xp: number; extra: boolean } | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const prepared = useRef<Set<WorkshopLang>>(new Set());
  const palette = workshop.palettes?.[lang];
  const blocksMode = mode === 'blocks' && Boolean(palette);
  const placed = blocks[lang] ?? [];
  const code = blocksMode && palette ? blocksToCode(lang, palette, placed) : (codes[lang] ?? starterFor(workshop, lang));

  /** Troca blocos ↔ escrever sem perder nada: blocos viram texto sempre; texto vira blocos só se couber. */
  function switchMode(next: Mode) {
    setModeWarning(null);
    if (next === mode) return;
    if (next === 'write') {
      if (palette && placed.length > 0) setCodes((all) => ({ ...all, [lang]: blocksToCode(lang, palette, placed) }));
      setMode('write');
      return;
    }
    if (!palette) return;
    const text = codes[lang];
    if (text === undefined || text.trim() === starterFor(workshop, lang).trim()) {
      setMode('blocks');
      return;
    }
    const converted = codeToBlocks(palette, text);
    if (converted.ok) {
      setBlocks((all) => ({ ...all, [lang]: converted.placed }));
      setMode('blocks');
    } else {
      setModeWarning(`A linha ${converted.line} (${converted.text}) não existe nos blocos. Continue escrevendo, ou apague essa linha para voltar aos blocos.`);
    }
  }

  useEffect(() => {
    if (phase !== 'code' || prepared.current.has(lang)) return;
    prepared.current.add(lang);
    codeRunner.prepare(lang).catch(() => setEngineError('O motor desta linguagem não carregou neste aparelho. Tente a outra linguagem.'));
  }, [phase, lang, codeRunner]);

  function begin() {
    startWorkshop({ analytics }, { workshop, lang });
    setPhase('code');
  }

  async function test() {
    if (running) return;
    setRunning(true);
    try {
      const result = await runWorkshopTests({ runner: codeRunner, analytics }, { workshop, lang, code, withExtra });
      setRun(result);
      if (result.passed === result.total) {
        const { xpGained } = solveWorkshop(
          { repository: progressRepository, analytics, leaderboard },
          { workshop, lang, hintsUsed, extra: withExtra },
        );
        setGained({ xp: xpGained, extra: withExtra });
        refreshSummary();
        setPhase('solved');
      }
    } catch {
      setEngineError('Não deu para rodar agora. Tente de novo em instantes.');
    } finally {
      setRunning(false);
    }
  }

  const visible = workshop.tests.map((t) => testLine(lang, t));
  const potentialXp = workshopXp({ hintsUsed, extra: false });

  return (
    <article className={styles.root}>
      <div className={styles.topbar}>
        <Link to="/oficina" className={styles.close} aria-label="Voltar para a Oficina">
          ✕
        </Link>
        {run ? (
          <span className={`${styles.counter} ${run.passed === run.total ? styles.counterOk : ''}`}>
            {run.passed}/{run.total} testes
          </span>
        ) : (
          <span className={styles.brand}>oficina do viajante</span>
        )}
      </div>

      {phase === 'choose' ? (
        <>
          <div className={styles.sintaxe}>
            <SintaxeFace size={44} />
            <p>{workshop.story}</p>
          </div>
          <h1>{workshop.title}</h1>
          <p className={styles.lead}>{workshop.prompt}</p>
          <TestsBox visible={visible} hidden={workshop.hiddenTests.length} />

          <h2 className={styles.label}>Escolha a linguagem</h2>
          <div className={styles.langs} role="radiogroup" aria-label="Linguagem">
            {workshop.languages.map((l) => {
              const ok = available.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={lang === l}
                  disabled={!ok}
                  className={`${styles.lang} ${lang === l ? styles.langOn : ''}`}
                  onClick={() => setLang(l)}
                >
                  {LANG_LABEL[l]}
                  {ok ? null : <small>em breve</small>}
                </button>
              );
            })}
          </div>
          {workshop.palettes?.[lang] ? (
            <div className={styles.modes} role="radiogroup" aria-label="Jeito de montar">
              <button type="button" role="radio" aria-checked={mode === 'blocks'} className={`${styles.mode} ${mode === 'blocks' ? styles.modeOn : ''}`} onClick={() => setMode('blocks')}>
                Montar com blocos
              </button>
              <button type="button" role="radio" aria-checked={mode === 'write'} className={`${styles.mode} ${mode === 'write' ? styles.modeOn : ''}`} onClick={() => setMode('write')}>
                Escrever código
              </button>
            </div>
          ) : null}
          {already ? <p className={styles.done}>Você já resolveu esta oficina ✓ Pode fazer de novo, em outra linguagem ou de outro jeito.</p> : null}
          <button type="button" className={styles.primary} onClick={begin}>
            {already ? 'Abrir o editor' : `Começar · +${potentialXp} XP`}
          </button>
        </>
      ) : null}

      {phase === 'code' ? (
        <>
          <h1 className={styles.titleSmall}>{workshop.title}</h1>
          <p className={styles.lead}>{withExtra && workshop.extra ? <><b>Desafio extra:</b> {workshop.extra.prompt}</> : workshop.prompt}</p>
          <details className={styles.details}>
            <summary>O que vou testar</summary>
            <TestsBox visible={visible} hidden={workshop.hiddenTests.length} />
          </details>
          {palette ? (
            <div className={styles.modes} role="radiogroup" aria-label="Jeito de montar">
              <button type="button" role="radio" aria-checked={blocksMode} className={`${styles.mode} ${blocksMode ? styles.modeOn : ''}`} onClick={() => switchMode('blocks')}>
                Blocos
              </button>
              <button type="button" role="radio" aria-checked={!blocksMode} className={`${styles.mode} ${!blocksMode ? styles.modeOn : ''}`} onClick={() => switchMode('write')}>
                Escrever
              </button>
            </div>
          ) : null}
          {modeWarning ? <p className={styles.fail} role="status">{modeWarning}</p> : null}
          {blocksMode && palette ? (
            <BlockEditor palette={palette} placed={placed} onChange={(next) => setBlocks((all) => ({ ...all, [lang]: next }))} />
          ) : (
            <CodeEditor lang={lang} code={code} onChange={(c) => setCodes((all) => ({ ...all, [lang]: c }))} />
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.hintBtn}
              disabled={hintsUsed >= workshop.hints.length}
              onClick={() => setHintsUsed((h) => Math.min(workshop.hints.length, h + 1))}
            >
              💡 Dica {hintsUsed < workshop.hints.length ? `(−${WORKSHOP_HINT_COST} XP)` : ''}
            </button>
            <button type="button" className={styles.run} onClick={() => void test()} disabled={running}>
              {running ? 'Testando…' : 'Testar ▶'}
            </button>
          </div>
          {engineError ? <p className={styles.fail}>{engineError}</p> : null}
          {hintsUsed > 0 ? (
            <ol className={styles.hints}>
              {workshop.hints.slice(0, hintsUsed).map((h, i) => (
                <li key={i}>
                  <b>{['Ideia', 'Estrutura', 'Bloco pronto'][i]}:</b> {h}
                </li>
              ))}
            </ol>
          ) : null}
          {run && run.firstFailure ? (
            <div className={styles.sintaxe} role="status">
              <SintaxeFace size={36} />
              <p>
                <b>Sintaxe · </b>
                {passingSummary(lang, run.results) || (run.passed > 0 ? `${run.passed} de ${run.total} testes já passam.` : '')}{' '}
                {explainFailure(lang, run.firstFailure)}
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === 'solved' ? (
        <>
          <Confetti />
          <p className="eyebrow">{workshop.title}</p>
          <h1>{gained?.extra ? 'Desafio extra resolvido!' : 'Sua solução funciona!'}</h1>
          <p className={styles.lead}>
            {gained && gained.xp > 0 ? `+${gained.xp} XP. ` : ''}O jogo só conferiu o resultado: do seu jeito está certo. Existem outros jeitos certos:
          </p>
          {(workshop.solutions[lang] ?? []).map((s) => (
            <section key={s.title} className={styles.solution}>
              <div className={styles.solutionHead}>
                <h2>{s.title}</h2>
                <span>{LANG_LABEL[lang]}</span>
              </div>
              <pre>{s.code}</pre>
            </section>
          ))}
          {workshop.extra && !gained?.extra && !already?.extra ? (
            <section className={styles.extra}>
              <b>Desafio extra:</b> {workshop.extra.prompt} (+{WORKSHOP_EXTRA_XP} XP)
            </section>
          ) : null}
          <div className={styles.endActions}>
            {workshop.extra && !gained?.extra && !already?.extra ? (
              <button
                type="button"
                className={styles.primary}
                onClick={() => {
                  setWithExtra(true);
                  setRun(null);
                  setPhase('code');
                }}
              >
                Tentar o desafio extra
              </button>
            ) : null}
            <Link to="/oficina" className={styles.secondary}>
              Outras oficinas
            </Link>
          </div>
        </>
      ) : null}
    </article>
  );
}

function TestsBox({ visible, hidden }: { visible: { given: string; expected: string }[]; hidden: number }) {
  return (
    <div className={styles.tests}>
      <p className={styles.testsTitle}>o que vou testar</p>
      <ul>
        {visible.map((t, i) => (
          <li key={i}>
            <span>{t.given}</span> <b aria-label="resulta em">→</b> <span>{t.expected}</span>
          </li>
        ))}
      </ul>
      {hidden > 0 ? <p className={styles.testsHidden}>+ {hidden} {hidden === 1 ? 'teste surpresa' : 'testes surpresa'}</p> : null}
    </div>
  );
}
