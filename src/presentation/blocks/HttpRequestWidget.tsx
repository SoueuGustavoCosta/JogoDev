import { useState } from 'react';
import { Button, NotebookFrame } from '@/presentation/design-system';
import styles from './HttpRequestWidget.module.css';

type Side = 'cliente' | 'rede' | 'servidor' | null;

const STEPS: { side: Side; text: string }[] = [
  { side: 'cliente', text: 'Você toca na casa (linha 1, coluna 2) do tabuleiro.' },
  { side: 'rede', text: 'O navegador monta a URL jogo.php?acao=jogar&l=1&c=2 e envia uma requisição GET.' },
  { side: 'servidor', text: 'O servidor recebe, roda jogadorJoga(1, 2) e atualiza $_SESSION[\'jv\'].' },
  { side: 'rede', text: 'O servidor devolve uma resposta: uma página HTML nova, já com a jogada marcada.' },
  { side: 'cliente', text: 'O navegador troca a página antiga pela nova. Um clique, uma requisição completa.' },
];

/**
 * Farol 9 (web.ts): segue um clique numa casa do tabuleiro até a resposta do servidor,
 * passo a passo. Widget registrado como `{ t: 'gui', widget: 'requisicao-http' }`.
 */
export function HttpRequestWidget() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const done = index === STEPS.length - 1;

  return (
    <NotebookFrame title="um-clique.php">
      <div className={styles.wrap}>
        <div className={styles.diagram}>
          <div className={`${styles.box} ${step.side === 'cliente' ? styles.active : ''}`}>Cliente</div>
          <div className={`${styles.arrow} ${step.side === 'rede' ? styles.active : ''}`}>⇄</div>
          <div className={`${styles.box} ${step.side === 'servidor' ? styles.active : ''}`}>Servidor</div>
        </div>
        <p className={styles.step}>
          Passo {index + 1} de {STEPS.length}: {step.text}
        </p>
        <div className={styles.actions}>
          <Button size="sm" variant="ghost" onClick={() => setIndex(0)} disabled={index === 0}>
            Reiniciar
          </Button>
          <Button size="sm" onClick={() => setIndex((i) => Math.min(i + 1, STEPS.length - 1))} disabled={done}>
            {done ? 'Concluído' : 'Próximo passo ▸'}
          </Button>
        </div>
      </div>
    </NotebookFrame>
  );
}
