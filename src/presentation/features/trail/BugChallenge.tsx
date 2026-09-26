import type { BugQuizItem } from '@/domain/trail';
import styles from './Challenges.module.css';

/** "Encontre o bug": o programa com as linhas numeradas; o aluno toca na linha errada. */
export function BugChallenge({
  item,
  solved,
  wrongLines,
  onPick,
}: {
  item: BugQuizItem;
  solved: boolean;
  /** Linhas (começando em 1) já tocadas sem acertar. */
  wrongLines: number[];
  onPick: (line: number) => void;
}) {
  return (
    <div className={styles.code}>
      <div className={styles.bugList} role="group" aria-label="Linhas do programa: toque na que tem o bug">
        {item.lines.map((text, i) => {
          const line = i + 1;
          const no = wrongLines.includes(line);
          const ok = solved && line === item.bugLine;
          return (
            <button
              key={line}
              type="button"
              className={`${styles.bugLine} ${ok ? styles.bugOk : ''} ${no ? styles.bugNo : ''}`}
              disabled={solved || no || text.trim() === ''}
              onClick={() => onPick(line)}
              aria-label={`Linha ${line}: ${text.trim() || 'vazia'}`}
            >
              <span className={styles.lineNo}>{line}</span>
              <span className={styles.lineText}>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
