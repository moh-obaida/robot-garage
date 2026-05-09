import { useCallback, useEffect, useRef, useState } from 'react'
import { timeTrialConfig } from '../data/phase6Vehicle'
import type { MiniGameResult } from '../types/quests'

type Phase = 'intro' | 'mem' | 'race' | 'won' | 'lost'

function shuffledOrder(len: number): number[] {
  const arr = Array.from({ length: len }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function TimeTrialGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [order, setOrder] = useState<number[]>([])
  const [flashIdx, setFlashIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [deadline, setDeadline] = useState<number | null>(null)
  const finishedRef = useRef(false)
  const stepRef = useRef(0)

  const safeFinish = useCallback(
    (r: MiniGameResult) => {
      if (finishedRef.current) return
      finishedRef.current = true
      onFinish(r)
    },
    [onFinish],
  )

  const begin = useCallback(() => {
    finishedRef.current = false
    setOrder(shuffledOrder(timeTrialConfig.checkpoints))
    setFlashIdx(0)
    setStep(0)
    setPhase('mem')
  }, [])

  useEffect(() => {
    if (phase !== 'mem' || order.length === 0) return
    if (flashIdx >= order.length) {
      setPhase('race')
      setDeadline(Date.now() + timeTrialConfig.totalMs)
      return
    }
    const id = window.setTimeout(() => setFlashIdx((i) => i + 1), timeTrialConfig.memorizeMs)
    return () => window.clearTimeout(id)
  }, [phase, flashIdx, order])

  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    if (phase !== 'race' || deadline === null) return
    const id = window.setTimeout(() => {
      setPhase('lost')
      safeFinish({ success: false, score: stepRef.current })
    }, Math.max(0, deadline - Date.now()))
    return () => window.clearTimeout(id)
  }, [phase, deadline, safeFinish])

  const tapGate = (idx: number) => {
    if (phase !== 'race') return
    const want = order[step]
    if (idx !== want) {
      setPhase('lost')
      safeFinish({ success: false, score: step })
      return
    }
    const next = step + 1
    if (next >= order.length) {
      const msLeft = deadline ? Math.max(0, deadline - Date.now()) : 0
      setPhase('won')
      safeFinish({ success: true, score: 130 + Math.floor(msLeft / 100) })
      return
    }
    setStep(next)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && 'Memorize the neon gate order, then punch checkpoints before time runs out.'}
        {phase === 'mem' && (
          <>
            Watch…{' '}
            {flashIdx < order.length ? (
              <strong className="text-cyan-300">Gate {order[flashIdx]! + 1}</strong>
            ) : (
              'Go!'
            )}
          </>
        )}
        {phase === 'race' && (
          <>
            Race: hit gate {step + 1}/{order.length}
          </>
        )}
        {phase === 'won' && 'Checkered!'}
        {phase === 'lost' && 'Wrong gate or out of time.'}
      </p>
      {(phase === 'race' || phase === 'mem') && order.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {order.map((_, i) => (
            <button
              key={i}
              type="button"
              disabled={phase !== 'race'}
              onClick={() => tapGate(i)}
              className={`min-h-[48px] min-w-[48px] rounded-xl font-bold ${
                phase === 'mem' && flashIdx < order.length && order[flashIdx] === i
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
                  : 'border border-slate-600 text-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : null}
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={begin}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Arm timer
        </button>
      ) : null}
    </div>
  )
}
