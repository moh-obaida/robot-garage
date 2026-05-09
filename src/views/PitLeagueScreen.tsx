import { useEffect, useRef, useState } from 'react';
import { LocalTwoPlayerDuel } from '../components/LocalTwoPlayerDuel';
import { MINIGAME_META, MINIGAME_ORDER } from '../data/minigameMeta';
import { LEADERBOARD_SPOTLIGHT } from '../data/phase9Meta';
import { RIVAL_META, RIVAL_ORDER, type RivalId } from '../data/rivals';
import { rollAsyncGhostWin } from '../logic/asyncGhostResolve';
import {
  readRawRobotGarageSave,
  validateRobotGaragePersistedJson,
  type SaveValidationReport,
} from '../logic/saveValidation';
import { robotLevelFromXp } from '../store/gameTypes';
import { useGameStore } from '../store/gameStore';

export function PitLeagueScreen() {
  const xp = useGameStore((s) => s.xp);
  const rankedWins = useGameStore((s) => s.rankedWins);
  const minigames = useGameStore((s) => s.minigames);
  const asyncClaimed = useGameStore((s) => s.asyncPvpFirstWinClaimed);
  const leaderboardBonusClaimed = useGameStore((s) => s.leaderboardBonusClaimed);
  const savedBuildSlots = useGameStore((s) => s.savedBuildSlots);
  const rewardFlash = useGameStore((s) => s.rewardFlash);
  const clearRewardFlash = useGameStore((s) => s.clearRewardFlash);
  const finalizeAsyncPvpMatch = useGameStore((s) => s.finalizeAsyncPvpMatch);
  const claimLeaderboardSpotlight = useGameStore((s) => s.claimLeaderboardSpotlight);
  const saveBuildToSlot = useGameStore((s) => s.saveBuildToSlot);
  const loadBuildFromSlot = useGameStore((s) => s.loadBuildFromSlot);
  const clearBuildSlot = useGameStore((s) => s.clearBuildSlot);

  const [ghostId, setGhostId] = useState<RivalId>('sparky');
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueBusy, setQueueBusy] = useState(false);
  const [saveReport, setSaveReport] = useState<SaveValidationReport | null>(null);
  const queueTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pilotLevel = robotLevelFromXp(xp);
  const trainingDone = Boolean(minigames['training-battle']?.completedOnce);

  useEffect(() => {
    return () => {
      if (queueTimer.current) clearInterval(queueTimer.current);
    };
  }, []);

  const runGhostQueue = () => {
    if (queueBusy || !trainingDone) return;
    setQueueBusy(true);
    setQueueProgress(0);
    if (queueTimer.current) clearInterval(queueTimer.current);
    const started = Date.now();
    queueTimer.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / 1600);
      setQueueProgress(t * 100);
      if (t >= 1 && queueTimer.current) {
        clearInterval(queueTimer.current);
        queueTimer.current = null;
        const won = rollAsyncGhostWin(RIVAL_META[ghostId].tier, pilotLevel);
        finalizeAsyncPvpMatch(ghostId, won);
        setQueueProgress(0);
        setQueueBusy(false);
      }
    }, 40);
  };

  const checkSave = () => {
    const raw = readRawRobotGarageSave();
    setSaveReport(validateRobotGaragePersistedJson(raw));
  };

  return (
    <div>
      <section className="rg-panel rg-pit-hero">
        <h2 className="rg-panel-title">Pit league — multiplayer prep</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)' }}>
          Async ghosts, couch duels, build snapshots, and a local leaderboard. Rewards use guarded
          payouts — nothing duplicates.
        </p>
      </section>

      {rewardFlash ? (
        <div className="rg-pit-flash">
          <p>{rewardFlash}</p>
          <button type="button" className="rg-btn rg-btn-ghost" onClick={() => clearRewardFlash()}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="rg-panel rg-pit-section">
        <h3 className="rg-pit-h3">Battle blueprint</h3>
        <p className="rg-pit-muted">
          Ranked pit uses Strike → beats Overload → beats Guard → beats Strike. Energy and amp rules
          live on the Training tab.
        </p>
        <div className="rg-triangle-codex" aria-hidden>
          <span className="rg-tri n1">Strike</span>
          <span className="rg-tri n2">Overload</span>
          <span className="rg-tri n3">Guard</span>
        </div>
      </section>

      <section className="rg-panel rg-pit-section">
        <h3 className="rg-pit-h3">Saved garage builds</h3>
        <p className="rg-pit-muted">
          Store tuning snapshots (upgrades + frame tier). Loading never grants scrap — it only swaps
          your bay setup.
        </p>
        <div className="rg-build-slots">
          {savedBuildSlots.map((slot, i) => (
            <div key={i} className="rg-build-slot">
              <div>
                <strong>Slot {i + 1}</strong>
                <p className="rg-pit-muted">
                  {slot ? `${slot.name} · saved ${new Date(slot.savedAt).toLocaleDateString()}` : 'Empty'}
                </p>
              </div>
              <div className="rg-build-actions">
                <input
                  className="rg-build-input"
                  placeholder="Name"
                  aria-label={`Build name for slot ${i + 1}`}
                  id={`build-name-${i}`}
                />
                <button
                  type="button"
                  className="rg-btn rg-btn-primary"
                  onClick={() => {
                    const el = document.getElementById(`build-name-${i}`) as HTMLInputElement | null;
                    saveBuildToSlot(i, el?.value ?? '');
                    if (el) el.value = '';
                  }}
                >
                  Save current
                </button>
                <button
                  type="button"
                  className="rg-btn rg-btn-success"
                  onClick={() => loadBuildFromSlot(i)}
                >
                  Load
                </button>
                <button type="button" className="rg-btn rg-btn-ghost" onClick={() => clearBuildSlot(i)}>
                  Clear
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rg-panel rg-pit-section">
        <h3 className="rg-pit-h3">Async ghost challenges</h3>
        <p className="rg-pit-muted">
          Simulated queue — pick a ghost, run the bar, get a win or loss tip. First win per ghost
          pays a small bonus.
        </p>
        {!trainingDone ? (
          <p className="rg-feedback error">Clear Obstacle Alley once to unlock ghost challenges.</p>
        ) : null}
        <div className="rg-rival-grid rg-rival-grid-async">
          {RIVAL_ORDER.map((id) => {
            const r = RIVAL_META[id];
            const claimed = asyncClaimed[id];
            return (
              <button
                key={id}
                type="button"
                disabled={!trainingDone || queueBusy}
                className={`rg-rival-card rg-async-card${ghostId === id ? ' selected' : ''}${claimed ? ' rg-async-done' : ''}`}
                onClick={() => setGhostId(id)}
              >
                <strong>{r.name}</strong>
                <span className="rg-rival-blurb">{r.blurb}</span>
                {claimed ? (
                  <span className="rg-badge rg-badge-done">Bonus claimed</span>
                ) : (
                  <span className="rg-badge" style={{ background: 'var(--rg-cyan-dim)', color: 'var(--rg-cyan)' }}>
                    Bonus open
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="rg-async-queue">
          <div className="rg-progress-bar" aria-hidden>
            <span style={{ width: `${queueProgress}%` }} />
          </div>
          <button
            type="button"
            className="rg-btn rg-btn-primary"
            disabled={!trainingDone || queueBusy}
            onClick={runGhostQueue}
          >
            {queueBusy ? 'Matching…' : 'Queue challenge'}
          </button>
        </div>
      </section>

      <section className="rg-panel rg-pit-section">
        <LocalTwoPlayerDuel />
      </section>

      <section className="rg-panel rg-pit-section">
        <h3 className="rg-pit-h3">Bay leaderboard</h3>
        <p className="rg-pit-muted">
          Local bests per drill plus pit wins. Claim the spotlight stipend once you have enough
          ranked wins.
        </p>
        <div className="rg-leader-table-wrap">
          <table className="rg-leader-table">
            <thead>
              <tr>
                <th>Drill</th>
                <th>Best</th>
              </tr>
            </thead>
            <tbody>
              {MINIGAME_ORDER.map((id) => {
                const meta = MINIGAME_META[id];
                const best = minigames[id]?.bestScore;
                return (
                  <tr key={id}>
                    <td>{meta.title}</td>
                    <td>{best === null || best === undefined ? '—' : best}</td>
                  </tr>
                );
              })}
              <tr>
                <td>
                  <strong>Pit wins</strong>
                </td>
                <td>
                  <strong>{rankedWins}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rg-spotlight-row">
          <p className="rg-pit-muted">
            Spotlight: +{LEADERBOARD_SPOTLIGHT.scrap} scrap / +{LEADERBOARD_SPOTLIGHT.xp} XP · needs{' '}
            {LEADERBOARD_SPOTLIGHT.minRankedWins} pit wins ·{' '}
            {leaderboardBonusClaimed ? 'already claimed' : 'ready if you qualify'}.
          </p>
          <button
            type="button"
            className="rg-btn rg-btn-success"
            disabled={leaderboardBonusClaimed || rankedWins < LEADERBOARD_SPOTLIGHT.minRankedWins}
            onClick={() => claimLeaderboardSpotlight()}
          >
            Claim spotlight
          </button>
        </div>
      </section>

      <section className="rg-panel rg-pit-section">
        <h3 className="rg-pit-h3">Save doctor</h3>
        <p className="rg-pit-muted">
          Quick structural check of your browser save (no fixes applied). Use after updates or if
          something feels off.
        </p>
        <button type="button" className="rg-btn rg-btn-ghost" onClick={checkSave}>
          Validate save
        </button>
        {saveReport ? (
          <div className={`rg-feedback ${saveReport.ok ? 'success' : 'error'}`}>
            {saveReport.ok ? saveReport.message : saveReport.issues.join(' ')}
          </div>
        ) : null}
      </section>

      <section className="rg-panel rg-pit-section rg-pit-network">
        <h3 className="rg-pit-h3">Network-ready layout</h3>
        <p className="rg-pit-muted">
          Future online sync can map this garage to <code>WireableGarageProfileV1</code> and bout
          results to <code>WireableBoutResultV1</code> — see <code>src/data/networkContracts.ts</code>
          .
        </p>
      </section>
    </div>
  );
}
