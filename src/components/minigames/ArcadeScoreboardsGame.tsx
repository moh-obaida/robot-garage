import { useCallback, useMemo, useRef, useState } from 'react';
import { MINIGAME_META, MINIGAME_ORDER } from '../../data/minigameMeta';
import type { MinigameResultInput } from '../../store/gameStore';
import { useGameStore } from '../../store/gameStore';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

export function ArcadeScoreboardsGame({ onFinish }: Props) {
  const minigames = useGameStore((s) => s.minigames);
  const progress = useGameStore((s) => s.minigames['arcade-scoreboards']);
  const [hint, setHint] = useState(
    'Your saved bests stay in this browser. Stamp the ledger once to bank the hall bonus.',
  );
  const finishedRef = useRef(false);

  const rows = useMemo(
    () =>
      MINIGAME_ORDER.map((id) => ({
        id,
        title: MINIGAME_META[id].title,
        best: minigames[id]?.bestScore,
        cleared: minigames[id]?.completedOnce ?? false,
      })),
    [minigames],
  );

  const totalScore = useMemo(
    () =>
      rows.reduce((acc, r) => acc + (typeof r.best === 'number' ? r.best : 0), 0),
    [rows],
  );

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const stamp = () => {
    if (progress.completedOnce) {
      setHint('Ledger already stamped — your table updates as you set new bests elsewhere.');
      return;
    }
    if (finishedRef.current) return;
    const score =
      400 +
      Math.min(1200, Math.floor(totalScore / 4)) +
      rows.filter((r) => r.cleared).length * 12;
    setHint(`Ledger stamped — score ${score} records your hall totals.`);
    safeFinish({ won: true, scoreIfWin: score });
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <p style={{ fontSize: '0.9rem', color: 'var(--rg-muted)', marginTop: 0 }}>
        Combined best points across benches: <strong style={{ color: 'var(--rg-cyan)' }}>{totalScore}</strong>
      </p>
      <div
        style={{
          maxHeight: 280,
          overflow: 'auto',
          border: '1px solid var(--rg-panel-border)',
          borderRadius: 8,
          marginTop: '0.5rem',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(22,27,34,0.95)', textAlign: 'left' }}>
              <th style={{ padding: '0.45rem 0.5rem' }}>Bench</th>
              <th style={{ padding: '0.45rem 0.5rem' }}>Best</th>
              <th style={{ padding: '0.45rem 0.5rem' }}>Cleared</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--rg-panel-border)' }}>
                <td style={{ padding: '0.35rem 0.5rem' }}>{r.title}</td>
                <td style={{ padding: '0.35rem 0.5rem' }}>
                  {r.best === null || r.best === undefined ? '—' : r.best}
                </td>
                <td style={{ padding: '0.35rem 0.5rem' }}>{r.cleared ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rg-vehicle-actions" style={{ marginTop: '0.75rem' }}>
        <button
          type="button"
          className="rg-btn rg-btn-success"
          disabled={progress.completedOnce}
          onClick={stamp}
        >
          {progress.completedOnce ? 'Hall ledger certified' : 'Stamp hall ledger'}
        </button>
      </div>
    </div>
  );
}
