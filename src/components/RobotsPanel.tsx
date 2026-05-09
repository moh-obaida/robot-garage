import { useGameStore } from '../store/useGameStore'
import { levelFromTotalXp } from '../utils/progression'

const BOTS = [
  { id: 'bolt-x', name: 'Bolt-X', type: 'Starter', color: '#3b82f6', needLv: 1 },
  { id: 'ember-9', name: 'Ember-9', type: 'Attack', color: '#ef4444', needLv: 2 },
  { id: 'zip-z', name: 'Zip-Z', type: 'Speed', color: '#eab308', needLv: 3 },
  { id: 'shade-v', name: 'Shade-V', type: 'Rival', color: '#a855f7', needLv: 5 },
]

export function RobotsPanel() {
  const xp = useGameStore((s) => s.xp)
  const selected = useGameStore((s) => s.selectedRobotId)
  const selectRobot = useGameStore((s) => s.selectRobot)
  const lv = levelFromTotalXp(xp)

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3 shadow-inner">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Robots
      </h3>
      <ul className="mt-2 space-y-2">
        {BOTS.map((b) => {
          const ok = lv >= b.needLv
          const active = selected === b.id
          return (
            <li key={b.id}>
              <button
                type="button"
                disabled={!ok}
                onClick={() => ok && selectRobot(b.id)}
                className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                  active && ok
                    ? 'border-cyan-500/60 bg-cyan-500/10'
                    : ok
                      ? 'border-slate-600/60 bg-slate-900/50 hover:border-cyan-500/40'
                      : 'cursor-not-allowed border-slate-800/80 opacity-55'
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10"
                  style={{ backgroundColor: ok ? `${b.color}33` : '#1e293b' }}
                >
                  <span className="text-lg" style={{ color: ok ? b.color : '#64748b' }}>
                    🤖
                  </span>
                </span>
                <div>
                  <p className="font-bold text-slate-100">{b.name}</p>
                  <p className="text-[10px] text-slate-500">{b.type}</p>
                  {!ok ? <p className="text-[10px] text-amber-200/80">Lv {b.needLv}</p> : null}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
