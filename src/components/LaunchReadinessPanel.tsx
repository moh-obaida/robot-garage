import { useState } from 'react'
import {
  allLaunchStepsComplete,
  LAUNCH_CHECKLIST,
  LAUNCH_CHECKLIST_BONUS_SCRAP,
  LAUNCH_CHECKLIST_BONUS_XP,
  LAUNCH_PILOT_STEP_ORDER,
  LAUNCH_STEP_META,
  launchChecklistComplete,
} from '../data/launchReadiness'
import { useGameStore } from '../store/useGameStore'

export function LaunchReadinessPanel() {
  const [feedback, setFeedback] = useState<string | null>(null)
  const completedMissions = useGameStore((s) => s.completedMissions)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const arenaWins = useGameStore((s) => s.arenaWins)
  const visitedPaths = useGameStore((s) => s.visitedPaths)
  const launchReadiness = useGameStore((s) => s.launchReadiness)
  const claimed = launchReadiness.completionBonusClaimed
  const stepCompletion = launchReadiness.stepCompletion
  const reducedMotion = useGameStore((s) => s.comfort.reducedMotion)
  const highContrast = useGameStore((s) => s.comfort.highContrast)
  const setComfort = useGameStore((s) => s.setComfort)
  const completeLaunchStep = useGameStore((s) => s.completeLaunchStep)
  const claimLaunchChecklistBonus = useGameStore((s) => s.claimLaunchChecklistBonus)

  const slice = {
    completedMissions,
    upgradeLevels,
    arenaWins,
    visitedPaths,
  }
  const allMet = launchChecklistComplete(slice)
  const pilotDone = allLaunchStepsComplete(launchReadiness)
  const canCollect = allMet && pilotDone && !claimed

  return (
    <section className="rounded-2xl border border-cyan-500/25 bg-slate-950/70 p-4 shadow-[0_0_32px_rgba(34,211,238,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-cyan-200">
            Release bay checklist
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Finish every line to prove the garage is demo-ready. One-time bonus:{' '}
            <strong className="text-amber-200">
              +{LAUNCH_CHECKLIST_BONUS_SCRAP} scrap · +{LAUNCH_CHECKLIST_BONUS_XP} XP
            </strong>
            .
          </p>
        </div>
        {claimed ? (
          <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            Bonus banked
          </span>
        ) : canCollect ? (
          <span className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
            Ready to collect
          </span>
        ) : allMet && !pilotDone ? (
          <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100">
            Sign-off pending
          </span>
        ) : (
          <span className="rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            In progress
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {LAUNCH_CHECKLIST.map((item) => {
          const ok = item.met(slice)
          return (
            <li
              key={item.id}
              className={[
                'flex gap-3 rounded-xl border px-3 py-2 text-xs',
                ok
                  ? 'border-emerald-500/35 bg-emerald-500/5 text-slate-200'
                  : 'border-slate-700/80 bg-slate-900/40 text-slate-400',
              ].join(' ')}
            >
              <span className="mt-0.5 font-bold text-cyan-300">{ok ? '✓' : '○'}</span>
              <div>
                <p className="font-semibold text-slate-100">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.hint}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Comfort &amp; presentation
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setComfort({ reducedMotion: e.target.checked })}
              className="accent-cyan-400"
            />
            Reduce motion
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setComfort({ highContrast: e.target.checked })}
              className="accent-cyan-400"
            />
            High contrast UI
          </label>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/35 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pilot sign-off
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Quick QA confirmations — required before banking the launch stipend.
        </p>
        <ul className="mt-3 space-y-2">
          {LAUNCH_PILOT_STEP_ORDER.map((stepId) => {
            const meta = LAUNCH_STEP_META[stepId]
            const done = Boolean(stepCompletion[stepId])
            return (
              <li
                key={stepId}
                className="flex flex-col gap-1.5 rounded-lg border border-slate-800/90 bg-slate-950/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{meta.label}</p>
                  <p className="text-[11px] text-slate-500">{meta.hint}</p>
                </div>
                <button
                  type="button"
                  disabled={done || claimed}
                  onClick={() => completeLaunchStep(stepId)}
                  className={[
                    'shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide',
                    done || claimed
                      ? 'cursor-not-allowed border border-emerald-500/30 bg-emerald-500/10 text-emerald-200/80'
                      : 'border border-cyan-500/50 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25',
                  ].join(' ')}
                >
                  {done ? 'Done' : 'Confirm'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canCollect}
          onClick={() => {
            setFeedback(null)
            const r = claimLaunchChecklistBonus()
            if (!r.ok && r.message) setFeedback(r.message)
          }}
          className={[
            'rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition',
            !canCollect
              ? 'cursor-not-allowed border border-slate-700 bg-slate-900 text-slate-500'
              : 'border border-amber-400/60 bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:bg-amber-300',
          ].join(' ')}
        >
          {claimed ? 'Launch bonus collected' : 'Collect launch bonus'}
        </button>
        {feedback ? (
          <p className="w-full text-xs text-amber-200/90" role="status">
            {feedback}
          </p>
        ) : null}
      </div>
    </section>
  )
}
