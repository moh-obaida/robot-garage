import { useState } from 'react'
import { Panel } from '../components/Panel'
import { ScrapRunDodge } from '../minigames/ScrapRunDodge'

export function Vehicles() {
  const [mode, setMode] = useState<'menu' | 'play'>('menu')
  const [last, setLast] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Panel title="Garage vehicles" subtitle="Micro-runs — more rides coming soon.">
        {last ? (
          <p className="mb-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-sm text-cyan-100">
            {last}
          </p>
        ) : null}
        {mode === 'menu' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setLast(null)
                setMode('play')
              }}
              className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/30 p-4 text-left transition hover:border-amber-400"
            >
              <p className="text-2xl">🏎</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] font-bold text-white">
                Scrap Run Dodge
              </h3>
              <p className="mt-1 text-sm text-slate-400">Side-step junk falling in the lane.</p>
            </button>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 opacity-60">
              <p className="text-2xl">🚚</p>
              <h3 className="mt-2 font-bold text-slate-300">Battery Haul</h3>
              <p className="mt-1 text-sm text-slate-500">Coming soon</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrapRunDodge
              onFinish={({ score, survived }) => {
                setMode('menu')
                setLast(
                  survived
                    ? `Cleared the run! Score ${score}.`
                    : `Bumped! Score ${score}. Try again.`,
                )
              }}
            />
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="w-full rounded-xl border border-slate-600 py-2 text-sm font-bold text-slate-300"
            >
              Back
            </button>
          </div>
        )}
      </Panel>
    </div>
  )
}
