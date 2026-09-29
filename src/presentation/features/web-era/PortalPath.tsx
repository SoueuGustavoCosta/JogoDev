import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './WebEra.module.css';

export type PortalNode = {
  key: string;
  color: string;
  locked: boolean;
  done: boolean;
  current: boolean;
  boss?: boolean;
  inner: ReactNode;
  tag: string;
  title: string;
  small: string;
  onClick: () => void;
};

/**
 * Trilha em zigue-zague com portais animados e uma linha curva ligando um ao outro. A parte
 * já concluída da linha fica colorida e andando; o resto, tracejado apagado.
 */
export function PortalPath({ nodes, doneLinks }: { nodes: PortalNode[]; doneLinks: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ done: string; todo: string }>({ done: '', todo: '' });

  const measure = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    const pts = [...wrap.querySelectorAll<HTMLElement>('[data-portal]')].map((p) => {
      const r = p.getBoundingClientRect();
      return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2] as const;
    });
    let done = '';
    let todo = '';
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]!;
      const [x1, y1] = pts[i]!;
      const my = (y0 + y1) / 2;
      const seg = `M${x0.toFixed(1)},${y0.toFixed(1)} C${x0.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
      if (i <= doneLinks) done += seg;
      else todo += seg;
    }
    setPaths({ done, todo });
  };

  useLayoutEffect(measure, [nodes.length, doneLinks]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneLinks]);

  return (
    <div ref={wrapRef} className={styles.path}>
      <svg className={styles.links} aria-hidden="true">
        <defs>
          <linearGradient id="web-path-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--web-html)" />
            <stop offset=".5" stopColor="var(--web-css)" />
            <stop offset="1" stopColor="var(--web-js)" />
          </linearGradient>
        </defs>
        <path d={paths.todo} fill="none" stroke="var(--web-line)" strokeWidth={3} strokeDasharray="4 8" />
        <path d={paths.done} fill="none" stroke="url(#web-path-grad)" strokeWidth={3.5} strokeDasharray="10 8" className={styles.dash} />
      </svg>
      <div className={styles.nodes}>
        {nodes.map((n) => (
          <button
            key={n.key}
            type="button"
            className={`${styles.node} ${n.locked ? styles.lock : ''} ${n.done ? styles.done : ''} ${n.current ? styles.cur : ''} ${n.boss ? styles.boss : ''}`}
            style={{ ['--c' as string]: n.color }}
            onClick={n.onClick}
            aria-disabled={n.locked || undefined}
            aria-label={`${n.title}. ${n.tag}. ${n.small}`}
          >
            <span className={styles.portal} data-portal="">
              {n.inner}
            </span>
            <span className={styles.lbl}>
              <span className={styles.tag}>{n.tag}</span>
              <b>{n.title}</b>
              <small>{n.small}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
