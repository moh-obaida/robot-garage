import { Link } from 'react-router-dom'
import { nextUpgradeCost } from '../data/upgrades'
import { RobotFigure } from './RobotFigure'
import { selectCombatStats, useGameStore } from '../store/useGameStore'
import { ROUTES } from '../types/game'
import type { UpgradeId } from '../types/game'

export function GarageWorkbenchPanel({ focusPart }: { focusPart: UpgradeId }) {
  const robotName = useGameStore((s) => s.robotName)
  const paintColorId = useGameStore((s) => s.paintColorId)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const tryBuyUpgrade = useGameStore((s) => s.tryBuyUpgrade)
  const scrap = useGameStore((s) => s.scrap)

  const stats = selectCombatStats(upgradeLevels)
  const lv = upgradeLevels[focusPart] ?? 1
  const cost = nextUpgradeCost(focusPart, lv)
  const maxed = lv >= 5
  const canBuy = !maxed && cost != null && scrap >= cost

  const bars: { label: string; pct: number; color: string }[] = [
    { label: 'Power', pct: Math.min(100, stats.power * 4), color: 'from-amber-400 to-orange-500' },
    { label: 'Armor', pct: Math.min(100, stats.armor * 5), color: 'from-blue-400 to-cyan-500' },
    { label: 'Speed', pct: Math.min(100, stats.speed * 5), color: 'from-emerald-400 to-green-500' },
    { label: 'Energy', pct: Math.min(100, stats.energy * 2), color: 'from-violet-400 to-fuchsia-500' },
    { label: 'HP', pct: Math.min(100, stats.hp / 3), color: 'from-rose-400 to-red-500' },
  ]

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Garage
      </h3>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <RobotFigure colorId={paintColorId} size="sm" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
            {robotName}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Focus: {focusPart} · Lv {lv}
          </p>
          <div className="space-y-1.5">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="mb-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>{b.label}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${b.color}`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => tryBuyUpgrade(focusPart)}
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                canBuy
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(34,197,94,0.35)] hover:bg-emerald-400'
                  : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }`}
            >
              {maxed ? 'MAX LEVEL' : cost != null ? `Upgrade · ${cost} scrap` : '—'}
            </button>
            <Link
              to={ROUTES.upgrade}
              className="rounded-xl border border-cyan-500/40 px-4 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-500/10"
            >
              Workshop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
