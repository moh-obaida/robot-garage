import { ACHIEVEMENTS } from '../data/achievements'
import { useGameStore } from '../store/useGameStore'

export function AchievementsStrip() {
  const unlocked = useGameStore((s) => new Set(s.achievementUnlocks))

  return (
    <div
      id="achievements"
      className="scroll-mt-24 rounded-2xl border border-amber-500/20 bg-slate-950/70 p-3"
    >
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-amber-200/80">
        Achievements
      </h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const ok = unlocked.has(a.id)
          return (
            <li
              key={a.id}
              className={`rounded-xl border px-2 py-2 text-xs ${
                ok
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-50'
                  : 'border-slate-800/80 bg-slate-900/30 text-slate-500'
              }`}
            >
              <p className="font-bold">{ok ? '★' : '○'} {a.title}</p>
              <p className="mt-0.5 text-[10px] opacity-80">{a.description}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
