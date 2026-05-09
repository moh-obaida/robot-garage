import { useState } from 'react'
import { Panel } from '../components/Panel'

const SHELVES = [
  { id: 'skin', name: 'Neon skins', desc: 'Glow trims & visor styles', icon: '✨' },
  { id: 'parts', name: 'Rare parts', desc: 'Limited chassis kits', icon: '🧩' },
  { id: 'badges', name: 'Badge packs', desc: 'Show off wins', icon: '🏅' },
  { id: 'boost', name: 'Scrap boosters', desc: 'Bonus earnings (soon)', icon: '⚡' },
]

export function Shop() {
  const [toast, setToast] = useState<string | null>(null)

  return (
    <Panel title="Shop" subtitle="Cosmetics & boosts — no real payments.">
      {toast ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          {toast}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {SHELVES.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 to-slate-950 p-4"
          >
            <div className="text-3xl">{s.icon}</div>
            <h3 className="mt-2 font-[family-name:var(--font-display)] font-bold text-slate-50">
              {s.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            <span className="mt-3 inline-block rounded-full bg-violet-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200">
              Coming soon
            </span>
            <button
              type="button"
              onClick={() => {
                setToast('Stocking the shelves — check back later!')
                window.setTimeout(() => setToast(null), 2200)
              }}
              className="mt-4 w-full rounded-xl border border-slate-600 py-2 text-xs font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-100"
            >
              Preview (Soon)
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}
