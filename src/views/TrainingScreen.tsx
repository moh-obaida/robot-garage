import { useState } from 'react';
import { MinigameShell } from '../components/MinigameShell';
import { MinigameRouter } from '../components/MinigameRouter';
import { MINIGAME_META, MINIGAME_ORDER, type MinigameId } from '../data/minigameMeta';
import { useGameStore, type MinigameResultInput } from '../store/gameStore';

export function TrainingScreen() {
  const minigames = useGameStore((s) => s.minigames);
  const applyMinigameResult = useGameStore((s) => s.applyMinigameResult);
  const [active, setActive] = useState<MinigameId | null>(null);
  const [note, setNote] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );

  const open = (id: MinigameId) => {
    setNote(null);
    setActive(id);
  };

  const close = () => {
    setActive(null);
    setNote(null);
  };

  const onFinish = (result: MinigameResultInput) => {
    if (!active) return;
    const id = active;
    applyMinigameResult(id, result);
    setActive(null);
    if (result.won) {
      setNote({
        kind: 'success',
        text: 'Drill cleared — scrap and XP banked. First-time clears also open the next drill.',
      });
    } else {
      setNote({
        kind: 'error',
        text: 'Drill failed — no payout this run. Read the tip and try again.',
      });
    }
  };

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">Training floor</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)' }}>
          Clear drills in order to unlock the next. Wins pay scrap and XP; garage upgrades sweeten
          every payout. <strong>Ranked Pit</strong> wins count toward trophies and the header pit
          counter.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <div className="rg-progress-bar">
            <span
              style={{
                width: `${(MINIGAME_ORDER.filter((i) => minigames[i]?.completedOnce).length / MINIGAME_ORDER.length) * 100}%`,
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.35rem 0 0' }}>
            Missions cleared:{' '}
            {MINIGAME_ORDER.filter((i) => minigames[i]?.completedOnce).length} /{' '}
            {MINIGAME_ORDER.length}
          </p>
        </div>
      </section>

      {note ? (
        <div className={`rg-feedback ${note.kind}`} style={{ marginBottom: '1rem' }}>
          {note.text}
        </div>
      ) : null}

      <div className="rg-grid-minigames">
        {MINIGAME_ORDER.map((id) => {
          const meta = MINIGAME_META[id];
          const p = minigames[id];
          const locked = !p.unlocked;
          return (
            <button
              key={id}
              type="button"
              className={`rg-minigame-card${locked ? ' locked' : ''}${active === id ? ' selected' : ''}${!locked && !p.completedOnce ? ' rg-card-pulse' : ''}`}
              disabled={locked}
              onClick={() => open(id)}
            >
              <h3>{meta.title}</h3>
              <p>{meta.blurb}</p>
              {p.completedOnce ? (
                <span className="rg-badge rg-badge-done">Cleared</span>
              ) : locked ? (
                <span className="rg-badge rg-badge-locked">Locked</span>
              ) : (
                <span
                  className="rg-badge"
                  style={{ background: 'var(--rg-cyan-dim)', color: 'var(--rg-cyan)' }}
                >
                  Ready
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active ? (
        <MinigameShell
          gameId={active}
          progress={minigames[active]}
          onBack={close}
          feedback={null}
        >
          <MinigameRouter key={active} gameId={active} onFinish={onFinish} />
        </MinigameShell>
      ) : null}
    </div>
  );
}
