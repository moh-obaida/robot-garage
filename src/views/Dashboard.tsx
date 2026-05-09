import { MISSIONS } from '../data/missions'
import { Panel } from '../components/Panel'
import { RobotFigure } from '../components/RobotFigure'
import { selectRobotStats, useGameStore } from '../store/useGameStore'
import type { ViewId } from '../types/game'

export function Dashboard({ onGo }: { onGo: (v: ViewId) => void }) {
  const robotName = useGameStore((s) => s.robotName)
  const paintColorId = useGameStore((s) => s.paintColorId)
  const completed = useGameStore((s) => s.completedMissions)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const stats = selectRobotStats(upgradeLevels)

  const missionPct = Math.round((completed.length / MISSIONS.length) * 100)

  const tiles: { title: string; desc: string; view: ViewId; accent: string }[] = [
    {
      title: 'Garage',
      desc: 'Inspect your unit and bay atmosphere.',
      view: 'garage',
      accent: 'from-cyan-500/20 to-transparent',
    },
    {
      title: 'Upgrades',
      desc: 'Spend scrap on chassis, weapons, and gyros.',
      view: 'upgrades',
      accent: 'from-fuchsia-500/20 to-transparent',
    },
    {
      title: 'Missions',
      desc: 'Deploy for payouts and exclusive finishes.',
      view: 'missions',
      accent: 'from-amber-500/20 to-transparent',
    },
    {
      title: 'Arena',
      desc: 'Turn-based duels vs ranked opponents.',
      view: 'arena',
      accent: 'from-emerald-500/20 to-transparent',
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel
        title="Unit overview"
        subtitle="Live telemetry from your bay."
        className="lg:col-span-2"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <RobotFigure colorId={paintColorId} size="md" />
          <div className="flex-1 space-y-3">
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-50">
              {robotName}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="HP" value={stats.maxHp} />
              <Stat label="ATK" value={stats.attack} />
              <Stat label="DEF" value={stats.defense} />
              <Stat label="SPD" value={stats.speed} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Campaign progress</span>
                <span>
                  {completed.length}/{MISSIONS.length} ops
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all"
                  style={{ width: `${missionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Quick deploy" subtitle="Jump to a station.">
        <ul className="space-y-3">
          {tiles.map((t) => (
            <li key={t.view}>
              <button
                type="button"
                onClick={() => onGo(t.view)}
                className={`group flex w-full items-start gap-3 rounded-xl border border-slate-700/80 bg-gradient-to-r ${t.accent} p-4 text-left transition hover:border-cyan-500/50`}
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                <span>
                  <span className="block font-semibold text-slate-100 group-hover:text-cyan-100">
                    {t.title}
                  </span>
                  <span className="text-sm text-slate-400">{t.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-[family-name:var(--font-display)] text-lg font-bold text-cyan-200">{value}</p>
    </div>
  )
}
