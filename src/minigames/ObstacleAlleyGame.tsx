import { useCallback, useEffect, useRef, useState } from 'react'
import { obstacleAlleyConfig } from '../data/phase6Vehicle'
import type { MiniGameResult } from '../types/quests'

type Hazard = 'low' | 'high'
type Phase = 'intro' | 'go' | 'won' | 'lost'

function randomHazard(): Hazard {
  return Math.random() < 0.5 ? 'low' : 'high'
}

export function ObstacleAlleyGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [hazard, setHazard] = useState<Hazard>('low')
  const [deadline, setDeadline] = useState<number | null>(null)
  const finishedRef = useRef(false)
  const roundRef = useRef(0)

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
    roundRef.current = 0
    setRound(0)
    setHazard(randomHazard())
    setDeadline(Date.now() + obstacleAlleyConfig.reactMs)
    setPhase('go')
  }, [])

  useEffect(() => {
    roundRef.current = round
  }, [round])

  useEffect(() => {
    if (phase !== 'go' || deadline === null) return
    const id = window.setTimeout(() => {
      setPhase('lost')
      safeFinish({ success: false, score: roundRef.current })
    }, Math.max(0, deadline - Date.now()))
    return () => window.clearTimeout(id)
  }, [phase, deadline, safeFinish])

  const react = (move: 'duck' | 'jump') => {
    if (phase !== 'go') return
    const need = hazard === 'low' ? 'duck' : 'jump'
    if (move !== need) {
      setPhase('lost')
      safeFinish({ success: false, score: round })
      return
    }
    const next = round + 1
    if (next >= obstacleAlleyConfig.rounds) {
      setPhase('won')
      safeFinish({ success: true, score: 115 + next * 12 })
      return
    }
    setRound(next)
    setHazard(randomHazard())
    setDeadline(Date.now() + obstacleAlleyConfig.reactMs)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && 'Low sweep — duck. High beam — jump. Six reactions.'}
        {phase === 'go' && (
          <>
            Gate {round + 1}/{obstacleAlleyConfig.rounds}:{' '}
            <strong className="text-amber-300">
              {hazard === 'low' ? 'Low bar — duck!' : 'High beam — jump!'}
            </strong>
          </>
        )}
        {phase === 'won' && 'Clean line through the alley!'}
        {phase === 'lost' && 'Tagged — read the hazard height earlier.'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={phase !== 'go'}
          onClick={() => react('duck')}
          className="min-h-[48px] flex-1 rounded-xl bg-amber-500 font-bold text-slate-950"
        >
          Duck
        </button>
        <button
          type="button"
          disabled={phase !== 'go'}
          onClick={() => react('jump')}
          className="min-h-[48px] flex-1 rounded-xl bg-emerald-500 font-bold text-slate-950"
        >
          Jump
        </button>
      </div>
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Enter alley
        </button>
      ) : null}
    </div>
  )
}
