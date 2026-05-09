import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PERSIST_STORE_VERSION } from '../config/persistVersion'
import { ROUTES } from '../types/game'
import { GameLogo } from './GameLogo'
import { SidebarMenu } from './SidebarMenu'

export function GameShell({
  scrap,
  level,
  xpPct,
  xpLabel,
  trophies,
  pvpRank,
  arenaWins,
  arenaLosses,
  achievementCount,
  achievementTotal,
  levelUpToast,
  onDismissToast,
  children,
  onReset,
}: {
  scrap: number
  level: number
  xpPct: number
  xpLabel: string
  trophies: number
  pvpRank: string
  arenaWins: number
  arenaLosses: number
  achievementCount: number
  achievementTotal: number
  levelUpToast: string | null
  onDismissToast: () => void
  children: ReactNode
  onReset: () => void
}) {
  useEffect(() => {
    if (!levelUpToast) return
    const t = window.setTimeout(() => onDismissToast(), 3200)
    return () => window.clearTimeout(t)
  }, [levelUpToast, onDismissToast])

  return (
    <div className="scanlines min-h-screen bg-[#050810]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="shrink-0 border-slate-800/90 bg-slate-950/90 p-4 md:w-56 md:border-r md:pt-6">
          <GameLogo />
          <SidebarMenu />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-cyan-500/20 bg-slate-950/80 px-3 py-3 shadow-[0_0_40px_rgba(34,211,238,0.08)] md:px-5">
            {levelUpToast ? (
              <div className="mb-3 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-center text-sm font-bold text-amber-100">
                {levelUpToast}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-[family-name:var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
                  Robot Garage
                </p>
                <p className="text-sm text-slate-400">Build. Battle. Keep the garage humming.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <StatPill label="Scrap" value={scrap} tone="amber" />
                <StatPill label="Lv" value={level} tone="cyan" />
                <div className="min-w-[120px] rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">XP</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">{xpLabel}</p>
                </div>
                <StatPill label="Trophies" value={trophies} tone="violet" />
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-[10px] text-emerald-200/95">
                  <span className="font-bold text-emerald-400">Rank</span> {pvpRank}
                </div>
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-3 py-1.5 text-[10px] text-slate-400">
                  Arena {arenaWins}W / {arenaLosses}L
                </div>
                <Link
                  to={ROUTES.play}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-200 hover:bg-amber-500/20"
                  title="Achievements on home"
                >
                  ★ {achievementCount}/{achievementTotal}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all progress? This clears saves on this device.')) {
                      onReset()
                    }
                  }}
                  className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200 hover:bg-rose-900/50"
                >
                  Reset
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden p-3 md:p-5">{children}</main>
          <footer className="border-t border-slate-800/70 px-3 py-2 text-center text-[10px] text-slate-600 md:px-5">
            Save schema v{PERSIST_STORE_VERSION} · browser local storage ·{' '}
            {import.meta.env.PROD ? 'production' : 'development'}
          </footer>
        </div>
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'amber' | 'cyan' | 'violet'
}) {
  const ring =
    tone === 'amber'
      ? 'border-amber-400/35 bg-amber-500/10 text-amber-200'
      : tone === 'cyan'
        ? 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
        : 'border-violet-400/35 bg-violet-500/10 text-violet-100'
  return (
    <div className={`rounded-xl border px-3 py-1.5 text-xs ${ring}`}>
      <span className="text-[10px] opacity-80">{label}</span>{' '}
      <span className="font-[family-name:var(--font-display)] text-base font-bold">{value}</span>
    </div>
  )
}
