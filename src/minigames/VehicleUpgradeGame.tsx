import { useCallback, useRef, useState } from 'react'
import { vehicleUpgradeConfig } from '../data/phase6Vehicle'
import type { MiniGameResult } from '../types/quests'

type Phase = 'intro' | 'bolt' | 'won' | 'lost'

const PARTS = [
  { id: 0, label: 'Tires' },
  { id: 1, label: 'Shocks' },
  { id: 2, label: 'Torque hub' },
] as const

function shuffledSteps(): number[] {
  const arr = [0, 1, 2]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function VehicleUpgradeGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [order, setOrder] = useState<number[]>([])
  const [step, setStep] = useState(0)
  const finishedRef = useRef(false)

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
    setOrder(shuffledSteps())
    setStep(0)
    setPhase('bolt')
  }, [])

  const pick = (partId: number) => {
    if (phase !== 'bolt') return
    const want = order[step]
    if (partId !== want) {
      setPhase('lost')
      safeFinish({ success: false, score: step })
      return
    }
    const next = step + 1
    if (next >= vehicleUpgradeConfig.steps) {
      setPhase('won')
      safeFinish({ success: true, score: 125 + next * 15 })
      return
    }
    setStep(next)
  }

  const spec = order.map((id) => PARTS[id]!.label).join(' → ')

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && 'Bolt the kit in the spec order shown — no skipping steps.'}
        {phase === 'bolt' && (
          <>
            Spec: <strong className="text-amber-200">{spec}</strong> · step {step + 1}/
            {vehicleUpgradeConfig.steps}
          </>
        )}
        {phase === 'won' && 'Torque sequence tight!'}
        {phase === 'lost' && 'Wrong fastener — follow the spec strip.'}
      </p>
      <div className="flex flex-col gap-2">
        {PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={phase !== 'bolt'}
            onClick={() => pick(p.id)}
            className="min-h-[48px] rounded-xl border border-slate-600 pl-4 text-left font-bold text-slate-100"
          >
            {p.label}
          </button>
        ))}
      </div>
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Print spec
        </button>
      ) : null}
    </div>
  )
}
