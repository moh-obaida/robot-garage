import { useCallback, useEffect, useRef, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

export function BalanceTestGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [needle, setNeedle] = useState(0)
  const push = useRef(0)
  const stableMs = useRef(0)
  const alive = useRef(true)
  const won = useRef(false)
  const raf = useRef(0)

  const nudge = useCallback((d: number) => {
    push.current += d
  }, [])

  useEffect(() => {
    let last = performance.now()
    const loop = (t: number) => {
      if (!alive.current) return
      const dt = Math.min(48, t - last)
      last = t
      push.current *= 0.9
      setNeedle((prev) => {
        let n =
          prev +
          push.current * 0.055 * dt +
          (Math.random() - 0.49) * 0.014 * dt
        n = Math.max(-1, Math.min(1, n))
        const z = n >= -0.14 && n <= 0.14
        if (z) stableMs.current += dt
        else stableMs.current = 0
        if (stableMs.current >= 2200 && !won.current) {
          won.current = true
          alive.current = false
          const score = Math.round(stableMs.current / 20)
          window.setTimeout(() => onFinish({ success: true, score }), 0)
        }
        return n
      })
      if (alive.current) {
        raf.current = requestAnimationFrame(loop)
      }
    }
    raf.current = requestAnimationFrame(loop)
    return () => {
      alive.current = false
      cancelAnimationFrame(raf.current)
    }
  }, [onFinish])

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-emerald-200/90">Hold steady in the green band</p>
      <div className="relative h-12 rounded-full bg-slate-800 ring-2 ring-slate-600">
        <div className="absolute inset-y-2 left-[38%] right-[38%] rounded-md bg-emerald-500/45" />
        <div
          className="absolute top-1.5 bottom-1.5 w-2 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
          style={{ left: `${50 + needle * 38}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onPointerDown={() => nudge(-1.2)}
          className="min-h-[52px] flex-1 rounded-xl border-2 border-slate-600 bg-slate-900 text-2xl font-bold text-slate-100 active:bg-slate-800"
        >
          ◀
        </button>
        <button
          type="button"
          onPointerDown={() => nudge(1.2)}
          className="min-h-[52px] flex-1 rounded-xl border-2 border-slate-600 bg-slate-900 text-2xl font-bold text-slate-100 active:bg-slate-800"
        >
          ▶
        </button>
      </div>
    </div>
  )
}
