import { useRef, useState, type ChangeEvent } from 'react';
import type { ProfileSummary } from '@/application/usecases';
import { uploadAvatarPhoto } from '@/application/usecases';
import type { OnlinePlayer } from '@/application/ports';
import { useServices } from '@/presentation/app/ServicesContext';
import styles from './ProfileHeader.module.css';

const PRESENCE_MAX_AVATARS = 5;

function initialOf(name: string): string {
  return (name.trim()[0] ?? 'V').toUpperCase();
}

function Avatar({
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

export function ProfileHeader({
  summary,
  onlinePlayers,
}: {
  summary: ProfileSummary;
  onlinePlayers: OnlinePlayer[];
}) {
  const { progressRepository, leaderboard, resizeAvatarImage } = useServices();
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = avatarOverride ?? summary.avatarUrl;

  const onPickAvatar = () => fileInputRef.current?.click();

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarOverride(preview);

    try {
      const blob = await resizeAvatarImage(file);
      const url = await uploadAvatarPhoto({ repository: progressRepository, leaderboard }, { blob });
      // Sucesso: troca para a URL real. Falha: mantém a prévia otimista, sem erro visível
      // (mesma filosofia de sincronização silenciosa do resto do app).
      if (url) setAvatarOverride(url);
    } catch {
      // Redimensionar pode falhar em navegadores muito antigos; mantém a prévia local.
    }
  };

  const overflowCount = Math.max(0, onlinePlayers.length - PRESENCE_MAX_AVATARS);

  return (
    <div className={styles.root}>
      <div className={styles.identity}>
        <button type="button" className={styles.avatarButton} onClick={onPickAvatar} aria-label="Trocar minha foto">
          <Avatar name={summary.name} url={avatarUrl} size={48} online />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void onFileChange(e);
          }}
        />
        <div className={styles.names}>
          <span className={styles.name}>{summary.name}</span>
          <span className={styles.title}>
            Viajante · Nível {summary.level}
          </span>
        </div>
      </div>

      <div className={styles.pills}>
        <span className={styles.pill}>
          <b>{summary.crystals}</b> cristais
        </span>
        <span className={styles.pill}>
          <b>{summary.xp}</b> XP
        </span>
        <span className={styles.pill}>
          🔥 <b>{summary.streak.current}</b>
        </span>
        <span className={styles.pill}>
          <b>
            {summary.badgesEarnedCount}/{summary.badgesTotal}
          </b>{' '}
          insígnias
        </span>
      </div>

      {onlinePlayers.length > 0 ? (
        <div className={styles.presence}>
          <div className={styles.presenceAvatars}>
            {onlinePlayers.slice(0, PRESENCE_MAX_AVATARS).map((p) => (
              <span key={p.uuid} className={styles.presenceAvatar}>
                <Avatar name={p.nome} url={p.fotoUrl} size={26} />
              </span>
            ))}
            {overflowCount > 0 ? <span className={styles.presenceOverflow}>+{overflowCount}</span> : null}
          </div>
          <span className={styles.presenceLabel}>
            {onlinePlayers.length === 1 ? '1 viajante online agora' : `${onlinePlayers.length} viajantes online agora`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
