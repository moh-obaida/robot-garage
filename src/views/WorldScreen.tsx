import { useState } from 'react';
import { FactoryLineGame } from '../components/FactoryLineGame';
import { BOSS_DEFS, BOSS_ORDER, type BossId } from '../data/worldBosses';
import {
  CHAPTER_DEFS,
  CHAPTER_ORDER,
  type ChapterId,
} from '../data/storyChapters';
import { PAINT_DEFS, PAINT_ORDER, type PaintId } from '../data/cosmetics';
import { ROBOT_DEFS, ROBOT_ORDER, robotIsAvailable } from '../data/robots';
import { TROPHY_META, TROPHY_ORDER } from '../data/pvpTrophies';
import {
  type BossTactic,
  randomBossTactic,
  resolveBossRound,
} from '../logic/bossTriangle';
import { useGameStore } from '../store/gameStore';
import { robotLevelFromXp } from '../store/gameTypes';

const TACTIC_LABEL: Record<BossTactic, string> = {
  strike: 'Strike',
  guard: 'Guard',
  overload: 'Overload',
};

function BossFightCard({ bossId }: { bossId: BossId }) {
  const def = BOSS_DEFS[bossId];
  const row = useGameStore((s) => s.bosses[bossId]);
  const defeatBoss = useGameStore((s) => s.defeatBoss);
  const [you, setYou] = useState(0);
  const [them, setThem] = useState(0);
  const [phase, setPhase] = useState<'pick' | 'over'>('pick');
  const [log, setLog] = useState<string | null>(null);

  const reset = () => {
    setYou(0);
    setThem(0);
    setPhase('pick');
    setLog('First to two winning exchanges wins the raid.');
  };

  const pick = (t: BossTactic) => {
    if (phase !== 'pick' || !row?.unlocked || row.defeatedOnce) return;
    const b = randomBossTactic();
    const r = resolveBossRound(t, b);
    if (r === 'tie') {
      setLog(
        `You ${TACTIC_LABEL[t]} vs ${TACTIC_LABEL[b]} — clash! Replay this exchange.`,
      );
      return;
    }
    const ny = r === 'win' ? you + 1 : you;
    const nth = r === 'lose' ? them + 1 : them;
    setYou(ny);
    setThem(nth);
    setLog(
      `You ${TACTIC_LABEL[t]} vs ${TACTIC_LABEL[b]} — ${r === 'win' ? 'you own the angle' : 'they counter'}.`,
    );
    if (ny >= 2) {
      defeatBoss(bossId);
      setPhase('over');
      setLog(`Raid cleared — +${def.rewardScrap} scrap · +${def.rewardXp} XP (once).`);
    } else if (nth >= 2) {
      setPhase('over');
      setLog(def.tipOnLoss);
    }
  };

  if (!row?.unlocked) {
    return (
      <div className="rg-panel" style={{ opacity: 0.75 }}>
        <h4 style={{ margin: '0 0 0.35rem' }}>{def.title}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
          Locked — finish the listed story beat to draw them out.
        </p>
      </div>
    );
  }

  if (row.defeatedOnce) {
    return (
      <div
        className="rg-panel"
        style={{
          borderColor: 'var(--rg-green)',
          boxShadow: '0 0 12px var(--rg-green-dim)',
        }}
      >
        <h4 style={{ margin: '0 0 0.35rem' }}>{def.title}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
          {def.blurb}
        </p>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--rg-green)', fontSize: '0.9rem' }}>
          Defeated — raid payout already banked.
        </p>
      </div>
    );
  }

  return (
    <div className="rg-panel">
      <h4 style={{ margin: '0 0 0.35rem' }}>{def.title}</h4>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>{def.blurb}</p>
      <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
        Win <strong>{def.rewardScrap}</strong> scrap · <strong>{def.rewardXp}</strong> XP on first win
        only.
      </p>
      {log ? (
        <div className="rg-feedback info" style={{ marginTop: '0.65rem' }}>
          {log}
        </div>
      ) : null}
      <p style={{ margin: '0.5rem 0 0' }}>
        You {you} — {def.title} {them}
      </p>
      {phase === 'pick' ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
            marginTop: '0.65rem',
          }}
        >
          {(['strike', 'guard', 'overload'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className="rg-btn rg-btn-ghost"
              onClick={() => pick(t)}
            >
              {TACTIC_LABEL[t]}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="rg-btn rg-btn-primary" style={{ marginTop: '0.65rem' }} onClick={reset}>
          Spar again (no extra payout)
        </button>
      )}
    </div>
  );
}

