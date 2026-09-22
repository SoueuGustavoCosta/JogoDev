import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Sempre em portal pra `document.body`: apesar de `position: fixed`, um ancestral
  // qualquer com `position: relative` + `z-index` (ex.: o cabeçalho do prólogo) cria seu
  // próprio contexto de empilhamento e prende o modal dentro dele — bastava outro
  // elemento com `z-index` maior fora desse ancestral (ex.: o balão de diálogo da
  // Senhorita Sintaxe) pra aparecer por cima do modal. O portal escapa disso sempre.
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
