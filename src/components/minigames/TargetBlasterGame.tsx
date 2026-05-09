import { useCallback, useEffect, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';
import { useSafeInterval } from '../../hooks/useSafeInterval';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'ready' | 'playing' | 'won' | 'lost';

const GRID = 3;
const NEED_HITS = 8;
const MAX_MISS = 3;
const WINDOW_MS = 900;

export function TargetBlasterGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [active, setActive] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hint, setHint] = useState(
    'Targets flash on the 3×3 grid — tap the lit cell before it times out.',
  );

  const deadlineRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');
  const activeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const pickNext = useCallback(() => {
    const idx = Math.floor(Math.random() * (GRID * GRID));
    setActive(idx);
    deadlineRef.current = performance.now() + WINDOW_MS;
  }, []);

  const registerMiss = useCallback(() => {
    missesRef.current += 1;
    setMisses(missesRef.current);
    if (missesRef.current >= MAX_MISS) {
      setPhase('lost');
      setActive(null);
      setHint('Timer ran out too many times — tap as soon as the cell glows cyan.');
      safeFinish({ won: false });
      return;
    }
    setHint(`${MAX_MISS - missesRef.current} misses left.`);
    pickNext();
  }, [pickNext, safeFinish]);

  const start = () => {
    finishedRef.current = false;
    hitsRef.current = 0;
    missesRef.current = 0;
    setHits(0);
    setMisses(0);
    setPhase('playing');
    setHint('Stay sharp — the window is short but fair.');
    pickNext();
  };

  useSafeInterval(
    () => {
      if (phaseRef.current !== 'playing' || finishedRef.current) return;
      if (activeRef.current === null) return;
      if (performance.now() > deadlineRef.current) {
        registerMiss();
      }
    },
    phase === 'playing' ? 80 : null,
  );

  const onCell = (idx: number) => {
    if (phase !== 'playing' || active === null) return;
    if (idx !== active) {
      setHint('Wait for the highlighted cell.');
      return;
    }
    hitsRef.current += 1;
    setHits(hitsRef.current);
    if (hitsRef.current >= NEED_HITS) {
      setPhase('won');
      setActive(null);
      const score =
        620 +
        (MAX_MISS - missesRef.current) * 55 +
        Math.floor((NEED_HITS * WINDOW_MS) / 220);
      setHint(`Range clean! Score ${score}.`);
      safeFinish({ won: true, scoreIfWin: score });
      return;
    }
    pickNext();
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--rg-muted)' }}>
        Hits <strong>{hits}</strong> / {NEED_HITS} · Misses <strong>{misses}</strong> / {MAX_MISS}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gap: '0.45rem',
          maxWidth: 260,
        }}
      >
        {Array.from({ length: GRID * GRID }, (_, idx) => (
          <button
            key={idx}
            type="button"
            className="rg-btn rg-btn-ghost"
            style={{
              minHeight: 64,
              borderWidth: 2,
              borderColor:
                active === idx ? 'var(--rg-cyan)' : 'var(--rg-panel-border)',
              boxShadow:
                active === idx ? '0 0 18px rgba(88,212,255,0.55)' : 'none',
            }}
            disabled={phase !== 'playing'}
            onClick={() => onCell(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div className="rg-vehicle-actions">
        {phase === 'ready' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Open range
          </button>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <button type="button" className="rg-btn rg-btn-success" onClick={start}>
            Again
          </button>
        )}
      </div>
    </div>
  );
}
