import { useCallback, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';
import {
  FALLING_PARTS_CONFIG,
  type FallingPartsMode,
} from '../../data/arcadePhase7';
import { useSafeInterval } from '../../hooks/useSafeInterval';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'pick' | 'playing' | 'won' | 'lost';

interface Part {
  id: number;
  x: number;
  y: number;
}

export function FallingPartsGame({ onFinish }: Props) {
  const [mode, setMode] = useState<FallingPartsMode>('easy');
  const [phase, setPhase] = useState<Phase>('pick');
  const [paddle, setPaddle] = useState(50);
  const [hint, setHint] = useState(
    'Choose a drop rate, then catch enough gears. Miss too many and the line stops.',
  );
  const [renderTick, setRenderTick] = useState(0);

  const partsRef = useRef<Part[]>([]);
  const caughtRef = useRef(0);
  const missedRef = useRef(0);
  const tickRef = useRef(0);
  const nextIdRef = useRef(0);
  const finishedRef = useRef(false);
  const phaseRef = useRef<Phase>('pick');
  const paddleRef = useRef(50);

  const cfg = FALLING_PARTS_CONFIG[mode];

  const bump = useCallback(() => setRenderTick((t) => t + 1), []);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const syncPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const resetRun = () => {
    finishedRef.current = false;
    partsRef.current = [];
    caughtRef.current = 0;
    missedRef.current = 0;
    tickRef.current = 0;
    nextIdRef.current = 0;
    setPaddle(50);
    paddleRef.current = 50;
    syncPhase('playing');
    setHint(`Catch ${cfg.needCatch} loads · mode: ${cfg.label}.`);
    bump();
  };

  useSafeInterval(
    () => {
      if (finishedRef.current || phaseRef.current !== 'playing') return;
      const c = FALLING_PARTS_CONFIG[mode];
      tickRef.current += 1;

      const paddleW = 22;
      const catchY = 88;
      const nextParts: Part[] = [];
      for (const p of partsRef.current) {
        const y = p.y + c.fallStep;
        if (y >= catchY - 2 && y <= catchY + 10) {
          const px = paddleRef.current;
          if (p.x >= px - paddleW / 2 && p.x <= px + paddleW / 2) {
            caughtRef.current += 1;
            continue;
          }
        }
        if (y > 100) {
          missedRef.current += 1;
          if (missedRef.current >= c.maxMiss) {
            syncPhase('lost');
            setHint(`${c.tip} You can switch to Easy for a slower belt.`);
            safeFinish({ won: false });
            bump();
            return;
          }
        } else {
          nextParts.push({ ...p, y });
        }
      }

      let spawn = nextParts;
      if (tickRef.current % c.spawnEvery === 0) {
        spawn = [
          ...spawn,
          {
            id: nextIdRef.current++,
            x: 12 + Math.random() * 76,
            y: 0,
          },
        ];
      }
      partsRef.current = spawn;

      if (caughtRef.current >= c.needCatch) {
        syncPhase('won');
        const score =
          700 +
          (mode === 'challenge' ? 200 : mode === 'standard' ? 120 : 60) -
          missedRef.current * 40;
        setHint(`Hopper full! Score ${score}.`);
        safeFinish({ won: true, scoreIfWin: Math.max(400, score) });
      }
      bump();
    },
    phase === 'playing' ? cfg.tickMs : null,
  );

  const nudge = (dir: -1 | 1) => {
    if (phase !== 'playing') return;
    setPaddle((p) => {
      const n = Math.max(14, Math.min(86, p + dir * 7));
      paddleRef.current = n;
      return n;
    });
  };

  const parts = partsRef.current;

  return (
    <div className="rg-vehicle-game" data-sync={renderTick}>
      <p className="rg-vehicle-hint">{hint}</p>
      {phase === 'pick' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {(['easy', 'standard', 'challenge'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`rg-btn ${mode === m ? 'rg-btn-primary' : 'rg-btn-ghost'}`}
              onClick={() => setMode(m)}
            >
              {FALLING_PARTS_CONFIG[m].label}
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height: 200,
          border: '2px solid var(--rg-cyan-dim)',
          borderRadius: 10,
          background: 'linear-gradient(180deg,#161b22,#0d1117)',
          overflow: 'hidden',
        }}
      >
        {parts.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: 4,
              background: 'var(--rg-yellow)',
              boxShadow: '0 0 6px rgba(255,224,102,0.6)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: `${paddle}%`,
            bottom: 8,
            transform: 'translateX(-50%)',
            width: 44,
            height: 10,
            borderRadius: 4,
            background: 'var(--rg-cyan)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: '10%',
            right: '10%',
            borderTop: '1px dashed rgba(88,212,255,0.4)',
          }}
        />
        <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 12, color: 'var(--rg-muted)' }}>
          Caught {caughtRef.current}/{cfg.needCatch} · Missed {missedRef.current}/{cfg.maxMiss}
        </span>
      </div>
      <div className="rg-vehicle-controls">
        <button type="button" className="rg-btn rg-btn-ghost" onClick={() => nudge(-1)}>
          ◀ Hopper
        </button>
        <button type="button" className="rg-btn rg-btn-ghost" onClick={() => nudge(1)}>
          Hopper ▶
        </button>
      </div>
      <div className="rg-vehicle-actions">
        {phase === 'pick' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={resetRun}>
            Start run
          </button>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <button type="button" className="rg-btn rg-btn-success" onClick={() => syncPhase('pick')}>
            Change mode / retry
          </button>
        )}
      </div>
    </div>
  );
}