export function WorldScreen() {
  const chapters = useGameStore((s) => s.chapters);
  const completeChapter = useGameStore((s) => s.completeChapter);
  const scrap = useGameStore((s) => s.scrap);
  const xp = useGameStore((s) => s.xp);
  const rankedWins = useGameStore((s) => s.rankedWins);
  const trophyClaimed = useGameStore((s) => s.trophyClaimed);
  const claimTrophy = useGameStore((s) => s.claimTrophy);
  const applyFactoryResult = useGameStore((s) => s.applyFactoryResult);
  const factoryFirstRewardClaimed = useGameStore((s) => s.factoryFirstRewardClaimed);
  const selectedRobotId = useGameStore((s) => s.selectedRobotId);
  const selectRobot = useGameStore((s) => s.selectRobot);
  const paintsOwned = useGameStore((s) => s.paintsOwned);
  const equippedPaintId = useGameStore((s) => s.equippedPaintId);
  const buyPaint = useGameStore((s) => s.buyPaint);
  const equipPaint = useGameStore((s) => s.equipPaint);
  const robotUnlockSnap = useGameStore((s) => ({ xp: s.xp, chapters: s.chapters }));

  const [chapterMsg, setChapterMsg] = useState<string | null>(null);
  const level = robotLevelFromXp(xp);

  const factoryOpen = chapters['night-haul']?.completedOnce ?? false;

  const clearedChapters = CHAPTER_ORDER.filter((id) => chapters[id]?.completedOnce).length;

  const handleFactorySuccess = () => {
    applyFactoryResult(true);
  };

  const tryChapter = (id: ChapterId) => {
    const before = useGameStore.getState().chapters[id]?.completedOnce;
    if (before) {
      setChapterMsg('This chapter is already logged complete.');
      return;
    }
    completeChapter(id);
    const after = useGameStore.getState().chapters[id]?.completedOnce;
    if (after) {
      const d = CHAPTER_DEFS[id];
      setChapterMsg(`${d.flavorWin} (+${d.rewardScrap} scrap · +${d.rewardXp} XP)`);
    } else {
      setChapterMsg('Cannot complete yet — finish the prior chapter first.');
    }
  };

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">World &amp; hangar</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)', fontSize: '0.95rem' }}>
          Story chapters unlock the wider yard. The factory line pays delivery bonuses. The circuit
          cup tracks pit wins from Training Battle. Hangar lets you swap chassis and paint jobs.
        </p>
      </section>

      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Story chapters
        </h3>
        <div className="rg-progress-bar" style={{ marginBottom: '0.65rem' }}>
          <span style={{ width: `${(clearedChapters / CHAPTER_ORDER.length) * 100}%` }} />
        </div>
        {chapterMsg ? <div className="rg-feedback success">{chapterMsg}</div> : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {CHAPTER_ORDER.map((id) => {
            const def = CHAPTER_DEFS[id];
            const ch = chapters[id];
            const locked = !ch?.unlocked;
            const done = ch?.completedOnce;
            return (
              <div
                key={id}
                className="rg-panel"
                style={{
                  padding: '0.85rem',
                  borderColor: done ? 'var(--rg-yellow)' : undefined,
                  boxShadow: done ? '0 0 14px rgba(240,193,75,0.2)' : undefined,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, flex: '1 1 160px' }}>{def.title}</h4>
                  {locked ? (
                    <span className="rg-badge rg-badge-locked">Locked</span>
                  ) : done ? (
                    <span className="rg-badge rg-badge-done">Complete</span>
                  ) : (
                    <span className="rg-badge" style={{ background: 'var(--rg-cyan-dim)', color: 'var(--rg-cyan)' }}>
                      Open
                    </span>
                  )}
                </div>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--rg-muted)' }}>
                  {def.objective}
                </p>
                <p style={{ fontSize: '0.8rem', margin: '0.35rem 0 0' }}>
                  Reward (first finish): <strong>{def.rewardScrap}</strong> scrap ·{' '}
                  <strong>{def.rewardXp}</strong> XP
                </p>
                <button
                  type="button"
                  className="rg-btn rg-btn-primary"
                  style={{ marginTop: '0.55rem' }}
                  disabled={locked || done}
                  onClick={() => tryChapter(id)}
                >
                  {done ? 'Chapter complete' : locked ? 'Locked' : 'Complete chapter'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Factory line
        </h3>
        {!factoryOpen ? (
          <p style={{ color: 'var(--rg-muted)', margin: 0 }}>
            Finish <strong>Night Haul</strong> to open the factory floor.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--rg-muted)', margin: '0 0 0.5rem' }}>
              {factoryFirstRewardClaimed
                ? 'First-batch bonus claimed — repeats pay a smaller stipend.'
                : `First successful batch this save: extra scrap & XP on top of the repeat rate.`}
            </p>
            <FactoryLineGame disabled={!factoryOpen} onSuccessRun={handleFactorySuccess} />
          </>
        )}
      </section>

      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Circuit cup (tournament)
        </h3>
        <p style={{ marginTop: 0, fontSize: '0.88rem', color: 'var(--rg-muted)' }}>
          Pit wins come from the <strong>Training Battle</strong> drill. Claim cups once each when you
          have enough wins — rewards are guarded.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          Pit wins: <strong>{rankedWins}</strong>
        </p>
        <div className="rg-grid-minigames" style={{ marginTop: '0.5rem' }}>
          {TROPHY_ORDER.map((id) => {
            const m = TROPHY_META[id];
            const eligible = rankedWins >= m.minRankedWins;
            const claimed = trophyClaimed[id];
            return (
              <div key={id} className="rg-panel" style={{ padding: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem' }}>{m.label}</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--rg-muted)' }}>{m.blurb}</p>
                <p style={{ fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
                  Need <strong>{m.minRankedWins}</strong> wins · Pays {m.rewardScrap} scrap /{' '}
                  {m.rewardXp} XP
                </p>
                <button
                  type="button"
                  className="rg-btn rg-btn-success"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  disabled={!eligible || claimed}
                  onClick={() => claimTrophy(id)}
                >
                  {claimed ? 'Cup claimed' : eligible ? 'Claim cup' : 'Not yet'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Boss raids
        </h3>
        <p style={{ marginTop: 0, fontSize: '0.88rem', color: 'var(--rg-muted)' }}>
          Triangle spar — strike beats overload, overload beats guard, guard beats strike. First to
          two winning exchanges wins the payout (once per boss).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {BOSS_ORDER.map((id) => (
            <BossFightCard key={id} bossId={id} />
          ))}
        </div>
      </section>

      <section className="rg-panel">
        <h3 className="rg-panel-title" style={{ fontSize: '1rem' }}>
          Hangar — robots &amp; paint
        </h3>
        <p style={{ marginTop: 0, fontSize: '0.88rem', color: 'var(--rg-muted)' }}>
          Pilot level {level}. Chassis unlock from story beats and levels. Paints cost scrap once,
          then equip any time.
        </p>
        <h4 style={{ color: 'var(--rg-cyan)', fontSize: '0.95rem', margin: '1rem 0 0.35rem' }}>
          Robots
        </h4>
        <div className="rg-grid-minigames">
          {ROBOT_ORDER.map((id) => {
            const d = ROBOT_DEFS[id];
            const ok = robotIsAvailable(id, robotUnlockSnap);
            const sel = selectedRobotId === id;
            return (
              <div
                key={id}
                className={`rg-minigame-card${sel ? ' selected' : ''}`}
                style={{ cursor: 'default' }}
              >
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{d.name}</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--rg-muted)' }}>{d.blurb}</p>
                {!ok ? (
                  <span className="rg-badge rg-badge-locked" style={{ marginTop: '0.45rem' }}>
                    Locked
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rg-btn rg-btn-primary"
                    style={{ marginTop: '0.55rem', width: '100%' }}
                    disabled={sel}
                    onClick={() => selectRobot(id)}
                  >
                    {sel ? 'Active chassis' : 'Select'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <h4 style={{ color: 'var(--rg-cyan)', fontSize: '0.95rem', margin: '1rem 0 0.35rem' }}>
          Paint booth
        </h4>
        <div className="rg-grid-minigames">
          {PAINT_ORDER.map((id: PaintId) => {
            const d = PAINT_DEFS[id];
            const owned = paintsOwned[id];
            const equipped = equippedPaintId === id;
            const canBuy = !owned && scrap >= d.scrapCost && d.scrapCost > 0;
            return (
              <div
                key={id}
                className={`rg-minigame-card${equipped ? ' selected' : ''}`}
                style={{ cursor: 'default' }}
              >
                <div
                  aria-hidden
                  style={{
                    height: 36,
                    borderRadius: 6,
                    marginBottom: '0.35rem',
                    border: `2px solid ${d.accent}`,
                    background: d.shellStyle,
                  }}
                />
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{d.label}</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--rg-muted)' }}>{d.blurb}</p>
                <p style={{ fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
                  {d.scrapCost <= 0 ? 'Included' : `${d.scrapCost} scrap`}
                </p>
                {!owned && d.scrapCost > 0 ? (
                  <button
                    type="button"
                    className="rg-btn rg-btn-primary"
                    style={{ marginTop: '0.45rem', width: '100%' }}
                    disabled={!canBuy}
                    onClick={() => buyPaint(id)}
                  >
                    Buy
                  </button>
                ) : null}
                {owned ? (
                  <button
                    type="button"
                    className="rg-btn rg-btn-success"
                    style={{ marginTop: '0.45rem', width: '100%' }}
                    disabled={equipped}
                    onClick={() => equipPaint(id)}
                  >
                    {equipped ? 'Equipped' : 'Equip'}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
