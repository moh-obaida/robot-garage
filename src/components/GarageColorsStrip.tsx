import { COLORS } from '../data/colors'
import { useGameStore } from '../store/useGameStore'

export function GarageColorsStrip() {
  const unlocked = useGameStore((s) => s.unlockedColors)
  const paint = useGameStore((s) => s.paintColorId)
  const equip = useGameStore((s) => s.equipColor)

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Colors
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {COLORS.map((c) => {
          const has = unlocked.includes(c.id)
          const on = paint === c.id
          return (
            <button
              key={c.id}
              type="button"
              title={c.name}
              disabled={!has || c.comingSoon}
              onClick={() => equip(c.id)}
              className={`relative h-10 w-10 rounded-full border-2 transition ${
                on
                  ? 'border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.45)]'
                  : 'border-slate-700 hover:border-cyan-500/50'
              } ${!has || c.comingSoon ? 'opacity-40' : ''}`}
              style={{ backgroundColor: c.hex }}
            >
              {!has || c.comingSoon ? (
                <span className="absolute inset-0 flex items-center justify-center text-xs">🔒</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
