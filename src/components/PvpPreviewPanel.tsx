import { Link } from 'react-router-dom'
import { RobotFigure } from './RobotFigure'
import { rankFromTrophies, useGameStore } from '../store/useGameStore'
import { ROUTES } from '../types/game'

export function PvpPreviewPanel() {
  const name = useGameStore((s) => s.robotName)
  const color = useGameStore((s) => s.paintColorId)
  const trophies = useGameStore((s) => s.trophies)

  return (
    <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-br from-slate-950/90 to-rose-950/20 p-3 shadow-[0_0_24px_rgba(244,63,94,0.12)]">
      <h3 className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-widest text-rose-200/80">
        PvP Battle
      </h3>
      <div className="mt-2 flex items-center justify-center gap-2">
        <div className="text-center">
          <div className="mx-auto w-[72px]">
            <RobotFigure colorId={color} size="sm" />
          </div>
          <p className="mt-1 text-[10px] font-bold text-cyan-100">{name}</p>
          <div className="mx-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-4/5 rounded-full bg-cyan-400" />
          </div>
        </div>
        <div className="font-[family-name:var(--font-display)] text-xl font-black text-white/90">VS</div>
        <div className="text-center">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-lg border border-rose-500/40 bg-slate-900 text-3xl">
            ⚔️
          </div>
          <p className="mt-1 text-[10px] font-bold text-rose-200">Rival</p>
          <div className="mx-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-3/5 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-400">
        {rankFromTrophies(trophies)} · {trophies} trophies
      </p>
      <Link
        to={ROUTES.arena}
        className="mt-3 block w-full rounded-xl bg-amber-400 py-2.5 text-center text-xs font-black text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.35)] hover:bg-amber-300"
      >
        ENTER ARENA
      </Link>
    </div>
  )
}
