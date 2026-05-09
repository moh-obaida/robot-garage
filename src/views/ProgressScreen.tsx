import { useState } from 'react';
import { EVOLUTION_MAX_TIER, EVOLUTION_TIERS, evolutionLabel } from '../data/evolution';
import { RobotPortrait } from '../components/RobotPortrait';
import { PAINT_DEFS } from '../data/cosmetics';
import { ROBOT_DEFS } from '../data/robots';
import { useGameStore } from '../store/gameStore';
import { xpIntoCurrentLevel, robotLevelFromXp } from '../store/gameTypes';

export function ProgressScreen() {
  const scrap = useGameStore((s) => s.scrap);
  const xp = useGameStore((s) => s.xp);
  const evolutionTier = useGameStore((s) => s.evolutionTier);
  const purchaseNextEvolution = useGameStore((s) => s.purchaseNextEvolution);
  const selectedRobotId = useGameStore((s) => s.selectedRobotId);
  const equippedPaintId = useGameStore((s) => s.equippedPaintId);
  const { into, need, level } = xpIntoCurrentLevel(xp);
  const [msg, setMsg] = useState<string | null>(null);

  const pilotLevel = robotLevelFromXp(xp);
  const nextTier = EVOLUTION_TIERS.find((t) => t.tier === evolutionTier + 1);
  const maxed = evolutionTier >= EVOLUTION_MAX_TIER;
  const canEvolve =
    !!nextTier &&
    scrap >= nextTier.scrapCost &&
    pilotLevel >= nextTier.minRobotLevel;

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">Levels &amp; evolution</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)' }}>
          XP comes from drills, badges, achievements, and unlock bonuses. Levels open
          better upgrades; evolution is a big scrap sink that shows on the bay screen.
        </p>
      </section>

      {msg ? <div className="rg-feedback info" style={{ marginBottom: '1rem' }}>{msg}</div> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <RobotPortrait
          xp={xp}
          evolutionTier={evolutionTier}
          chassisName={ROBOT_DEFS[selectedRobotId].name}
          shellStyle={PAINT_DEFS[equippedPaintId].shellStyle}
        />
        <div className="rg-panel">
          <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
            Experience
          </h3>
          <p style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800, color: 'var(--rg-yellow)' }}>
            Level {level}
          </p>
          <div className="rg-progress-bar">
            <span style={{ width: `${(into / need) * 100}%` }} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
            {into} / {need} XP toward level {level + 1}
          </p>
        </div>
      </div>

      <section className="rg-panel" style={{ marginTop: '1rem' }}>
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Robot evolution
        </h3>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)', fontSize: '0.9rem' }}>
          Current frame: <strong style={{ color: 'var(--rg-text)' }}>{evolutionLabel(evolutionTier)}</strong>
        </p>
        {maxed ? (
          <p style={{ color: 'var(--rg-green)' }}>You are at the top showroom tier.</p>
        ) : nextTier ? (
          <>
            <p style={{ fontSize: '0.9rem' }}>
              Next: <strong>{nextTier.title}</strong> — {nextTier.blurb}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
              Cost {nextTier.scrapCost} scrap · Pilot level {nextTier.minRobotLevel}+
            </p>
            <button
              type="button"
              className="rg-btn rg-btn-primary"
              disabled={!canEvolve}
              onClick={() => {
                const before = useGameStore.getState().evolutionTier;
                purchaseNextEvolution();
                const after = useGameStore.getState().evolutionTier;
                if (after > before) {
                  setMsg(`Evolution complete — ${evolutionLabel(after)} is live.`);
                } else {
                  setMsg('Cannot evolve yet — save scrap and level up the pilot.');
                }
              }}
            >
              Evolve ({nextTier.scrapCost} scrap)
            </button>
            {!canEvolve && scrap < nextTier.scrapCost ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--rg-red)' }}>Need more scrap.</p>
            ) : null}
            {!canEvolve && scrap >= nextTier.scrapCost && pilotLevel < nextTier.minRobotLevel ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--rg-red)' }}>
                Need pilot level {nextTier.minRobotLevel}.
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
