import { useState } from 'react';
import { GARAGE_UPGRADE_ORDER, GARAGE_UPGRADES } from '../data/garageUpgrades';
import { UNLOCK_NODE_ORDER, UNLOCK_NODES, unlockPrerequisite } from '../data/unlockTree';
import { robotLevelFromXp } from '../store/gameTypes';
import { useGameStore } from '../store/gameStore';

export function WorkshopScreen() {
  const scrap = useGameStore((s) => s.scrap);
  const xp = useGameStore((s) => s.xp);
  const garageUpgrades = useGameStore((s) => s.garageUpgrades);
  const unlockNodes = useGameStore((s) => s.unlockNodes);
  const purchaseGarageUpgrade = useGameStore((s) => s.purchaseGarageUpgrade);
  const activateUnlockNode = useGameStore((s) => s.activateUnlockNode);

  const level = robotLevelFromXp(xp);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <section className="rg-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="rg-panel-title">Workshop</h2>
        <p style={{ marginTop: 0, color: 'var(--rg-muted)' }}>
          Spend scrap on garage tracks for bigger drill payouts. The unlock tree pays a
          one-time calibration bonus when you bring a node online.
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          Scrap: <strong>{scrap}</strong> · Robot level: <strong>{level}</strong>
        </p>
      </section>

      {msg ? (
        <div className="rg-feedback info" style={{ marginBottom: '1rem' }}>
          {msg}
        </div>
      ) : null}

      <h3 style={{ color: 'var(--rg-cyan)', fontSize: '1rem' }}>Garage upgrades</h3>
      <div className="rg-grid-minigames" style={{ marginTop: '0.5rem' }}>
        {GARAGE_UPGRADE_ORDER.map((id) => {
          const def = GARAGE_UPGRADES[id];
          const lv = garageUpgrades[id] ?? 0;
          const maxed = lv >= def.maxLevel;
          const cost = def.costForLevel(lv);
          const needLv = def.minRobotLevelForNext(lv);
          const can = !maxed && scrap >= cost && level >= needLv;
          const pct = (lv / def.maxLevel) * 100;
          return (
            <div key={id} className="rg-panel" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{def.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
                {def.blurb}
              </p>
              <div className="rg-progress-bar" style={{ marginTop: '0.65rem' }}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)' }}>
                Level {lv} / {def.maxLevel}
                {!maxed ? ` · Next ${cost} scrap · Need pilot ${needLv}` : ' · Maxed'}
              </p>
              <button
                type="button"
                className="rg-btn rg-btn-primary"
                style={{ marginTop: '0.5rem', width: '100%' }}
                disabled={!can}
                onClick={() => {
                  const before = garageUpgrades[id] ?? 0;
                  purchaseGarageUpgrade(id);
                  const after = useGameStore.getState().garageUpgrades[id] ?? 0;
                  if (after > before) {
                    setMsg(`${def.title} upgraded — payouts are a little richer.`);
                  } else {
                    setMsg('Could not upgrade — check scrap and pilot level.');
                  }
                }}
              >
                {maxed ? 'Maxed' : `Upgrade (${cost} scrap)`}
              </button>
              {!can && !maxed && scrap < cost ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--rg-red)', margin: '0.35rem 0 0' }}>
                  Not enough scrap.
                </p>
              ) : null}
              {!can && !maxed && scrap >= cost && level < needLv ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--rg-red)', margin: '0.35rem 0 0' }}>
                  Reach pilot level {needLv} first.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <h3 style={{ color: 'var(--rg-cyan)', fontSize: '1rem', marginTop: '1.5rem' }}>
        Unlock tree
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {UNLOCK_NODE_ORDER.map((id) => {
          const def = UNLOCK_NODES[id];
          const row = unlockNodes[id];
          const prev = unlockPrerequisite(id);
          const prevOk = !prev || unlockNodes[prev]?.activated;
          const done = row?.activated;
          const can =
            !done && prevOk && scrap >= def.scrapCost && level >= def.minRobotLevel;
          return (
            <div
              key={id}
              className="rg-panel"
              style={{
                padding: '1rem',
                opacity: done ? 0.85 : 1,
                borderColor: done ? 'var(--rg-green)' : undefined,
                boxShadow: done ? '0 0 14px var(--rg-green-dim)' : undefined,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <h4 style={{ margin: 0, flex: '1 1 140px', fontSize: '1rem' }}>{def.title}</h4>
                {done ? (
                  <span className="rg-badge rg-badge-done">Online</span>
                ) : (
                  <span className="rg-badge rg-badge-locked">Offline</span>
                )}
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--rg-muted)' }}>
                {def.blurb}
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                Cost {def.scrapCost} scrap · Pilot {def.minRobotLevel}+ · Bonus +{def.firstRewardScrap}{' '}
                scrap / +{def.firstRewardXp} XP on bring-up
              </p>
              {!prevOk && !done ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--rg-red)' }}>
                  Activate the previous node first.
                </p>
              ) : null}
              <button
                type="button"
                className="rg-btn rg-btn-success"
                style={{ marginTop: '0.5rem' }}
                disabled={done || !can}
                onClick={() => {
                  const was = unlockNodes[id]?.activated;
                  activateUnlockNode(id);
                  const now = useGameStore.getState().unlockNodes[id]?.activated;
                  if (!was && now) {
                    setMsg(`${def.title} is online — calibration bonus credited.`);
                  } else {
                    setMsg('Could not bring online — check prerequisites, scrap, and level.');
                  }
                }}
              >
                {done ? 'Active' : `Bring online (${def.scrapCost} scrap)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
