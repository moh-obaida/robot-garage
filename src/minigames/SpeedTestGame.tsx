import { useCallback, useEffect, useRef, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

const ROUNDS = 5
const NEED = 3

export function SpeedTestGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [pos, setPos] = useState(50)
  const dir = useRef(1)
  const raf = useRef<number>(0)
  const alive = useRef(true)

  const finish = useCallback(
    (success: boolean, totalHits: number) => {
      alive.current = false
      if (raf.current) cancelAnimationFrame(raf.current)
      onFinish({ success, score: totalHits * 20 })
    },
    [onFinish],
  )

  useEffect(() => {
    alive.current = true
    let last = performance.now()
    const tick = (t: number) => {
      if (!alive.current) return
      const dt = Math.min(32, t - last)
      last = t
      setPos((p) => {
        let n = p + dir.current * dt * 0.09
        if (n >= 96) {
          dir.current = -1
          n = 96
        } else if (n <= 4) {
          dir.current = 1
          n = 4
        }
        return n
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      alive.current = false
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [round])

  const stop = () => {
    const inZone = pos >= 42 && pos <= 58
    const nh = inZone ? hits + 1 : hits
    const nr = round + 1
    if (nr >= ROUNDS) {
      finish(nh >= NEED, nh)
      return
    }
    if (inZone) setHits(nh)
    setRound(nr)
    setPos(50 + (Math.random() * 20 - 10))
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-cyan-200">
        Round {Math.min(round + 1, ROUNDS)}/{ROUNDS} · Green hits {hits}/{NEED} needed
      </p>
      <div className="relative h-14 overflow-hidden rounded-xl bg-slate-900 ring-2 ring-slate-700">
        <div
          className="absolute inset-y-2 rounded-md bg-emerald-500/35"
          style={{ left: '42%', width: '16%' }}
        />
        <div
          className="absolute top-1 bottom-1 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <button
        type="button"
        onClick={stop}
        className="w-full min-h-[52px] rounded-xl bg-cyan-500 py-3 text-lg font-bold text-slate-950 hover:bg-cyan-400"
      >
        STOP
      </button>
    </div>
  )
}
