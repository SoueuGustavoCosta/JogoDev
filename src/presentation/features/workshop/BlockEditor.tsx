import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  indentLevels,
  moveBlock,
  paletteLabel,
  renderBlock,
  slotDefaults,
  type PaletteBlock,
  type PlacedBlock,
} from '@/domain/workshop';
import { Modal } from '@/presentation/design-system';
import styles from './BlockEditor.module.css';

const HOLD_MS = 450;

let nextKey = 0;
function newKey(): string {
  nextKey += 1;
  return `b${Date.now().toString(36)}${nextKey}`;
}

/**
 * Modo blocos da Oficina (13B): toque numa peça da paleta para pôr no fim; arraste pela alça
 * (⋮⋮) para mudar a ordem (ou use as setas do teclado na alça); segure um bloco para trocar
 * os valores editáveis. As chaves `{ }` das peças controlam a indentação.
 */
export function BlockEditor({
  palette,
  placed,
  onChange,
}: {
  palette: readonly PaletteBlock[];
  placed: readonly PlacedBlock[];
  onChange: (placed: PlacedBlock[]) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const hold = useRef<number | null>(null);

  const lines = placed.map((p) => {
    const block = palette.find((b) => b.id === p.blockId);
    return block ? renderBlock(block, p.values) : '';
  });
  const levels = indentLevels(lines);

  function add(block: PaletteBlock) {
    onChange([...placed, { key: newKey(), blockId: block.id, values: slotDefaults(block) }]);
  }

  function remove(index: number) {
    onChange(placed.filter((_, i) => i !== index));
  }

  function startDrag(index: number, e: ReactPointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(index);
  }

  function onDragMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (dragging === null) return;
    const y = e.clientY;
    let target = dragging;
    rows.current.forEach((row, i) => {
      if (!row) return;
      const rect = row.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) target = i;
    });
    if (target !== dragging) {
      onChange(moveBlock(placed, dragging, target));
      setDragging(target);
    }
  }

  function startHold(index: number) {
    cancelHold();
    hold.current = window.setTimeout(() => setEditing(index), HOLD_MS);
  }

  function cancelHold() {
    if (hold.current !== null) window.clearTimeout(hold.current);
    hold.current = null;
  }

  const editBlock = editing !== null ? palette.find((b) => b.id === placed[editing]?.blockId) : undefined;

  return (
    <div className={styles.root}>
      <ol className={styles.program} aria-label="Seu programa em blocos">
        {placed.map((p, i) => {
          const block = palette.find((b) => b.id === p.blockId);
          const opens = /\{\s*$/.test(lines[i]) || /^\s*\}/.test(lines[i]);
          return (
            <li
              key={p.key}
              ref={(el) => {
                rows.current[i] = el;
              }}
              className={`${styles.row} ${opens ? styles.rowBrace : styles.rowLine} ${dragging === i ? styles.dragging : ''}`}
              style={{ marginLeft: `${levels[i] * 18}px` }}
            >
              <button
                type="button"
                className={styles.handle}
                aria-label={`Mover o bloco ${i + 1} (setas para cima e para baixo)`}
                onPointerDown={(e) => startDrag(i, e)}
                onPointerMove={onDragMove}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' && i > 0) {
                    e.preventDefault();
                    onChange(moveBlock(placed, i, i - 1));
                  } else if (e.key === 'ArrowDown' && i < placed.length - 1) {
                    e.preventDefault();
                    onChange(moveBlock(placed, i, i + 1));
                  }
                }}
              >
                ⋮⋮
              </button>
              <button
                type="button"
                className={styles.code}
                aria-label={`${lines[i]}${block && slotDefaults(block).length > 0 ? ' (segure para editar)' : ''}`}
                onPointerDown={() => startHold(i)}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick={() => setEditing(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditing(i);
                }}
              >
                {lines[i]}
              </button>
              <button type="button" className={styles.remove} aria-label={`Tirar o bloco ${i + 1}`} onClick={() => remove(i)}>
                ✕
              </button>
            </li>
          );
        })}
        <li className={styles.drop} aria-hidden="true">
          {placed.length === 0 ? 'toque nas peças abaixo para montar' : 'o próximo bloco entra aqui'}
        </li>
      </ol>

      <p className={styles.paletteTitle}>blocos · toque para adicionar, segure para editar</p>
      <div className={styles.palette} role="group" aria-label="Peças disponíveis">
        {palette.map((b) => (
          <button key={b.id} type="button" className={styles.piece} onClick={() => add(b)}>
            {paletteLabel(b)}
          </button>
        ))}
      </div>

      {editing !== null && editBlock ? (
        <EditSheet
          block={editBlock}
          values={placed[editing].values}
          onSave={(values) => {
            onChange(placed.map((p, i) => (i === editing ? { ...p, values } : p)));
            setEditing(null);
          }}
          onRemove={() => {
            remove(editing);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function EditSheet({
  block,
  values,
  onSave,
  onRemove,
  onClose,
}: {
  block: PaletteBlock;
  values: string[];
  onSave: (values: string[]) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const defaults = slotDefaults(block);
  const [draft, setDraft] = useState<string[]>(defaults.map((d, i) => values[i] ?? d));
  return (
    <Modal title="Editar bloco" onClose={onClose}>
      <h2 className={styles.sheetTitle}>Editar bloco</h2>
      <pre className={styles.preview}>{renderBlock(block, draft)}</pre>
      {defaults.length === 0 ? <p className={styles.sheetHint}>Este bloco não tem valor para trocar.</p> : null}
      {defaults.map((_, i) => (
        <label key={i} className={styles.field}>
          <span>Valor {defaults.length > 1 ? i + 1 : ''}</span>
          <input
            value={draft[i]}
            onChange={(e) => setDraft((d) => d.map((v, j) => (j === i ? e.target.value : v)))}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
      ))}
      <div className={styles.sheetActions}>
        <button type="button" className={styles.danger} onClick={onRemove}>
          Tirar bloco
        </button>
        <button type="button" className={styles.save} onClick={() => onSave(draft.map((v) => v.trim() || ' '))}>
          Pronto
        </button>
      </div>
    </Modal>
  );
}
