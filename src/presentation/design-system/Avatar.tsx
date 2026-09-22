import styles from './Avatar.module.css';

function initialOf(name: string): string {
  return (name.trim()[0] ?? 'V').toUpperCase();
}

/** Avatar circular com foto (ou inicial do nome) e bolinha verde opcional de "online". */
export function Avatar({
  name,
  url,
  size,
  online,
}: {
  name: string;
  url: string | null;
  size: number;
  online?: boolean;
}) {
  return (
    <span className={styles.avatarWrap} style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" className={styles.avatarImg} />
      ) : (
        <span className={styles.avatarInitial} aria-hidden="true">
          {initialOf(name)}
        </span>
      )}
      {online ? <span className={styles.onlineDot} aria-hidden="true" /> : null}
    </span>
  );
}
