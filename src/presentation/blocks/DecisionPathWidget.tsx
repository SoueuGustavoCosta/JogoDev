import { useState } from 'react';
import { NotebookFrame } from '@/presentation/design-system';
import styles from './DecisionPathWidget.module.css';

type Branch = 'if' | 'elseif' | 'else';

function branchFor(media: number): Branch {
  if (media >= 7) return 'if';
  if (media >= 5) return 'elseif';
  return 'else';
}

const RESULT: Record<Branch, string> = {
  if: 'Aprovado!',
  elseif: 'Recuperação.',
  else: 'Reprovado.',
};

/**
 * Farol 5 (decisoes.ts): mexe em $media e vê qual ramo do if/elseif/else acende — o
 * mesmo exemplo media.php do bloco de código acima. Widget registrado como
 * `{ t: 'gui', widget: 'qual-caminho' }`.
 */
export function DecisionPathWidget() {
  const [media, setMedia] = useState(7.5);
  const branch = branchFor(media);

  return (
    <NotebookFrame title="media.php (ao vivo)">
      <div className={styles.wrap}>
        <label className={styles.slider}>
          <span>
            $media = <b>{media}</b>
          </span>
          <input type="range" min={0} max={10} step={0.5} value={media} onChange={(e) => setMedia(Number(e.target.value))} />
        </label>
        <pre className={styles.code}>
          <span className={branch === 'if' ? styles.on : styles.off}>if ($media &gt;= 7) {'{'} echo &quot;Aprovado!&quot;; {'}'}</span>
          {'\n'}
          <span className={branch === 'elseif' ? styles.on : styles.off}>elseif ($media &gt;= 5) {'{'} echo &quot;Recuperação.&quot;; {'}'}</span>
          {'\n'}
          <span className={branch === 'else' ? styles.on : styles.off}>else {'{'} echo &quot;Reprovado.&quot;; {'}'}</span>
        </pre>
        <p className={styles.result}>
          Resultado: <b>{RESULT[branch]}</b>
        </p>
      </div>
    </NotebookFrame>
  );
}
