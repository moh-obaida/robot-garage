import { useCallback, useEffect, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';
import {
  effectivePipeMask,
  PIPE_BASE_MASKS,
  pipePuzzleSolved,
  randomPipeRotations,
} from '../../minigames/logic/pipeConnector';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'ready' | 'playing' | 'won';

function openDirs(mask: number): string {
  const s: string[] = [];
  if (mask & 1) s.push('N');
  if (mask & 2) s.push('E');
  if (mask & 4) s.push('S');
  if (mask & 8) s.push('W');
  return s.length ? s.join('') : '·';
}

function scrambleRotations(): number[][] {
  let r: number[][];
  let guard = 0;
  do {
    r = randomPipeRotations();
    guard += 1;
  } while (pipePuzzleSolved(r) && guard < 80);
  return r;
}

export function PipeConnectorGame({ onFinish }: Props) {
  const [rots, setRots] = useState<number[][]>(() => scrambleRotations());
  const [phase, setPhase] = useState<Phase>('ready');
  const [hint, setHint] = useState(
    'Tap a junction to rotate it until the live path matches the coolant blueprint (letters show open faces).',
  );
  const finishedRef = useRef(false);
  const startedAt = useRef(0);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  useEffect(() => {
    if (phase !== 'playing' || finishedRef.current) return;
    if (pipePuzzleSolved(rots)) {
      setPhase('won');
      const ms = performance.now() - startedAt.current;
      const score = 650 + Math.max(0, Math.floor(400 - ms / 30));
      setHint(`Flow steady! Score ${score}.`);
      safeFinish({ won: true, scoreIfWin: score });
    }
  }, [rots, phase, safeFinish]);

  const begin = () => {
    finishedRef.current = false;
    startedAt.current = performance.now();
    setRots(scrambleRotations());
    setPhase('playing');
    setHint('Spin every tile until each shows the same compass letters as the solved print.');
  };

  const rotateAt = (r: number, c: number) => {
    if (phase !== 'playing') return;
    setRots((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = (next[r][c] + 1) % 4;
      return next;
    });
  };

  const reset = () => {
    finishedRef.current = false;
    setPhase('ready');
    setRots(scrambleRotations());
    setHint('Ready for another pressure test.');
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(72px, 1fr))',
          gap: '0.45rem',
          maxWidth: 280,
        }}
      >
        {PIPE_BASE_MASKS.map((row, r) =>
          row.map((base, c) => {
            const eff = effectivePipeMask(base, rots[r][c]);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className="rg-btn rg-btn-ghost"
                style={{
                  minHeight: 76,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--rg-muted)',
                }}
                disabled={phase !== 'playing'}
                onClick={() => rotateAt(r, c)}
              >
                <span style={{ fontFamily: 'monospace', color: 'var(--rg-cyan)', fontWeight: 700 }}>
                  {openDirs(eff)}
                </span>
                <span style={{ fontSize: 10 }}>turn {rots[r][c]}/4</span>
              </button>
            );
          }),
        )}
      </div>
      <div className="rg-vehicle-actions">
        {phase === 'ready' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={begin}>
            Pressurize loop
          </button>
        )}
        {phase === 'won' && (
          <button type="button" className="rg-btn rg-btn-success" onClick={reset}>
            New layout
          </button>
        )}
      </div>
    </div>
  );
}
