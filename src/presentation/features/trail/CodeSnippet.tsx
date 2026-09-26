import styles from './Challenges.module.css';

/** O programa de um desafio "o que aparece na tela?", sem ligaduras e com rolagem própria. */
export function CodeSnippet({ code, lang }: { code: string; lang: string }) {
  return (
    <div className={styles.code}>
      <span className={styles.lang}>{lang}</span>
      <pre className={styles.program}>{code}</pre>
    </div>
  );
}
