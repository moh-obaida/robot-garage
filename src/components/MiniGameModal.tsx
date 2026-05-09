import { useState } from 'react'
import type { MiniGameResult, QuestDef } from '../types/quests'
import { BalanceTestGame } from '../minigames/BalanceTestGame'
import { CoreChargeGame } from '../minigames/CoreChargeGame'
import { JunkyardSearchGame } from '../minigames/JunkyardSearchGame'
import { SpeedTestGame } from '../minigames/SpeedTestGame'
import { TrainingBattleGame, type TrainingCombatProfile } from '../minigames/TrainingBattleGame'
import { MemoryCircuitGame } from '../minigames/MemoryCircuitGame'
import { WireRepairGame } from '../minigames/WireRepairGame'

type Step = 'how' | 'play' | 'result'

export function MiniGameModal({
  quest,
  allowRewards,
  trainingProfile,
  onClose,
  onComplete,
}: {
  quest: QuestDef
  allowRewards: boolean
  trainingProfile: TrainingCombatProfile
  onClose: () => void
  onComplete: (r: MiniGameResult) => void
}) {
  const [step, setStep] = useState<Step>('how')
  const [result, setResult] = useState<MiniGameResult | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)

  const relayFinish = (r: MiniGameResult) => {
    setResult(r)
    setStep('result')
    onComplete(r)
  }

  const tryAgain = () => {
    setResult(null)
    setStep('play')
    setAttemptKey((k) => k + 1)
  }

  const renderGame = () => {
    const k = attemptKey
    switch (quest.miniGame) {
      case 'coreCharge':
        return <CoreChargeGame key={k} onFinish={relayFinish} />
      case 'wireRepair':
        return <WireRepairGame key={k} onFinish={relayFinish} />
      case 'junkyardSearch':
        return (
          <JunkyardSearchGame
            key={k}
            difficulty={quest.junkyardDifficulty ?? 'standard'}
            onFinish={relayFinish}
          />
        )
      case 'speedTest':
        return <SpeedTestGame key={k} onFinish={relayFinish} />
      case 'balanceTest':
        return <BalanceTestGame key={k} onFinish={relayFinish} />
      case 'trainingBattle':
        return <TrainingBattleGame key={k} player={trainingProfile} onFinish={relayFinish} />
      case 'memoryCircuit':
        return <MemoryCircuitGame key={k} onFinish={relayFinish} />
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-950 p-5 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <h2
          id="quest-modal-title"
          className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-50"
        >
          {quest.name}
        </h2>

        {step === 'how' ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-slate-300">{quest.instruction}</p>
            {quest.type === 'story' ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                {allowRewards ? (
                  <button
                    type="button"
                    onClick={() => relayFinish({ success: true })}
                    className="min-h-[48px] flex-1 rounded-xl bg-emerald-500 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    Mission Complete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] flex-1 rounded-xl border border-slate-600 py-3 font-bold text-slate-200 hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep('play')}
                  className="min-h-[48px] flex-1 rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] flex-1 rounded-xl border border-slate-600 py-3 font-bold text-slate-200 hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : null}

        {step === 'play' && quest.type === 'minigame' ? (
          <div className="mt-4 space-y-4">{renderGame()}</div>
        ) : null}

        {step === 'result' && result ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-50">
              {result.success ? 'Mission Complete!' : 'Not quite!'}
            </p>
            <p className="text-sm text-slate-400">
              {result.success
                ? allowRewards
                  ? 'Rewards added to your hangar.'
                  : 'Great run — scoring only.'
                : 'Shake it off and try again.'}
            </p>
            {result.score != null ? (
              <p className="text-amber-200">Score: {result.score}</p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {quest.type === 'minigame' && !result.success ? (
                <button
                  type="button"
                  onClick={tryAgain}
                  className="min-h-[48px] rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950 hover:bg-amber-300"
                >
                  Try Again
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-900 hover:bg-white"
              >
                {result.success ? 'Done' : 'Close'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
