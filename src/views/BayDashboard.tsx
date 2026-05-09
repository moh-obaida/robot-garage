import { LaunchReadinessPanel } from '../components/LaunchReadinessPanel';
import { RobotPortrait } from '../components/RobotPortrait';
import { PAINT_DEFS } from '../data/cosmetics';
import { ROBOT_DEFS } from '../data/robots';
import { useGameStore } from '../store/gameStore';
import { xpIntoCurrentLevel } from '../store/gameTypes';

export function BayDashboard({
  onGoTraining,
  onGoPit,
  onGoWorkshop,
  onGoProgress,
  onGoHonors,
  onGoWorld,
}: {
  onGoTraining: () => void;
  onGoPit: () => void;
  onGoWorkshop: () => void;
  onGoProgress: () => void;
  onGoHonors: () => void;
  onGoWorld: () => void;
}) {
  const scrap = useGameStore((s) => s.scrap);
  const xp = useGameStore((s) => s.xp);
  const evolutionTier = useGameStore((s) => s.evolutionTier);
  const selectedRobotId = useGameStore((s) => s.selectedRobotId);
  const equippedPaintId = useGameStore((s) => s.equippedPaintId);
  const { into, need } = xpIntoCurrentLevel(xp);

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">Bay overview</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)', fontSize: '0.95rem' }}>
          You run a one-robot garage: train drills, spend scrap on upgrades, and grow
          your frame. Everything saves in this browser.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <div className="rg-progress-bar">
            <span style={{ width: `${(into / need) * 100}%` }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.35rem 0 0' }}>
            XP to next level: {into} / {need}
          </p>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
          Scrap on hand: <strong>{scrap}</strong>
        </p>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        <RobotPortrait
          xp={xp}
          evolutionTier={evolutionTier}
          chassisName={ROBOT_DEFS[selectedRobotId].name}
          shellStyle={PAINT_DEFS[equippedPaintId].shellStyle}
        />
        <div className="rg-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
            Where to next?
          </h3>
          <button type="button" className="rg-btn rg-btn-primary" onClick={onGoTraining}>
            Training floor
          </button>
          <button type="button" className="rg-btn rg-btn-ghost" onClick={onGoPit}>
            Pit league — ghosts &amp; builds
          </button>
          <button type="button" className="rg-btn rg-btn-success" onClick={onGoWorkshop}>
            Workshop &amp; unlocks
          </button>
          <button type="button" className="rg-btn rg-btn-ghost" onClick={onGoProgress}>
            Level &amp; evolution
          </button>
          <button type="button" className="rg-btn rg-btn-ghost" onClick={onGoHonors}>
            Badges &amp; achievements
          </button>
          <button type="button" className="rg-btn rg-btn-ghost" onClick={onGoWorld}>
            World &amp; hangar
          </button>
        </div>
      </div>

      <LaunchReadinessPanel />
    </div>
  );
}
