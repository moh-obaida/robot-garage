import { useCallback, useEffect, useRef, useState } from 'react'
import { scrapRacerConfig } from '../data/phase6Vehicle'
import type { MiniGameResult } from '../types/quests'

type Cue = 'left' | 'up' | 'right'
type Phase = 'intro' | 'race' | 'won' | 'lost'

function randomCue(): Cue {
  const opts: Cue[] = ['left', 'up', 'right']
  return opts[Math.floor(Math.random() * opts.length)]!
}

export function ScrapRacerGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [cue, setCue] = useState<Cue>('left')
  const [raceEpoch, setRaceEpoch] = useState(0)
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
    setCue(randomCue())
    setPhase('race')
    setRaceEpoch((e) => e + 1)
  }, [])

  useEffect(() => {
    roundRef.current = round
  }, [round])

  useEffect(() => {
    if (phase !== 'race') return
    const id = window.setTimeout(() => {
      setPhase('lost')
      safeFinish({ success: false, score: roundRef.current })
    }, scrapRacerConfig.cueMs)
    return () => window.clearTimeout(id)
  }, [phase, raceEpoch, safeFinish])

  const onCue = (picked: Cue) => {
    if (phase !== 'race') return
    if (picked !== cue) {
      setPhase('lost')
      safeFinish({ success: false, score: round })
      return
    }
    const nextRound = round + 1
    if (nextRound >= scrapRacerConfig.rounds) {
      setPhase('won')
      safeFinish({ success: true, score: 120 + nextRound * 10 })
      return
    }
    setRound(nextRound)
    setCue(randomCue())
    setRaceEpoch((e) => e + 1)
  }

  const label = cue === 'left' ? '←' : cue === 'right' ? '→' : '↑'

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && `Hit the matching shift — ${scrapRacerConfig.rounds} pulls.`}
        {phase === 'race' && (
          <>
            Round {round + 1}/{scrapRacerConfig.rounds}: <strong className="text-cyan-300">{label}</strong>
          </>
        )}
        {phase === 'won' && 'Transmission synced!'}
        {phase === 'lost' && 'Missed shift — retry when ready.'}
      </p>
      <div className="flex justify-center gap-2">
        {(['left', 'up', 'right'] as const).map((c) => (
          <button
            key={c}
            type="button"
            disabled={phase !== 'race'}
            onClick={() => onCue(c)}
            className="min-h-[52px] min-w-[52px] rounded-xl border border-slate-600 text-xl font-bold text-slate-100"
          >
            {c === 'left' ? '←' : c === 'right' ? '→' : '↑'}
          </button>
        ))}
      </div>
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Stage lights
        </button>
      ) : null}
    </div>
  )
}
