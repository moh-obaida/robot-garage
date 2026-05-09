import { InventorFigure } from './InventorFigure'
import { RobotFigure } from './RobotFigure'

export function GarageHeroScene({ paintColorId }: { paintColorId: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/25 bg-gradient-to-b from-slate-900 via-[#0a0f1a] to-black shadow-[0_0_48px_rgba(34,211,238,0.12)]">
      <div className="pointer-events-none absolute inset-0">
        {/* back wall */}
        <div className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-slate-800/90 to-slate-950" />
        {/* shelves */}
        <div className="absolute left-4 top-8 h-2 w-24 rounded bg-slate-700/50" />
        <div className="absolute left-4 top-14 h-2 w-24 rounded bg-slate-700/40" />
        <div className="absolute right-6 top-10 h-2 w-20 rounded bg-slate-700/45" />
        {/* warm lamp */}
        <div className="absolute right-1/4 top-4 h-8 w-8 rounded-full bg-amber-500/25 blur-md" />
        {/* workbench */}
        <div className="absolute bottom-24 left-0 right-0 h-3 bg-slate-800/80" />
        <div className="absolute bottom-24 left-8 h-16 w-4 bg-slate-700/80" />
        <div className="absolute bottom-24 right-12 h-16 w-4 bg-slate-700/80" />
      </div>
      <div className="relative flex min-h-[280px] items-end justify-center gap-2 pb-6 pt-10 md:min-h-[340px] md:gap-8">
        <div className="w-24 shrink-0 md:w-32">
          <InventorFigure className="h-full w-full opacity-95" />
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute bottom-0 h-24 w-40 rounded-full bg-cyan-400/25 blur-xl md:h-28 md:w-48" />
          <div className="relative rounded-full border-2 border-cyan-400/50 bg-cyan-500/10 p-4 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
            <RobotFigure colorId={paintColorId} size="md" className="!mx-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
