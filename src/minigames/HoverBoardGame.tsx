import { useCallback, useEffect, useRef, useState } from 'react'
import { hoverBoardConfig } from '../data/phase6Vehicle'
import { useSafeInterval } from '../hooks/useSafeInterval'
import type { MiniGameResult } from '../types/quests'

type Tier = keyof typeof hoverBoardConfig.band
type Phase = 'pick' | 'ride' | 'won'

export function HoverBoardGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [tier, setTier] = useState<Tier>('standard')
  const [renderTick, setRenderTick] = useState(0)

  const rideRef = useRef({ pos: 0, stable: 0 })
  const tierRef = useRef<Tier>('standard')
  const bandRef = useRef(hoverBoardConfig.band.standard)
  const phaseRef = useRef<Phase>('pick')
  const finishedRef = useRef(false)

  const bump = useCallback(() => setRenderTick((t) => t + 1), [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const safeFinish = useCallback(
    (r: MiniGameResult) => {
      if (finishedRef.current) return
      finishedRef.current = true
      onFinish(r)
    },
    [onFinish],
  )

  const startRide = useCallback(
    (t: Tier) => {
      finishedRef.current = false
      tierRef.current = t
      bandRef.current = hoverBoardConfig.band[t]
      rideRef.current = { pos: 0, stable: 0 }
      setTier(t)
      setPhase('ride')
      bump()
    },
    [bump],
  )

  useSafeInterval(
    () => {
      if (phaseRef.current !== 'ride') return
      const cfg = hoverBoardConfig
      const r = rideRef.current
      const drift = (Math.random() - 0.5) * 2 * cfg.driftStrength
      r.pos = Math.max(-1, Math.min(1, r.pos + drift))
      if (Math.abs(r.pos) <= bandRef.current) {
        r.stable += 1
        if (r.stable >= cfg.stableTicksToWin) {
          phaseRef.current = 'won'
          setPhase('won')
          const bonus = tierRef.current === 'challenge' ? 40 : tierRef.current === 'standard' ? 20 : 10
          safeFinish({ success: true, score: 100 + bonus + r.stable * 3 })
        }
      } else {
        r.stable = 0
      }
      bump()
    },
    phase === 'ride' ? hoverBoardConfig.tickMs : null,
  )

  const nudge = (dir: -1 | 1) => {
    if (phaseRef.current !== 'ride') return
    const r = rideRef.current
    r.pos = Math.max(-1, Math.min(1, r.pos + dir * hoverBoardConfig.nudge))
    bump()
  }

  const { pos, stable } = rideRef.current
  const band = hoverBoardConfig.band[tier]

  return (
    <div className="space-y-3" data-sync={renderTick}>
      <p className="text-sm text-slate-400">
        {phase === 'pick' && 'Pick deck tuning — wide band is easier; challenge scores higher.'}
        {phase === 'ride' && (
          <>
            Stay in cyan · {stable}/{hoverBoardConfig.stableTicksToWin} stable ticks
          </>
        )}
        {phase === 'won' && 'Gyros locked — smooth ride!'}
      </p>
      {phase === 'pick' ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => startRide('easy')}
            className="rounded-xl bg-emerald-500 py-2 font-bold text-slate-950"
          >
            Easy · wide band
          </button>
          <button
            type="button"
            onClick={() => startRide('standard')}
            className="rounded-xl bg-amber-400 py-2 font-bold text-slate-950"
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => startRide('challenge')}
            className="rounded-xl border border-cyan-500/50 py-2 font-bold text-cyan-100"
          >
            Challenge · tight band
          </button>
        </div>
      ) : null}
      {phase === 'ride' ? (
        <>
          <div className="relative h-7 rounded-lg border border-slate-600 bg-slate-900">
            <div
              className="absolute inset-y-0 border-x-2 border-cyan-400 bg-cyan-500/20"
              style={{
                left: `${50 - (band * 100) / 2}%`,
                width: `${band * 100}%`,
              }}
            />
            <div
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 shadow-lg"
              style={{ left: `${50 + pos * 40}%` }}
            />
          </div>
          <p className="text-xs text-cyan-200/80">Tip: tap early — drift stacks on pro deck.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => nudge(-1)}
              className="flex-1 rounded-xl border border-slate-600 py-2 font-bold"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              className="flex-1 rounded-xl border border-slate-600 py-2 font-bold"
            >
              →
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
