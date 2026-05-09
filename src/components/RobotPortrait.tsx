import { evolutionLabel } from '../data/evolution';
import { robotLevelFromXp } from '../store/gameTypes';

export function RobotPortrait({
  xp,
  evolutionTier,
  chassisName,
  shellStyle,
}: {
  xp: number;
  evolutionTier: number;
  /** Active robot / hangar name */
  chassisName?: string;
  /** CSS background for chassis plate */
  shellStyle?: string;
}) {
  const level = robotLevelFromXp(xp);
  const tierLabel = evolutionLabel(evolutionTier);
  const glow =
    evolutionTier >= 3
      ? '0 0 28px rgba(240,193,75,0.55)'
      : evolutionTier >= 1
        ? '0 0 22px var(--rg-cyan-dim)'
        : 'none';

  const plateBg =
    shellStyle ?? 'linear-gradient(180deg, #1c2128, #0d1117)';

  return (
    <div
      className="rg-panel"
      style={{
        textAlign: 'center',
        padding: '1.5rem 1rem',
        boxShadow: glow,
      }}
    >
      <div
        aria-hidden
        style={{
          margin: '0 auto',
          width: 120,
          height: 100,
          borderRadius: 12,
          border: '2px solid var(--rg-cyan-dim)',
          background: plateBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          lineHeight: 1,
          filter: evolutionTier >= 2 ? 'none' : 'grayscale(15%)',
        }}
      >
        🤖
      </div>
      {chassisName ? (
        <p style={{ margin: '0.65rem 0 0', fontWeight: 700, color: 'var(--rg-yellow)' }}>
          {chassisName}
        </p>
      ) : null}
      <p
        style={{
          margin: chassisName ? '0.25rem 0 0' : '0.75rem 0 0',
          fontWeight: 700,
          color: 'var(--rg-cyan)',
        }}
      >
        {tierLabel}
      </p>
      <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'var(--rg-muted)' }}>
        Pilot level {level}
      </p>
    </div>
  );
}
