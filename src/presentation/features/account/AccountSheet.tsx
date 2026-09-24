import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { needsSignInAgain } from '@/application/usecases';
import { useServices } from '@/presentation/app/ServicesContext';
import type { AccountTab } from './accountSheetContext';
import { ForgotForm, LoginForm, SignUpForm } from './forms';
import styles from './AccountSheet.module.css';

/** Painéis lado a lado: Entrar, Criar conta e (só por link) Esqueci a senha. */
const PANELS = ['login', 'signup', 'forgot'] as const;
type Panel = (typeof PANELS)[number];

const CLOSE_MS = 260;
const SWIPE_PX = 50;

/**
 * Gaveta de conta que sobe por cima da tela atual (bottom sheet no celular, cartão
 * centralizado no desktop). As abas "Entrar" e "Criar conta" deslizam de um lado para o
 * outro, por toque na aba ou arrastando o dedo na horizontal; arrastar a alça para baixo
 * fecha. A pessoa nunca sai da tela em que estava.
 */
export function AccountSheet({ initialTab, onClose }: { initialTab: AccountTab; onClose: () => void }) {
  const { progressRepository } = useServices();
  const expired = needsSignInAgain({ repository: progressRepository });
  const [panel, setPanel] = useState<Panel>(initialTab);
  const [closing, setClosing] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null);
  const handleDrag = useRef<number | null>(null);
  const index = PANELS.indexOf(panel);

  function close() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }

  // Esc fecha; a página por trás não rola enquanto a gaveta está aberta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A altura acompanha o painel visível (Criar conta é mais alto que Entrar), e os painéis
  // escondidos ficam fora do foco do teclado e dos leitores de tela.
  useLayoutEffect(() => {
    const active = panelRefs.current[index];
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      el.toggleAttribute('inert', i !== index);
      el.setAttribute('aria-hidden', String(i !== index));
    });
    if (!active) return;
    const update = () => setHeight(active.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(active);
    return () => observer.disconnect();
  }, [index]);

  // Arrastar na horizontal troca de aba (só entre Entrar e Criar conta).
  function onTrackDown(e: PointerEvent<HTMLDivElement>) {
    if (panel === 'forgot' || e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY, axis: null };
  }
  function onTrackMove(e: PointerEvent<HTMLDivElement>) {
    const s = swipe.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 10) s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (s.axis !== 'x') return;
    // Resistência nas pontas: não dá pra puxar além da primeira nem da última aba.
    const atEdge = (index === 0 && dx > 0) || (index === 1 && dx < 0);
    setDragX(atEdge ? dx / 4 : dx);
  }
  function onTrackUp() {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.axis !== 'x') return;
    if (dragX < -SWIPE_PX && index === 0) setPanel('signup');
    else if (dragX > SWIPE_PX && index === 1) setPanel('login');
    setDragX(0);
  }

  // Arrastar a alça para baixo fecha a gaveta.
  function onHandleDown(e: PointerEvent<HTMLDivElement>) {
    handleDrag.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onHandleMove(e: PointerEvent<HTMLDivElement>) {
    if (handleDrag.current === null) return;
    setDragY(Math.max(0, e.clientY - handleDrag.current));
  }
  function onHandleUp() {
    if (handleDrag.current === null) return;
    handleDrag.current = null;
    if (dragY > 90) close();
    else setDragY(0);
  }

  const dragging = dragX !== 0 || dragY !== 0;
  const tabIndex = panel === 'signup' ? 1 : 0;

  return createPortal(
    <div className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`} onClick={close}>
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={`${styles.sheet} ${closing ? styles.sheetClosing : ''} ${dragY ? styles.noTransition : ''}`}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={panel === 'signup' ? 'Criar conta' : panel === 'forgot' ? 'Esqueci minha senha' : 'Entrar'}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.handleArea}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <span className={styles.handle} aria-hidden="true" />
        </div>
        <button type="button" className={styles.close} onClick={close} aria-label="Fechar">
          ✕
        </button>

        {panel === 'forgot' ? (
          <h2 className={styles.forgotTitle}>Esqueci minha senha</h2>
        ) : (
          <div className={styles.tabs} role="tablist" aria-label="Conta">
            <span
              className={styles.pill}
              aria-hidden="true"
              style={{ transform: `translateX(${tabIndex * 100}%)` }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'login'}
              className={`${styles.tab} ${panel === 'login' ? styles.tabActive : ''}`}
              onClick={() => setPanel('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'signup'}
              className={`${styles.tab} ${panel === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setPanel('signup')}
            >
              Criar conta
            </button>
          </div>
        )}

        <div className={styles.viewport} style={{ height }}>
          <div
            className={`${styles.track} ${dragging ? styles.noTransition : ''}`}
            style={{ transform: `translateX(calc(${-index * 100}% + ${dragX}px))` }}
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onPointerUp={onTrackUp}
            onPointerCancel={onTrackUp}
          >
            <div className={styles.panel} ref={(el) => (panelRefs.current[0] = el)} role="tabpanel">
              <LoginForm
                idPrefix="sheet"
                expired={expired}
                onForgot={() => setPanel('forgot')}
                onCreateAccount={() => setPanel('signup')}
              />
            </div>
            <div className={styles.panel} ref={(el) => (panelRefs.current[1] = el)} role="tabpanel">
              <SignUpForm idPrefix="sheet" onSignIn={() => setPanel('login')} />
            </div>
            <div className={styles.panel} ref={(el) => (panelRefs.current[2] = el)}>
              <ForgotForm idPrefix="sheet" onBack={() => setPanel('login')} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
