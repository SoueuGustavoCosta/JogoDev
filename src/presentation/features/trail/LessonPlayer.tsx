import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPosition, reportModuleLeft, saveLessonPosition } from '@/application/usecases';
import { screenDepthPercent } from '@/domain/metrics';
import { paginateModule, type Module, type Trail } from '@/domain/trail';
import { BlockRenderer } from '@/presentation/blocks';
import { SintaxeFace } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import { QuizQuestion, type QuizQuestionState } from './QuizQuestion';
import styles from './LessonPlayer.module.css';

/**
 * Lição em telas curtas (plano de engajamento, Etapa 3; referência: novo-2-b-licao.png e
 * novo-3-c-desafio.png). O conteúdo é o mesmo do módulo, paginado por `paginateModule`:
 * uma tela por vez, perguntas intercaladas, barra de progresso segmentada no topo e o botão
 * principal fixo embaixo. As regras de XP e tentativas são as mesmas do quiz de sempre.
 *
 * Guarda a tela atual no progresso (volta de onde parou) e envia `module_left` com a tela
 * em que o viajante saiu, se ele sair sem concluir.
 */
export function LessonPlayer({
  trail,
  module,
  moduleIndex,
  travelerName,
  completion,
  onFinished,
  onOpenInLab,
}: {
  trail: Trail;
  module: Module;
  moduleIndex: number;
  travelerName: string;
  /** Fechamento do salto; quando presente, substitui as telas. */
  completion: ReactNode;
  onFinished: () => void;
  onOpenInLab: (sql: string) => void;
}) {
  const { progressRepository, analytics } = useServices();
  const screens = useMemo(() => paginateModule(module), [module]);
  const [current, setCurrent] = useState(() =>
    getLessonPosition({ repository: progressRepository }, { trailId: trail.id, moduleId: module.id, screenCount: screens.length }),
  );
  const [quizState, setQuizState] = useState<QuizQuestionState>({ status: 'idle' });
  const [streak, setStreak] = useState(0);
  // Relê o progresso depois de cada resposta (XP salvo), sem mais nada a fazer aqui.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const screen = screens[current];
  const isLast = current >= screens.length - 1;
  const done = completion !== null && completion !== undefined;

  // Posição e métricas: lidas nos efeitos de saída pelas refs (valores sempre atuais).
  const seen = useRef({ current, max: current, done });
  seen.current = { current, max: Math.max(seen.current.max, current), done };

  useEffect(() => {
    saveLessonPosition({ repository: progressRepository }, { trailId: trail.id, moduleId: module.id, screen: current });
    window.scrollTo({ top: 0 });
  }, [current, progressRepository, trail.id, module.id]);

  useEffect(() => {
    let reported = false;
    const report = () => {
      const { max, current: at, done: finished } = seen.current;
      if (reported || finished) return;
      reported = true;
      reportModuleLeft(
        { repository: progressRepository, analytics },
        { trailId: trail.id, moduleId: module.id, percent: screenDepthPercent(max + 1, screens.length), screen: at + 1 },
      );
    };
    window.addEventListener('pagehide', report);
    return () => {
      window.removeEventListener('pagehide', report);
      report();
    };
  }, [progressRepository, analytics, trail.id, module.id, screens.length]);

  const onQuizChange = useCallback((state: QuizQuestionState) => {
    setQuizState(state);
    if (state.status === 'wrong') setStreak(0);
    else if (state.status === 'solved' && state.firstTry) setStreak((n) => n + 1);
  }, []);

  function advance() {
    setQuizState({ status: 'idle' });
    if (isLast) onFinished();
    else setCurrent((c) => c + 1);
  }

  function back() {
    setQuizState({ status: 'idle' });
    setCurrent((c) => Math.max(0, c - 1));
  }

  const quizItem = screen?.kind === 'quiz' ? module.quiz[screen.quizIndex] : undefined;

  return (
    <div className={styles.root}>
      <header className={styles.top}>
        <Link to={`/trilhas/${trail.id}`} className={styles.close} aria-label={`Sair da lição e voltar para ${trail.title}`}>
          ×
        </Link>
        <div
          className={styles.segments}
          role="progressbar"
          aria-label="Progresso do salto"
          aria-valuemin={1}
          aria-valuemax={screens.length}
          aria-valuenow={done ? screens.length : current + 1}
        >
          {screens.map((s, i) => (
            <span
              key={i}
              className={[
                styles.seg,
                s.kind === 'quiz' ? styles.segQuiz : '',
                done || i < current ? styles.segDone : '',
                !done && i === current ? styles.segNow : '',
              ].join(' ')}
            />
          ))}
        </div>
        {streak >= 2 ? <span className={styles.streak}>{streak} seguidas</span> : null}
      </header>
      <p className={styles.meta}>
        {module.level} · Salto {moduleIndex + 1}/{trail.modules.length} · {module.short}
      </p>

      {done ? (
        <div className={styles.body}>{completion}</div>
      ) : (
        <main key={current} className={styles.body}>
          {screen?.kind === 'content' ? (
            <>
              {current === 0 ? (
                <>
                  <h1 className={styles.title}>{module.title}</h1>
                  <p className={styles.lead}>{module.lead}</p>
                  <div className={styles.sintaxe}>
                    <SintaxeFace size={40} />
                    <p>
                      <b>Senhorita Sintaxe</b> · Bora, {travelerName}. Cada tela é curtinha, e no caminho tem paradoxo
                      pra resolver.
                    </p>
                  </div>
                </>
              ) : null}
              {screen.blocks.map((i) => (
                <BlockRenderer key={i} block={module.blocks[i]} travelerName={travelerName} onOpenInLab={onOpenInLab} />
              ))}
            </>
          ) : screen?.kind === 'quiz' && quizItem ? (
            <QuizQuestion
              key={screen.quizIndex}
              trailId={trail.id}
              moduleId={module.id}
              quizIndex={screen.quizIndex}
              item={quizItem}
              variant="lesson"
              position={screen.quizIndex + 1}
              total={module.quiz.length}
              onChange={onQuizChange}
              onAnswered={bump}
            />
          ) : null}
        </main>
      )}

      {done ? null : screen?.kind === 'content' ? (
        <footer className={styles.bar}>
          <div className={styles.barRow}>
            {current > 0 ? (
              <button type="button" className={styles.backBtn} onClick={back} aria-label="Tela anterior">
                ◂
              </button>
            ) : null}
            <button type="button" className={styles.primary} onClick={advance}>
              {isLast ? 'Acender o cristal ▸' : 'Entendi'}
            </button>
          </div>
        </footer>
      ) : quizState.status === 'solved' && quizItem ? (
        <footer className={`${styles.bar} ${styles.barGood}`} role="status">
          <div className={styles.feedbackHead}>
            <b>{quizState.firstTry ? 'Na mosca!' : 'Paradoxo resolvido!'}</b>
            {quizState.xpGained > 0 ? <span className={styles.xp}>+{quizState.xpGained} XP</span> : null}
          </div>
          {/* `explain` é conteúdo do próprio projeto (pode ter <code>, <b>), como nas lições. */}
          <p className={styles.explain} dangerouslySetInnerHTML={{ __html: quizItem.explain }} />
          <button type="button" className={`${styles.primary} ${styles.primaryGood}`} onClick={advance}>
            {isLast ? 'Acender o cristal ▸' : 'Continuar'}
          </button>
        </footer>
      ) : quizState.status === 'wrong' ? (
        <footer className={`${styles.bar} ${styles.barBad}`} role="status">
          <div className={styles.feedbackHead}>
            <b>Ainda não.</b>
          </div>
          <p className={styles.explain}>Tente outra opção. Errar aqui não tira nada de você.</p>
        </footer>
      ) : null}
    </div>
  );
}
