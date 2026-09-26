import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { buyCosmeticItem, equipCosmeticItem, getShop, openShop, type ShopView } from '@/application/usecases';
import { cosmetics } from '@/content/cosmetics';
import type { AvatarLook, CosmeticEvent, CosmeticItem, CosmeticRarity, CosmeticSlot, ShopItemState } from '@/domain/cosmetics';
import { Avatar } from '@/presentation/design-system';
import { useServices } from '@/presentation/app/ServicesContext';
import type { LayoutOutletContext } from '@/presentation/shell';
import styles from './ShopPage.module.css';

const SLOT_TABS: { slot: CosmeticSlot; label: string }[] = [
  { slot: 'frame', label: 'Molduras' },
  { slot: 'color', label: 'Cores' },
  { slot: 'hair', label: 'Cabelos' },
  { slot: 'accessory', label: 'Acessórios' },
];

const RARITY_LABEL: Record<CosmeticRarity, string> = { comum: 'Comum', raro: 'Raro', lendario: 'Lendário' };

const EVENT_LABEL: Record<CosmeticEvent, string> = {
  'eco-solto': 'Eco Solto',
  convergencia: 'Convergência',
  liga: 'Liga dos Viajantes',
};

/** O visual atual com um item a mais (provador). */
function withItem(look: AvatarLook, item: CosmeticItem): AvatarLook {
  return { ...look, [item.slot]: item };
}

/**
 * Loja do Viajante (Etapa 9), dentro da aba Viajante. Os Fragmentos Temporais (◆) só se
 * ganham jogando: nada aqui custa dinheiro real. Tocar num item prova no avatar grande;
 * comprar pede confirmação, para ninguém gastar sem querer.
 */
export function ShopPage() {
  const { progressRepository, analytics, leaderboard } = useServices();
  const { summary, refreshSummary } = useOutletContext<LayoutOutletContext>();
  const [version, setVersion] = useState(0);
  const [slot, setSlot] = useState<CosmeticSlot>('frame');
  const [trying, setTrying] = useState<CosmeticItem | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const shop: ShopView = useMemo(
    () => getShop({ repository: progressRepository }, { catalog: cosmetics }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressRepository, version],
  );

  useEffect(() => {
    openShop({ analytics });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deps = { repository: progressRepository, analytics, leaderboard };
  const changed = (message: string) => {
    setVersion((v) => v + 1);
    refreshSummary();
    setStatus(message);
    setConfirming(null);
  };

  const buy = (item: CosmeticItem) => {
    if (confirming !== item.id) {
      setConfirming(item.id);
      setTrying(item);
      return;
    }
    const result = buyCosmeticItem(deps, { catalog: cosmetics, itemId: item.id, equip: true });
    if (result.ok) {
      setTrying(null);
      changed(`${item.name} é seu e já está no avatar.`);
    } else {
      setConfirming(null);
      setStatus(result.reason === 'insufficient' ? 'Faltam Fragmentos para esse item.' : 'Não deu para comprar esse item.');
    }
  };

  const equip = (item: CosmeticItem, on: boolean) => {
    equipCosmeticItem(deps, { catalog: cosmetics, slot: item.slot, itemId: on ? item.id : null });
    setTrying(null);
    changed(on ? `${item.name} equipado.` : `${item.name} guardado.`);
  };

  const preview = trying ? withItem(shop.look, trying) : shop.look;
  const items = shop.items.filter((i) => i.item.slot === slot);

  return (
    <article>
      <p className="eyebrow">
        <Link to="/configuracoes" className={styles.back}>
          ◂ Viajante
        </Link>
      </p>
      <h1>Loja do Viajante</h1>

      <section className={styles.hero} aria-label="Seu avatar">
        <Avatar name={summary.name} url={summary.avatarUrl} size={96} look={preview} />
        <div className={styles.wallet}>
          <span className={styles.balance}>
            <b>{shop.balance}</b> ◆
          </span>
          <span className={styles.walletHint}>
            Fragmentos Temporais se ganham consertando a <Link to="/anomalia">Anomalia do Dia</Link>. Nada aqui custa
            dinheiro.
          </span>
          {trying ? (
            <button type="button" className={styles.linkButton} onClick={() => setTrying(null)}>
              Provando: {trying.name} · voltar ao meu visual
            </button>
          ) : null}
        </div>
      </section>

      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>

      <div className={styles.tabs} role="tablist" aria-label="Tipo de item">
        {SLOT_TABS.map((t) => (
          <button
            key={t.slot}
            type="button"
            role="tab"
            aria-selected={slot === t.slot}
            className={`${styles.tab} ${slot === t.slot ? styles.tabOn : ''}`}
            onClick={() => {
              setSlot(t.slot);
              setConfirming(null);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className={styles.grid} role="tabpanel">
        {items.map(({ item, state }) => (
          <li key={item.id} className={`${styles.card} ${styles[`r-${item.rarity}`] ?? ''}`}>
            <button
              type="button"
              className={styles.tryOn}
              aria-label={`Provar ${item.name}`}
              aria-pressed={trying?.id === item.id}
              onClick={() => setTrying(trying?.id === item.id ? null : item)}
            >
              <Avatar name={summary.name} url={summary.avatarUrl} size={56} look={withItem(shop.look, item)} />
            </button>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.rarity}>{RARITY_LABEL[item.rarity]}</span>
            <span className={styles.desc}>{item.description}</span>
            <ItemAction
              item={item}
              state={state}
              balance={shop.balance}
              confirming={confirming === item.id}
              onBuy={() => buy(item)}
              onEquip={(on) => equip(item, on)}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}

function ItemAction({
  item,
  state,
  balance,
  confirming,
  onBuy,
  onEquip,
}: {
  item: CosmeticItem;
  state: ShopItemState;
  balance: number;
  confirming: boolean;
  onBuy: () => void;
  onEquip: (on: boolean) => void;
}) {
  switch (state) {
    case 'equipped':
      return (
        <button type="button" className={`${styles.action} ${styles.actionOn}`} onClick={() => onEquip(false)}>
          Equipado ✓ · tirar
        </button>
      );
    case 'owned':
      return (
        <button type="button" className={styles.action} onClick={() => onEquip(true)}>
          Equipar
        </button>
      );
    case 'affordable':
      return (
        <button type="button" className={`${styles.action} ${confirming ? styles.actionConfirm : styles.actionBuy}`} onClick={onBuy}>
          {confirming ? `Confirmar: ${item.price} ◆` : `Comprar · ${item.price} ◆`}
        </button>
      );
    case 'too-expensive':
      return (
        <span className={styles.note}>
          {item.price} ◆ · faltam {(item.price ?? 0) - balance}
        </span>
      );
    case 'event-only':
      return <span className={styles.note}>Só no evento {item.event ? EVENT_LABEL[item.event] : ''}</span>;
  }
}
