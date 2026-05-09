import { useCallback, useRef, useState } from 'react'
import { batteryDeliveryConfig } from '../data/phase6Vehicle'
import type { MiniGameResult } from '../types/quests'

type Phase = 'intro' | 'run' | 'won' | 'lost'

const DEPOTS = ['Bay A', 'Bay B', 'Bay C'] as const

export function BatteryDeliveryGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const targetsRef = useRef<number[]>([])
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
    const t: number[] = []
    for (let i = 0; i < batteryDeliveryConfig.stops; i++) {
      t.push(Math.floor(Math.random() * batteryDeliveryConfig.depotCount))
    }
    targetsRef.current = t
    setStep(0)
    setPhase('run')
  }, [])

  const pick = (depot: number) => {
    if (phase !== 'run') return
    const want = targetsRef.current[step]
    if (depot !== want) {
      setPhase('lost')
      safeFinish({ success: false, score: step })
      return
    }
    const next = step + 1
    if (next >= batteryDeliveryConfig.stops) {
      setPhase('won')
      safeFinish({ success: true, score: 110 + next * 15 })
      return
    }
    setStep(next)
  }

  const current = targetsRef.current[step] ?? 0

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        {phase === 'intro' && 'Route three cells to the right depot — wrong dock fails the run.'}
        {phase === 'run' && (
          <>
            Drop {step + 1}/{batteryDeliveryConfig.stops}:{' '}
            <strong className="text-amber-300">{DEPOTS[current]}</strong>
          </>
        )}
        {phase === 'won' && 'Batteries seated!'}
        {phase === 'lost' && 'Sparks! Match the glowing bay next time.'}
      </p>
      <div className="flex flex-col gap-2">
        {DEPOTS.map((label, i) => (
          <button
            key={label}
            type="button"
            disabled={phase !== 'run'}
            onClick={() => pick(i)}
            className={`min-h-[48px] rounded-xl border px-3 text-left font-bold ${
              phase === 'run' && current === i
                ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                : 'border-slate-600 text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
          style={{
            width: `${((step + (phase === 'won' ? 1 : 0)) / batteryDeliveryConfig.stops) * 100}%`,
          }}
        />
      </div>
      {phase === 'intro' ? (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950"
        >
          Load truck
        </button>
      ) : null}
    </div>
  )
}
