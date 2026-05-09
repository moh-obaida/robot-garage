import { useCallback, useEffect, useRef, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

export function CoreChargeGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [meters, setMeters] = useState({ e: 12, h: 8 })
  const chargingRef = useRef(false)
  const ended = useRef(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(0)

  const finish = useCallback(
    (success: boolean, score: number) => {
      if (ended.current) return
      ended.current = true
      if (tickRef.current) clearInterval(tickRef.current)
      onFinish({ success, score })
    },
    [onFinish],
  )

  useEffect(() => {
    ended.current = false
    startRef.current = performance.now()
    tickRef.current = setInterval(() => {
      if (ended.current) return
      if (performance.now() - startRef.current > 26_500) {
        setMeters((m) => {
          if (!ended.current) finish(false, Math.round(m.e))
          return m
        })
        return
      }
      setMeters(({ e, h }) => {
        const ch = chargingRef.current
        const ne = ch ? Math.min(100, e + 2.1) : Math.max(0, e - 0.32)
        const nh = ch ? Math.min(100, h + 1.35) : Math.max(0, h - 1.05)
        if (nh >= 100) {
          window.setTimeout(() => finish(false, Math.round(ne)), 0)
          return { e: ne, h: nh }
        }
        if (ne >= 100) {
          window.setTimeout(() => finish(true, 100), 0)
          return { e: ne, h: nh }
        }
        return { e: ne, h: nh }
      })
    }, 85)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [finish])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-slate-400">Fill energy first. Let go to cool.</p>
        <div className="h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-[width] duration-75"
            style={{ width: `${meters.e}%` }}
          />
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width] duration-75"
            style={{ width: `${meters.h}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onPointerDown={() => {
          chargingRef.current = true
        }}
        onPointerUp={() => {
          chargingRef.current = false
        }}
        onPointerLeave={() => {
          chargingRef.current = false
        }}
        className="w-full min-h-[56px] rounded-xl bg-amber-400 py-3 text-lg font-bold text-slate-950 active:scale-[0.98]"
      >
        HOLD to charge
      </button>
    </div>
  )
}
