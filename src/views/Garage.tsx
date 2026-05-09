import { useState } from 'react'
import { Panel } from '../components/Panel'
import { RobotFigure } from '../components/RobotFigure'
import { useGameStore } from '../store/useGameStore'
import { selectRobotStats } from '../store/useGameStore'

export function Garage() {
  const robotName = useGameStore((s) => s.robotName)
  const paintColorId = useGameStore((s) => s.paintColorId)
  const renameRobot = useGameStore((s) => s.renameRobot)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const [draft, setDraft] = useState(robotName)

  const stats = selectRobotStats(upgradeLevels)

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Panel
        title="Bay scene"
        subtitle="Ambient staging for your mech."
        className="lg:col-span-3"
      >
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black px-4 py-10">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cyan-500/15 to-transparent" />
            <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
          <div className="relative grid justify-items-center gap-6">
            <RobotFigure colorId={paintColorId} size="lg" />
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-700 px-3 py-1">Hydraulics nominal</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Reactor stable</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Paint: active</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Unit registry" subtitle="Name and vitals." className="lg:col-span-2">
        <div className="space-y-4">
          <label className="block text-sm text-slate-400">
            Callsign
            <div className="mt-1 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                maxLength={24}
              />
              <button
                type="button"
                onClick={() => renameRobot(draft)}
                className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400"
              >
                Save
              </button>
            </div>
          </label>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-500">Integrity</dt>
              <dd className="font-[family-name:var(--font-display)] text-lg text-cyan-200">{stats.maxHp}</dd>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-500">Output</dt>
              <dd className="font-[family-name:var(--font-display)] text-lg text-cyan-200">{stats.attack}</dd>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-500">Plating</dt>
              <dd className="font-[family-name:var(--font-display)] text-lg text-cyan-200">{stats.defense}</dd>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-500">Response</dt>
              <dd className="font-[family-name:var(--font-display)] text-lg text-cyan-200">{stats.speed}</dd>
            </div>
          </dl>
        </div>
      </Panel>
    </div>
  )
}
