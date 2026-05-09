import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../types/game'

const NAV: { to: string; label: string }[] = [
  { to: ROUTES.play, label: 'Play' },
  { to: ROUTES.garage, label: 'Garage' },
  { to: ROUTES.missions, label: 'Missions' },
  { to: ROUTES.arena, label: 'PvP Arena' },
  { to: ROUTES.upgrade, label: 'Shop' },
  { to: ROUTES.colors, label: 'Colors' },
]

export function GameShell({
  scrap,
  arenaWins,
  arenaLosses,
  children,
  onReset,
}: {
  scrap: number
  arenaWins: number
  arenaLosses: number
  children: ReactNode
  onReset: () => void
}) {
  return (
    <div className="scanlines min-h-screen pb-16 pt-4">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/30 bg-slate-950/70 px-4 py-4 shadow-[0_0_60px_rgba(34,211,238,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400/90">
              Robot Garage
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-50 md:text-3xl">
              Tactical Mech Bay
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm">
              <span className="text-amber-200/80">Scrap</span>{' '}
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-amber-300">
                {scrap}
              </span>
            </div>
            <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200/90">
              Arena {arenaWins}W / {arenaLosses}L
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all progress? This clears saves on this device.')) {
                  onReset()
                }
              }}
              className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-900/50"
            >
              Reset
            </button>
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap gap-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.play}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)]'
                    : 'border border-slate-600/60 bg-slate-900/50 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  )
}
