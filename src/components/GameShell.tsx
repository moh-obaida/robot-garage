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
  // arenaWins,
  // arenaLosses,
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
    <div className="scanlines min-h-screen bg-[#050810] text-slate-200">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="z-20 shrink-0 border-slate-800/60 bg-slate-950/95 p-4 md:w-64 md:border-r md:pt-8">
          <div className="mb-8 px-2">
            <GameLogo />
          </div>
          <SidebarMenu />
          
          <div className="mt-auto pt-8">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all progress? This clears saves on this device.')) {
                  onReset()
                }
              }}
              className="w-full rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
            >
              Reset Progress
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER / STATUS BAR */}
          <header className="sticky top-0 z-10 border-b border-cyan-500/15 bg-slate-950/80 px-4 py-3 backdrop-blur-md md:px-8">
            {levelUpToast ? (
              <div className="absolute inset-x-0 top-full px-4 py-2">
                <div className="rounded-lg border border-amber-400/50 bg-amber-500/20 px-4 py-2 text-center text-sm font-bold text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-bounce">
                  {levelUpToast}
                </div>
              </div>
            ) : null}
            
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="hidden lg:block">
                <h1 className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.3em] text-cyan-400/80">
                  System Dashboard
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Garage Status: Optimal</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatPill label="Scrap" value={scrap} tone="amber" icon="💎" />
                <StatPill label="Level" value={level} tone="cyan" icon="⭐" />
                
                <div className="min-w-[140px] rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">XP</span>
                    <span className="text-[9px] text-slate-500">{xpLabel}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                </div>

                <StatPill label="Trophies" value={trophies} tone="violet" icon="🏆" />
                
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-1.5">
                  <div className="text-[10px]">
                    <span className="font-bold text-emerald-400 uppercase tracking-tighter mr-1">Rank</span>
                    <span className="text-emerald-100 font-semibold">{pvpRank}</span>
                  </div>
                </div>

                <Link
                  to={ROUTES.play}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[10px] font-bold text-amber-200 transition hover:bg-amber-500/15"
                >
                  <span>★</span>
                  <span>{achievementCount}/{achievementTotal}</span>
                </Link>
              </div>
            </div>
          </header>

          {/* MAIN VIEW */}
          <main className="flex-1 overflow-x-hidden p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>

          {/* FOOTER */}
          <footer className="border-t border-slate-800/40 bg-slate-950/40 px-4 py-3 text-center text-[9px] uppercase tracking-[0.2em] text-slate-600 md:px-8">
            Robot Garage Protocol v{PERSIST_STORE_VERSION} // {import.meta.env.PROD ? 'Production' : 'Development'} // Local Storage Active
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
  icon,
}: {
  label: string
  value: number | string
  tone: 'amber' | 'cyan' | 'violet'
  icon?: string
}) {
  const colors = {
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-200',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100',
    violet: 'border-violet-500/20 bg-violet-500/5 text-violet-100',
  }
  
  const iconColors = {
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all hover:bg-opacity-10 ${colors[tone]}`}>
      {icon && <span className={`text-xs ${iconColors[tone]}`}>{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-tighter opacity-60 leading-none mb-0.5">{label}</span>
        <span className="font-[family-name:var(--font-display)] text-sm font-bold leading-none">{value}</span>
      </div>
    </div>
  )
}
