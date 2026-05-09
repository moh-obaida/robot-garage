import { useState } from 'react'
import { MISSIONS } from '../data/missions'
import { Panel } from '../components/Panel'
import { useGameStore } from '../store/useGameStore'

function missionAvailable(completed: string[], missionId: string): boolean {
  const m = MISSIONS.find((x) => x.id === missionId)
  if (!m) return false
  return m.requires.every((r) => completed.includes(r))
}

export function Missions() {
  const completed = useGameStore((s) => s.completedMissions)
  const tryComplete = useGameStore((s) => s.tryCompleteMission)
  const [msg, setMsg] = useState<string | null>(null)

  const run = (id: string) => {
    const r = tryComplete(id)
    setMsg(
      r.ok
        ? 'Mission complete. Rewards transferred.'
        : r.message ?? 'Unable to deploy.',
    )
    window.setTimeout(() => setMsg(null), 2800)
  }

  return (
    <Panel title="Operations board" subtitle="One-time contracts. Plan your route.">
      {msg ? (
        <p className="mb-4 rounded-lg border border-fuchsia-500/35 bg-fuchsia-950/30 px-3 py-2 text-sm text-fuchsia-100">
          {msg}
        </p>
      ) : null}
      <ul className="space-y-3">
        {MISSIONS.map((m) => {
          const done = completed.includes(m.id)
          const avail = missionAvailable(completed, m.id)
          return (
            <li
              key={m.id}
              className={`rounded-xl border p-4 ${
                done
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : avail
                    ? 'border-cyan-500/35 bg-slate-950/50'
                    : 'border-slate-800 bg-slate-950/30 opacity-70'
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-50">
                    {m.name}
                    {done ? (
                      <span className="ml-2 text-sm font-normal text-emerald-400">— Cleared</span>
                    ) : null}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">{m.description}</p>
                  <p className="mt-2 text-xs text-amber-200/90">
                    Payout: {m.rewardScrap} scrap
                    {m.unlockColorId ? (
                      <span className="text-fuchsia-300">
                        {' '}
                        · Unlocks finish: {m.unlockColorId}
                      </span>
                    ) : null}
                  </p>
                  {!avail && !done ? (
                    <p className="mt-1 text-xs text-slate-500">Locked — complete prior ops.</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={done || !avail}
                  onClick={() => run(m.id)}
                  className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold ${
                    done
                      ? 'cursor-default bg-slate-800 text-slate-500'
                      : avail
                        ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        : 'cursor-not-allowed bg-slate-800 text-slate-600'
                  }`}
                >
                  {done ? 'Complete' : avail ? 'Deploy' : 'Locked'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
