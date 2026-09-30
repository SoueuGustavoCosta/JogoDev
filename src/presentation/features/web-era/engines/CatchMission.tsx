import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { catchPace, type CatchMission as Catch } from '@/domain/webEra';
import { playCorrectSound } from '@/presentation/design-system';
import styles from '../Stage.module.css';
import type { EngineProps } from './types';

type Faller = { el: HTMLButtonElement; x: number; y: number; v: number; dead?: boolean };

/**
 * Chuva de itens (requestAnimationFrame): toque só nos certos até pegar `need`. Começa devagar
 * e acelera a cada acerto; nas fases iniciais, no máximo 2 palavras na tela (ver `catchPace`).
 * Se nenhuma palavra certa está caindo, a próxima é certa: o jogador nunca fica só esperando.
 * A queda mexe direto no `transform` dos botões (nada de re-render por quadro).
 */
export function CatchMission({ mission, api, difficulty }: EngineProps<Catch>) {
  const max = mission.maxErr ?? 3;
  const arenaRef = useRef<HTMLDivElement>(null);
  const [got, setGot] = useState(0);
  const [errs, setErrs] = useState(0);
  const counts = useRef({ got: 0, errs: 0, over: false });
  const items = useRef<Faller[]>([]);
  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    let raf = 0;
    let last = 0;
    let spawnAt = 0;
    let alive = true;

    const pace = catchPace(difficulty);
    const spawn = () => {
      const noGoodFalling = !items.current.some((i) => !i.dead && i.el.dataset.good === '1');
      const good = noGoodFalling || Math.random() < 0.6;
      const list = good ? mission.good : mission.bad;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = styles.fall!;
      el.textContent = list[Math.floor(Math.random() * list.length)]!;
      el.dataset.good = good ? '1' : '0';
      arena.appendChild(el);
      const x = 8 + Math.random() * Math.max(10, arena.clientWidth - el.offsetWidth - 16);
      const it: Faller = { el, x, y: -40, v: pace.baseSpeed + Math.random() * 10 + counts.current.got * pace.speedPerHit };
      el.style.transform = `translate(${x}px,${it.y}px)`;
      items.current.push(it);
    };

    const loop = (ts: number) => {
      if (!alive) return;
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      if (ts > spawnAt && items.current.length < pace.maxOnScreen) {
        spawn();
        spawnAt = ts + pace.spawnMs + Math.random() * 300;
      }
      const h = arena.clientHeight;
      items.current = items.current.filter((it) => {
        if (it.dead) return false;
        it.y += it.v * dt;
        it.el.style.transform = `translate(${it.x}px,${it.y}px)`;
        if (it.y > h) {
          it.el.remove();
          return false;
        }
        return true;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      for (const it of items.current) it.el.remove();
      items.current = [];
    };
  }, [mission, difficulty]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest('button');
    if (!el || !el.dataset.good || el.dataset.hit || counts.current.over) return;
    el.dataset.hit = '1';
    const it = items.current.find((i) => i.el === el);
    if (it) it.dead = true;
    const c = counts.current;
    if (el.dataset.good === '1') {
      el.classList.add(styles.hit!);
      playCorrectSound();
      c.got += 1;
      setGot(c.got);
      if (c.got >= mission.need) {
        c.over = true;
        apiRef.current.ok();
        apiRef.current.win();
      }
    } else {
      el.classList.add(styles.miss!);
      c.errs += 1;
      setErrs(c.errs);
      apiRef.current.err();
      if (c.errs >= max) {
        c.over = true;
        apiRef.current.fail('Pegou coisa errada demais!');
      }
    }
    window.setTimeout(() => el.remove(), 350);
  };

  return (
    <div ref={arenaRef} className={styles.catch} onPointerDown={onPointerDown}>
      <div className={`${styles.score} ${styles.catchScore}`}>
        <span>
          erros <b>{errs}/{max}</b>
        </span>
        <span>
          pegos <b>{got}/{mission.need}</b>
        </span>
      </div>
    </div>
  );
}
