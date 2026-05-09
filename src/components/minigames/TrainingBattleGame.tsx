import { useCallback, useRef, useState } from 'react';
import { RIVAL_META, RIVAL_ORDER, type RivalId } from '../../data/rivals';
import { TROPHY_META, TROPHY_ORDER, type TrophyId } from '../../data/pvpTrophies';
import { initialPlayerHp, resolveRound, type BattleMove } from '../../logic/battleEngine';
import { pickRivalMove } from '../../logic/rivalAi';
import { useGameStore, type MinigameResultInput } from '../../store/gameStore';

const MAX_ENERGY = 3;

type Phase = 'briefing' | 'combat';

export function TrainingBattleGame({ onFinish }: { onFinish: (r: MinigameResultInput) => void }) {
  const extrasUnlocked = useGameStore((s) => s.minigames['training-battle'].completedOnce);
  const rankedWins = useGameStore((s) => s.rankedWins);
  const trophyClaimed = useGameStore((s) => s.trophyClaimed);
  const claimTrophy = useGameStore((s) => s.claimTrophy);

  const [phase, setPhase] = useState<Phase>('briefing');
  const [rivalId, setRivalId] = useState<RivalId>('sparky');
  const [playerHp, setPlayerHp] = useState(6);
  const [rivalHp, setRivalHp] = useState(5);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [lastPlayerMove, setLastPlayerMove] = useState<BattleMove | null>(null);
  const [sipUsed, setSipUsed] = useState(false);
  const [ampPrimed, setAmpPrimed] = useState(false);
  const [ampUsed, setAmpUsed] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const exchangeRef = useRef(0);
  const finishedRef = useRef(false);

  const rival = RIVAL_META[rivalId];

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const resetCombat = useCallback(() => {
    const r = RIVAL_META[rivalId];
    finishedRef.current = false;
    exchangeRef.current = 0;
    setPlayerHp(initialPlayerHp(r));
    setRivalHp(r.hp);
    setEnergy(MAX_ENERGY);
    setLastPlayerMove(null);
    setSipUsed(false);
    setAmpPrimed(false);
    setAmpUsed(false);
    setLog([]);
  }, [rivalId]);

  const enterCombat = () => {
    resetCombat();
    setPhase('combat');
  };

  const appendLog = (lines: string[]) => {
    setLog((prev) => [...lines, ...prev].slice(0, 8));
  };

  const commitMove = (move: BattleMove) => {
    if (phase !== 'combat' || finishedRef.current) return;
    if (energy < 1) return;

    const spendAmp = ampPrimed && !ampUsed;
    const rivalMove = pickRivalMove(rivalId, lastPlayerMove);
    const res = resolveRound(move, rivalMove, { playerAmp: spendAmp });

    const regen = exchangeRef.current > 0;
    exchangeRef.current += 1;
    const afterRegen = regen ? Math.min(MAX_ENERGY, energy + 1) : energy;
    const nextEnergy = afterRegen - 1;
    const pHp = Math.max(0, playerHp - res.playerDamage);
    const rHp = Math.max(0, rivalHp - res.rivalDamage);

    if (spendAmp) {
      setAmpUsed(true);
      setAmpPrimed(false);
    }

    setEnergy(nextEnergy);
    setPlayerHp(pHp);
    setRivalHp(rHp);
    setLastPlayerMove(move);

    appendLog([
      `You: ${move} · Rival: ${rivalMove}`,
      res.summary,
      `${res.playerFlavor} ${res.rivalFlavor}`,
    ]);

    if (rHp <= 0 && pHp <= 0) {
      safeFinish({ won: false });
      return;
    }
    if (rHp <= 0) {
      const score =
        pHp * 22 + nextEnergy * 3 + rival.scoreBonus + (extrasUnlocked ? 15 : 0);
      safeFinish({ won: true, scoreIfWin: Math.round(score) });
      return;
    }
    if (pHp <= 0) {
      safeFinish({ won: false });
    }
  };

  const sip = () => {
    if (phase !== 'combat' || finishedRef.current || sipUsed) return;
    setSipUsed(true);
    setEnergy((e) => Math.min(MAX_ENERGY, e + 1));
    appendLog(['You sip spare battery — +1 energy.']);
  };

  const toggleAmp = () => {
    if (!extrasUnlocked || phase !== 'combat' || finishedRef.current || ampUsed) return;
    setAmpPrimed((p) => !p);
  };

  const trophyStatus = (id: TrophyId) => {
    const m = TROPHY_META[id];
    if (trophyClaimed[id]) return 'claimed' as const;
    if (rankedWins < m.minRankedWins) return 'locked' as const;
    return 'claimable' as const;
  };

  return (
    <div className="rg-pvp-screen">
      <p className="rg-minigame-help" style={{ marginTop: 0 }}>
        Strike beats Overload. Overload beats Guard. Guard beats Strike. Each move spends 1 energy;
        after your first exchange you regain 1 before each swing. Win ranked scraps to climb
        trophies.
      </p>
      <div className="rg-triangle-codex rg-triangle-codex--compact" aria-hidden>
        <span className="rg-tri n1">Strike</span>
        <span className="rg-tri n2">Overload</span>
        <span className="rg-tri n3">Guard</span>
      </div>

      {phase === 'briefing' && (
        <>
          <section className="rg-pvp-section">
            <h3 className="rg-pvp-h3">Pick a rival</h3>
            <div className="rg-rival-grid">
              {RIVAL_ORDER.map((id) => {
                const r = RIVAL_META[id];
                const tierLabel =
                  r.tier === 'easy' ? 'Easy' : r.tier === 'standard' ? 'Standard' : 'Challenge';
                return (
                  <button
                    key={id}
                    type="button"
                    className={`rg-rival-card${rivalId === id ? ' selected' : ''}`}
                    onClick={() => setRivalId(id)}
                  >
                    <strong>{r.name}</strong>
                    <span className="rg-rival-tier">{tierLabel}</span>
                    <span className="rg-rival-blurb">{r.blurb}</span>
                    <span className="rg-rival-stat">Rival HP: {r.hp}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rg-pvp-section">
            <h3 className="rg-pvp-h3">Trophy rack</h3>
            <p className="rg-trophy-sub">
              Pit wins: <strong>{rankedWins}</strong>. Claim each cup once — payouts are guarded.
            </p>
            <div className="rg-trophy-grid">
              {TROPHY_ORDER.map((id) => {
                const m = TROPHY_META[id];
                const st = trophyStatus(id);
                return (
                  <div key={id} className={`rg-trophy-card ${st}`}>
                    <div>
                      <strong>{m.label}</strong>
                      <p>{m.blurb}</p>
                      <small>
                        Needs {m.minRankedWins} win{m.minRankedWins === 1 ? '' : 's'} · +{m.rewardScrap}{' '}
                        scrap · +{m.rewardXp} XP
                      </small>
                    </div>
                    {st === 'claimable' ? (
                      <button
                        type="button"
                        className="rg-btn rg-btn-success"
                        onClick={() => claimTrophy(id)}
                      >
                        Claim
                      </button>
                    ) : st === 'claimed' ? (
                      <span className="rg-badge rg-badge-done">Claimed</span>
                    ) : (
                      <span className="rg-badge rg-badge-locked">Locked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <button type="button" className="rg-btn rg-btn-primary" onClick={enterCombat}>
            Enter the pit
          </button>
        </>
      )}

      {phase === 'combat' && (
        <>
          <div className="rg-battle-bars">
            <div>
              <span>You</span>
              <div className="rg-progress-bar">
                <span style={{ width: `${(playerHp / 6) * 100}%` }} />
              </div>
              <small>
                {playerHp} HP · Energy {energy}/{MAX_ENERGY}
              </small>
            </div>
            <div>
              <span>{rival.name}</span>
              <div className="rg-progress-bar rg-rival-bar">
                <span style={{ width: `${(rivalHp / rival.hp) * 100}%` }} />
              </div>
              <small>
                {rivalHp} HP · {rival.tier === 'easy' ? 'Spar bot' : 'Ranked loadout'}
              </small>
            </div>
          </div>

          {extrasUnlocked && (
            <div className="rg-ability-row">
              <button
                type="button"
                className="rg-btn rg-btn-ghost"
                disabled={sipUsed}
                onClick={sip}
              >
                Battery sip (+1 energy, once)
              </button>
              <button
                type="button"
                className={`rg-btn rg-btn-ghost${ampPrimed ? ' rg-amp-on' : ''}`}
                disabled={ampUsed}
                onClick={toggleAmp}
              >
                {ampUsed
                  ? 'Amp spent'
                  : ampPrimed
                    ? 'Amp primed — next triangle hit +1'
                    : 'Prime kinetic amp'}
              </button>
            </div>
          )}
          {!extrasUnlocked && (
            <p className="rg-feedback info">
              Win the pit once to unlock battery sip and kinetic amp on later runs.
            </p>
          )}

          <div className="rg-move-grid">
            {(['strike', 'guard', 'overload'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="rg-btn rg-btn-primary rg-move-btn"
                disabled={energy < 1 || finishedRef.current}
                onClick={() => commitMove(m)}
              >
                {m === 'strike' ? 'Strike' : m === 'guard' ? 'Guard' : 'Overload'}
              </button>
            ))}
          </div>

          <ul className="rg-battle-log">
            {log.map((line, i) => (
              <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
            ))}
          </ul>

          <button
            type="button"
            className="rg-btn rg-btn-ghost"
            onClick={() => {
              setPhase('briefing');
              resetCombat();
            }}
          >
            Back to briefing
          </button>
        </>
      )}
    </div>
  );
}
