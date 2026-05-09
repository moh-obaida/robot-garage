import { useState } from 'react'
import { Panel } from '../components/Panel'
import { CircuitSnake } from '../minigames/CircuitSnake'

export function Arcade() {
  const [mode, setMode] = useState<'menu' | 'snake'>('menu')
  const [last, setLast] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Panel title="Arcade cabinet" subtitle="Classic modes with a garage twist.">
        {last ? (
          <p className="mb-3 rounded-lg border border-violet-500/30 bg-violet-950/20 px-3 py-2 text-sm text-violet-100">
            {last}
          </p>
        ) : null}
        {mode === 'menu' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setLast(null)
                setMode('snake')
              }}
              className="rounded-2xl border border-violet-500/40 bg-gradient-to-br from-slate-900 to-violet-950/30 p-4 text-left hover:border-violet-400"
            >
              <p className="text-2xl">🐍</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] font-bold text-white">
                Circuit Snake
              </h3>
              <p className="mt-1 text-sm text-slate-400">Grab cells, don&apos;t bite yourself.</p>
            </button>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 opacity-60">
              <p className="text-2xl">🧱</p>
              <h3 className="mt-2 font-bold text-slate-300">Block Breaker Bot</h3>
              <p className="mt-1 text-sm text-slate-500">Coming soon</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CircuitSnake
              onFinish={({ score, ate }) => {
                setMode('menu')
                setLast(`Run over — ${ate} cells · ${score} pts.`)
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
