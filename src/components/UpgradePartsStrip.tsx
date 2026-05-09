import { UPGRADE_META } from '../data/upgrades'
import type { UpgradeId } from '../types/game'

const ORDER: UpgradeId[] = ['head', 'arms', 'body', 'legs', 'weapon', 'core']

const ICON: Record<UpgradeId, string> = {
  head: '◉',
  arms: '⌇',
  body: '▣',
  legs: '⫿',
  weapon: '⚡',
  core: '◈',
}

export function UpgradePartsStrip({
  selected,
  onSelect,
  levels,
}: {
  selected: UpgradeId
  onSelect: (id: UpgradeId) => void
  levels: Record<UpgradeId, number>
}) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Upgrade parts
      </h3>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ORDER.map((id) => {
          const meta = UPGRADE_META[id]
          const lv = levels[id] ?? 1
          const on = id === selected
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`rounded-xl border px-1 py-2 text-center transition ${
                on
                  ? 'border-cyan-500/70 bg-cyan-500/15 shadow-[0_0_14px_rgba(34,211,238,0.2)]'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-cyan-500/35'
              }`}
            >
              <span className="text-lg text-cyan-200">{ICON[id]}</span>
              <p className="mt-0.5 text-[9px] font-bold text-slate-300">{meta.short}</p>
              <p className="text-[9px] text-amber-200/90">Lv {lv}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
