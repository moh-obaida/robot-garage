import { useGameStore } from '../store/useGameStore'
import { levelFromTotalXp } from '../utils/progression'

const ROWS = [
  { id: 'inv', name: 'Alex Rook', role: 'Inventor', unlocked: true },
  { id: 'bolt', name: 'Bolt-X', role: 'Your bot', unlocked: true },
  { id: 'zip', name: 'Zip-Z', role: 'Speed frame', unlocked: false, needLv: 2 },
  { id: 'shade', name: 'Shade-V', role: 'Rival AI', unlocked: false, needLv: 4 },
]

export function CharactersPanel() {
  const xp = useGameStore((s) => s.xp)
  const lv = levelFromTotalXp(xp)

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3 shadow-inner">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Characters
      </h3>
      <ul className="mt-2 space-y-2">
        {ROWS.map((r) => {
          const ok = r.unlocked || (r.needLv != null && lv >= r.needLv)
          return (
            <li
              key={r.id}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${
                ok ? 'border-slate-600/60 bg-slate-900/50' : 'border-slate-800/80 opacity-60'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  ok ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {ok ? '◆' : '🔒'}
              </span>
              <div>
                <p className="font-bold text-slate-100">{r.name}</p>
                <p className="text-[10px] text-slate-500">{r.role}</p>
                {!ok && r.needLv ? (
                  <p className="text-[10px] text-amber-200/80">Lv {r.needLv}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
