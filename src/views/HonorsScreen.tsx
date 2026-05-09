import { ACHIEVEMENT_DEFS, ACHIEVEMENT_ORDER } from '../data/achievements';
import { BADGE_DEFS, BADGE_ORDER } from '../data/badges';
import { useGameStore } from '../store/gameStore';

export function HonorsScreen() {
  const badges = useGameStore((s) => s.badges);
  const achievements = useGameStore((s) => s.achievements);
  const claimBadgeReward = useGameStore((s) => s.claimBadgeReward);
  const claimAchievementReward = useGameStore((s) => s.claimAchievementReward);

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">Badges &amp; achievements</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)' }}>
          Meet the goal to unlock a row, then claim the one-time scrap and XP bundle.
          Claim buttons stay disabled after you collect — no double payouts.
        </p>
      </section>

      <h3 style={{ color: 'var(--rg-cyan)', fontSize: '1rem' }}>Badges</h3>
      <div className="rg-grid-minigames" style={{ marginTop: '0.5rem' }}>
        {BADGE_ORDER.map((id) => {
          const def = BADGE_DEFS[id];
          const row = badges[id];
          const locked = !row.unlocked;
          const claimed = row.rewardClaimed;
          return (
            <div
              key={id}
              className="rg-panel"
              style={{
                opacity: locked ? 0.55 : 1,
                borderColor: claimed ? 'var(--rg-green)' : undefined,
              }}
            >
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{def.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
                {def.blurb}
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                Reward +{def.claimScrap} scrap · +{def.claimXp} XP
              </p>
              {locked ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--rg-red)' }}>Locked — keep playing.</p>
              ) : claimed ? (
                <span className="rg-badge rg-badge-done" style={{ marginTop: '0.5rem' }}>
                  Claimed
                </span>
              ) : (
                <button
                  type="button"
                  className="rg-btn rg-btn-success"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={() => claimBadgeReward(id)}
                >
                  Claim reward
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ color: 'var(--rg-cyan)', fontSize: '1rem', marginTop: '1.5rem' }}>
        Achievements
      </h3>
      <div className="rg-grid-minigames" style={{ marginTop: '0.5rem' }}>
        {ACHIEVEMENT_ORDER.map((id) => {
          const def = ACHIEVEMENT_DEFS[id];
          const row = achievements[id];
          const locked = !row.unlocked;
          const claimed = row.rewardClaimed;
          return (
            <div
              key={id}
              className="rg-panel"
              style={{
                opacity: locked ? 0.55 : 1,
                borderColor: claimed ? 'var(--rg-green)' : undefined,
              }}
            >
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{def.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
                {def.blurb}
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                Reward +{def.claimScrap} scrap · +{def.claimXp} XP
              </p>
              {locked ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--rg-red)' }}>Locked — keep playing.</p>
              ) : claimed ? (
                <span className="rg-badge rg-badge-done" style={{ marginTop: '0.5rem' }}>
                  Claimed
                </span>
              ) : (
                <button
                  type="button"
                  className="rg-btn rg-btn-success"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={() => claimAchievementReward(id)}
                >
                  Claim reward
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
