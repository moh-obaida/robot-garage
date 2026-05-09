import { useCallback, useMemo, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';
import {
  generateMaze,
  MAZE_COLS,
  MAZE_ROWS,
  type MazeCell,
} from '../../minigames/logic/mazeBot';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'ready' | 'playing' | 'won';

export function MazeBotGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [hint, setHint] = useState(
    'Slide the drone to the cyan charge pad (bottom-right). Walls block diagonal moves.',
  );
  const finishedRef = useRef(false);
  const startedAt = useRef(0);

  const maze = useMemo(() => generateMaze(seed), [seed]);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const canMove = (cell: MazeCell, dr: number, dc: number): boolean => {
    if (dr === -1) return cell.n;
    if (dr === 1) return cell.s;
    if (dc === 1) return cell.e;
    if (dc === -1) return cell.w;
    return false;
  };

  const tryMove = (dr: number, dc: number) => {
    if (phase !== 'playing') return;
    const { r, c } = player;
    const cell = maze[r][c];
    if (!canMove(cell, dr, dc)) {
      setHint('Blocked — try another direction.');
      return;
    }
    const nr = r + dr;
    const nc = c + dc;
    setPlayer({ r: nr, c: nc });
    if (nr === MAZE_ROWS - 1 && nc === MAZE_COLS - 1) {
      setPhase('won');
      const ms = performance.now() - startedAt.current;
      const score = 500 + Math.max(0, Math.floor(350 - ms / 25));
      setHint(`Pad reached! Score ${score}.`);
      safeFinish({ won: true, scoreIfWin: score });
    }
  };

  const begin = () => {
    finishedRef.current = false;
    setSeed(Math.floor(Math.random() * 1e9));
    setPlayer({ r: 0, c: 0 });
    startedAt.current = performance.now();
    setPhase('playing');
    setHint('Reach the charge tile in the far corner.');
  };

  const cellSize = 28;

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${MAZE_COLS}, ${cellSize}px)`,
          gap: 0,
          border: '2px solid var(--rg-cyan-dim)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const here = player.r === r && player.c === c;
            const goal = r === MAZE_ROWS - 1 && c === MAZE_COLS - 1;
            const wall = (d: keyof MazeCell) => !cell[d];
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  boxSizing: 'border-box',
                  background: goal
                    ? 'rgba(88,212,255,0.25)'
                    : 'rgba(22,27,34,0.95)',
                  borderTop: wall('n') ? '2px solid var(--rg-panel-border)' : 'none',
                  borderRight: wall('e') ? '2px solid var(--rg-panel-border)' : 'none',
                  borderBottom: wall('s') ? '2px solid var(--rg-panel-border)' : 'none',
                  borderLeft: wall('w') ? '2px solid var(--rg-panel-border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                }}
              >
                {here && (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'var(--rg-yellow)',
                      boxShadow: '0 0 8px var(--rg-yellow)',
                    }}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
      <div
        className="rg-vehicle-controls"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          maxWidth: 200,
          gap: '0.35rem',
          marginTop: '0.75rem',
        }}
      >
        <span />
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'playing'}
          onClick={() => tryMove(-1, 0)}
        >
          ↑
        </button>
        <span />
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'playing'}
          onClick={() => tryMove(0, -1)}
        >
          ←
        </button>
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'playing'}
          onClick={() => tryMove(1, 0)}
        >
          ↓
        </button>
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'playing'}
          onClick={() => tryMove(0, 1)}
        >
          →
        </button>
      </div>
      <div className="rg-vehicle-actions">
        {phase === 'ready' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={begin}>
            Deploy drone
          </button>
        )}
        {phase === 'won' && (
          <button type="button" className="rg-btn rg-btn-success" onClick={begin}>
            New maze
          </button>
        )}
      </div>
    </div>
  );
}
