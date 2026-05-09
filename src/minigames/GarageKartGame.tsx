import { useCallback, useEffect, useRef, useState } from 'react'
import { garageKartConfig } from '../data/phase6Vehicle'
import { useSafeInterval } from '../hooks/useSafeInterval'
import type { MiniGameResult } from '../types/quests'

interface Obstacle {
  id: number
  lane: number
  y: number
}

type Phase = 'intro' | 'run' | 'won' | 'lost'

export function GarageKartGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [playerLane, setPlayerLane] = useState(1)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [dodged, setDodged] = useState(0)

  const obstaclesRef = useRef<Obstacle[]>([])
  const dodgedRef = useRef(0)
  const playerLaneRef = useRef(1)
  const tickCountRef = useRef(0)
  const nextIdRef = useRef(0)
  const finishedRef = useRef(false)
  const phaseRef = useRef<Phase>('intro')

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    playerLaneRef.current = playerLane
  }, [playerLane])

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
    tickCountRef.current = 0
    nextIdRef.current = 0
    obstaclesRef.current = []
    dodgedRef.current = 0
    setObstacles([])
    setDodged(0)
    setPlayerLane(1)
    playerLaneRef.current = 1
    setPhase('run')
  }, [])

  useSafeInterval(
    () => {
      if (finishedRef.current || phaseRef.current !== 'run') return
      const cfg = garageKartConfig
      tickCountRef.current += 1
      const player = playerLaneRef.current
      let lost = false
      let nextDodged = dodgedRef.current
      const updated: Obstacle[] = []

      for (const o of obstaclesRef.current) {
        const y = o.y + cfg.obstacleSpeed
        if (y >= cfg.collisionBand.min && y <= cfg.collisionBand.max && o.lane === player) {
          lost = true
          break
        }
        if (y > 100) nextDodged += 1
        else updated.push({ ...o, y })
      }

      if (lost) {
        setPhase('lost')
        safeFinish({ success: false, score: dodgedRef.current })
        return
      }

      let spawn = updated
      if (tickCountRef.current % cfg.spawnEveryTicks === 0) {
        const lane = Math.floor(Math.random() * cfg.lanes)
        spawn = [...spawn, { id: nextIdRef.current++, lane, y: 0 }]
      }
      obstaclesRef.current = spawn
      dodgedRef.current = nextDodged
      setObstacles(spawn)
      setDodged(nextDodged)

      if (nextDodged >= cfg.dodgesToWin) {
        setPhase('won')
        safeFinish({ success: true, score: 100 + nextDodged * 5 })
      }
    },
    phase === 'run' ? garageKartConfig.tickMs : null,
  )

  const cfg = garageKartConfig

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && 'Swap lanes before scrap reaches your bumper row.'}
        {phase === 'run' && `Clear ${cfg.dodgesToWin} hazards · ${dodged} cleared`}
        {phase === 'won' && 'Pit lane open — clean run!'}
        {phase === 'lost' && 'Crunch! Try another lane next time.'}
      </p>
      <div className="grid min-h-[200px] grid-cols-3 gap-1 rounded-xl border border-cyan-500/30 bg-slate-950/80 p-1">
        {Array.from({ length: cfg.lanes }, (_, lane) => (
          <div
            key={lane}
            className="relative overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900/50"
          >
            {obstacles
              .filter((o) => o.lane === lane)
              .map((o) => (
                <div
                  key={o.id}
                  className="absolute left-1/2 w-[55%] -translate-x-1/2 rounded bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  style={{ top: `${o.y}%`, height: '14px' }}
                />
              ))}
            {playerLane === lane && phase === 'run' ? (
              <div className="absolute bottom-[6%] left-1/2 h-[18px] w-[64%] -translate-x-1/2 rounded-md border-2 border-cyan-400 bg-amber-400" />
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {([0, 1, 2] as const).map((lane) => (
          <button
            key={lane}
            type="button"
            disabled={phase !== 'run'}
            onClick={() => setPlayerLane(lane)}
            className={`min-h-[44px] flex-1 rounded-xl px-3 text-sm font-bold ${
              playerLane === lane
                ? 'bg-amber-400 text-slate-950'
                : 'border border-slate-600 text-slate-200'
            }`}
          >
            {lane === 0 ? 'L' : lane === 1 ? 'M' : 'R'}
          </button>
        ))}
      </div>
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Roll out
        </button>
      ) : null}
    </div>
  )
}
