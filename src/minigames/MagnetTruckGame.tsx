import { useCallback, useEffect, useRef, useState } from 'react'
import { magnetTruckConfig } from '../data/phase6Vehicle'
import { useSafeInterval } from '../hooks/useSafeInterval'
import type { MiniGameResult } from '../types/quests'

interface Piece {
  id: number
  x: number
  y: number
}

type Phase = 'intro' | 'haul' | 'won' | 'lost'

export function MagnetTruckGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [renderTick, setRenderTick] = useState(0)
  const [truckX, setTruckX] = useState(50)

  const piecesRef = useRef<Piece[]>([])
  const catchRef = useRef(0)
  const spawnedRef = useRef(0)
  const nextIdRef = useRef(0)
  const tickRef = useRef(0)
  const truckXRef = useRef(50)
  const phaseRef = useRef<Phase>('intro')
  const finishedRef = useRef(false)

  const bump = useCallback(() => setRenderTick((t) => t + 1), [])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    truckXRef.current = truckX
  }, [truckX])

  const safeFinish = useCallback(
    (r: MiniGameResult) => {
      if (finishedRef.current) return
      finishedRef.current = true
      onFinish(r)
    },
    [onFinish],
  )

  const start = useCallback(() => {
    finishedRef.current = false
    piecesRef.current = []
    catchRef.current = 0
    spawnedRef.current = 0
    nextIdRef.current = 0
    tickRef.current = 0
    setTruckX(50)
    truckXRef.current = 50
    setPhase('haul')
    bump()
  }, [bump])

  useSafeInterval(
    () => {
      if (finishedRef.current || phaseRef.current !== 'haul') return
      const cfg = magnetTruckConfig
      tickRef.current += 1
      const tx = truckXRef.current
      const half = cfg.magnetWidth / 2
      const remaining: Piece[] = []

      for (const p of piecesRef.current) {
        const y = p.y + cfg.fallSpeed
        if (y >= cfg.fieldHeight) {
          if (Math.abs(p.x - tx) <= half) {
            catchRef.current += 1
            if (catchRef.current >= cfg.catchesToWin) {
              setPhase('won')
              safeFinish({ success: true, score: 100 + catchRef.current * 8 })
              bump()
              return
            }
          }
        } else {
          remaining.push({ ...p, y })
        }
      }
      piecesRef.current = remaining

      if (spawnedRef.current < cfg.totalDrops && tickRef.current % 4 === 0) {
        spawnedRef.current += 1
        const x = 12 + Math.random() * 76
        piecesRef.current.push({ id: nextIdRef.current++, x, y: 0 })
      }

      if (spawnedRef.current >= cfg.totalDrops && piecesRef.current.length === 0) {
        if (catchRef.current < cfg.catchesToWin) {
          setPhase('lost')
          safeFinish({ success: false, score: catchRef.current })
        }
        bump()
        return
      }
      bump()
    },
    phase === 'haul' ? magnetTruckConfig.tickMs : null,
  )

  const pieces = piecesRef.current
  const caught = catchRef.current
  const spawned = spawnedRef.current
  const cfg = magnetTruckConfig

  return (
    <div className="space-y-3" data-sync={renderTick}>
      <p className="text-sm text-slate-400">
        {phase === 'intro' && `Catch ${cfg.catchesToWin} loads with the boom before the yard clears.`}
        {phase === 'haul' && (
          <>
            Caught {caught}/{cfg.catchesToWin} · drops queued {Math.max(0, cfg.totalDrops - spawned)}
          </>
        )}
        {phase === 'won' && 'Magnet full — hauler rolling!'}
        {phase === 'lost' && 'Line the boom under the fall path next time.'}
      </p>
      <div className="relative h-[220px] overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950">
        {pieces.map((p) => (
          <div
            key={p.id}
            className="absolute size-3 -translate-x-1/2 rounded-sm bg-amber-400 shadow"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        <div
          className="absolute bottom-[4%] h-2.5 -translate-x-1/2 rounded bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          style={{ left: `${truckX}%`, width: `${cfg.magnetWidth}%` }}
        />
      </div>
      <input
        type="range"
        min={8}
        max={92}
        value={truckX}
        disabled={phase !== 'haul'}
        onChange={(e) => setTruckX(Number(e.target.value))}
        className="w-full accent-cyan-500"
        aria-label="Magnet position"
      />
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Lower boom
        </button>
      ) : null}
    </div>
  )
}
