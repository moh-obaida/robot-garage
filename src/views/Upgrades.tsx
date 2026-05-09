import { useState } from 'react'
import { UPGRADE_META, upgradePrice } from '../data/upgrades'
import type { UpgradeId } from '../types/game'
import { Panel } from '../components/Panel'
import { useGameStore } from '../store/useGameStore'

export function Upgrades() {
  const scrap = useGameStore((s) => s.scrap)
  const levels = useGameStore((s) => s.upgradeLevels)
  const tryBuy = useGameStore((s) => s.tryBuyUpgrade)
  const [msg, setMsg] = useState<string | null>(null)

  const onBuy = (id: UpgradeId) => {
    const ok = tryBuy(id)
    setMsg(ok ? 'Upgrade installed.' : 'Not enough scrap.')
    window.setTimeout(() => setMsg(null), 2200)
  }

  return (
    <Panel title="Workshop" subtitle="Permanent stat boosts. Costs scale per level.">
      {msg ? (
        <p className="mb-4 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 text-sm text-cyan-100">
          {msg}
        </p>
      ) : null}
      <ul className="grid gap-4 md:grid-cols-2">
        {(Object.keys(UPGRADE_META) as UpgradeId[]).map((id) => {
          const meta = UPGRADE_META[id]
          const lv = levels[id] ?? 0
          const cost = upgradePrice(id, lv)
          const affordable = scrap >= cost
          return (
            <li
              key={id}
              className="flex flex-col rounded-xl border border-slate-700/80 bg-slate-950/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-slate-100">
                    {meta.label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{meta.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-cyan-300">
                  Lv.{lv}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-sm text-amber-200/90">
                  <span className="text-slate-500">Next: </span>
                  {cost} scrap
                </span>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => onBuy(id)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold ${
                    affordable
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'cursor-not-allowed bg-slate-800 text-slate-500'
                  }`}
                >
                  Install
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
