import type { AvatarLook } from '@/domain/cosmetics';
import { AvatarLookLayer } from './AvatarLook';
import styles from './Avatar.module.css';

function initialOf(name: string): string {
  return (name.trim()[0] ?? 'V').toUpperCase();
}

/**
 * Avatar circular com foto (ou inicial do nome) e bolinha verde opcional de "online".
 * `look`: cosméticos equipados (Etapa 9): cor de fundo, moldura, cabelo e acessório.
 */
export function Avatar({
  name,
  url,
  size,
  online,
  look,
}: {
  name: string;
  url: string | null;
  size: number;
  online?: boolean;
  look?: AvatarLook;
}) {
  const color = look?.color;
  const tint = color ? { background: `linear-gradient(135deg, ${color.from}, ${color.to})`, borderColor: color.from } : undefined;
  return (
    <span className={styles.avatarWrap} style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" className={styles.avatarImg} style={color ? { borderColor: color.from } : undefined} />
      ) : (
        <span className={styles.avatarInitial} aria-hidden="true" style={tint}>
          {initialOf(name)}
        </span>
      )}
      {look ? <AvatarLookLayer look={look} /> : null}
      {online ? <span className={styles.onlineDot} aria-hidden="true" /> : null}
    </span>
  );
}
