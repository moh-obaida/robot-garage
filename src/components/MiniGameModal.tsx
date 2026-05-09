import { useState } from 'react'
import type { JunkyardDifficulty, MiniGameResult, QuestDef } from '../types/quests'
import { BalanceTestGame } from '../minigames/BalanceTestGame'
import { CoreChargeGame } from '../minigames/CoreChargeGame'
import { JunkyardSearchGame } from '../minigames/JunkyardSearchGame'
import { SpeedTestGame } from '../minigames/SpeedTestGame'
import { TrainingBattleGame, type TrainingCombatProfile } from '../minigames/TrainingBattleGame'
import { MemoryCircuitGame } from '../minigames/MemoryCircuitGame'
import { BatteryDeliveryGame } from '../minigames/BatteryDeliveryGame'
import { GarageKartGame } from '../minigames/GarageKartGame'
import { HoverBoardGame } from '../minigames/HoverBoardGame'
import { MagnetTruckGame } from '../minigames/MagnetTruckGame'
import { ObstacleAlleyGame } from '../minigames/ObstacleAlleyGame'
import { ScrapRacerGame } from '../minigames/ScrapRacerGame'
import { TimeTrialGame } from '../minigames/TimeTrialGame'
import { VehicleUpgradeGame } from '../minigames/VehicleUpgradeGame'
import { WireRepairGame } from '../minigames/WireRepairGame'
import { useGameStore } from '../store/useGameStore'

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
  const [junkyardDifficulty, setJunkyardDifficulty] = useState<JunkyardDifficulty>(
    () => quest.junkyardDifficulty ?? 'standard',
  )
  const challengeGate = useGameStore((s) => s.completedMissions.includes('first-battle'))

  const junkyardBlocked =
    quest.miniGame === 'junkyardSearch' &&
    junkyardDifficulty === 'challenge' &&
    !challengeGate

  const junkyardFailTip = (d: JunkyardDifficulty) => {
    switch (d) {
      case 'easy':
        return 'Tip: extra digs — clear edges first so sparks are easier to avoid.'
      case 'challenge':
        return 'Tip: two sparks on the field. Avoid the center until you see parts.'
      default:
        return 'Tip: any spark ends the run. Spread digs instead of tunneling straight.'
    }
  }

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
          <JunkyardSearchGame key={k} difficulty={junkyardDifficulty} onFinish={relayFinish} />
        )
      case 'speedTest':
        return <SpeedTestGame key={k} onFinish={relayFinish} />
      case 'balanceTest':
        return <BalanceTestGame key={k} onFinish={relayFinish} />
      case 'trainingBattle':
        return <TrainingBattleGame key={k} player={trainingProfile} onFinish={relayFinish} />
      case 'memoryCircuit':
        return <MemoryCircuitGame key={k} onFinish={relayFinish} />
      case 'garageKart':
        return <GarageKartGame key={k} onFinish={relayFinish} />
      case 'scrapRacer':
        return <ScrapRacerGame key={k} onFinish={relayFinish} />
      case 'batteryDelivery':
        return <BatteryDeliveryGame key={k} onFinish={relayFinish} />
      case 'hoverBoard':
        return <HoverBoardGame key={k} onFinish={relayFinish} />
      case 'magnetTruck':
        return <MagnetTruckGame key={k} onFinish={relayFinish} />
      case 'obstacleAlley':
        return <ObstacleAlleyGame key={k} onFinish={relayFinish} />
      case 'timeTrial':
        return <TimeTrialGame key={k} onFinish={relayFinish} />
      case 'vehicleUpgrade':
        return <VehicleUpgradeGame key={k} onFinish={relayFinish} />
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
            {quest.miniGame === 'junkyardSearch' ? (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Junkyard difficulty
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['easy', 'standard', 'challenge'] as const).map((d) => {
                    const locked = d === 'challenge' && !challengeGate
                    const active = junkyardDifficulty === d
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={locked}
                        onClick={() => setJunkyardDifficulty(d)}
                        className={[
                          'rounded-lg px-3 py-2 text-xs font-bold capitalize',
                          active
                            ? 'bg-cyan-500 text-slate-950'
                            : locked
                              ? 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600'
                              : 'border border-slate-600 bg-slate-900 text-slate-200 hover:border-cyan-500/50',
                        ].join(' ')}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                {junkyardBlocked ? (
                  <p className="mt-2 text-xs text-amber-200/90">
                    Challenge unlocks after First Battle.
                  </p>
                ) : null}
              </div>
            ) : null}
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
                  disabled={junkyardBlocked}
                  onClick={() => {
                    if (junkyardBlocked) return
                    setStep('play')
                  }}
                  className="min-h-[48px] flex-1 rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-45"
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
            {!result.success && quest.miniGame === 'junkyardSearch' ? (
              <p className="text-xs text-slate-400">{junkyardFailTip(junkyardDifficulty)}</p>
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
