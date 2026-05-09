import { useState } from 'react'
import {
  LAUNCH_CHECKLIST,
  LAUNCH_CHECKLIST_BONUS_SCRAP,
  LAUNCH_CHECKLIST_BONUS_XP,
  launchChecklistComplete,
} from '../data/launchReadiness'
import { useGameStore } from '../store/useGameStore'
import { Panel } from './Panel'

export function LaunchBayPanel() {
  const [claimMsg, setClaimMsg] = useState<string | null>(null)
  const completedMissions = useGameStore((s) => s.completedMissions)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const arenaWins = useGameStore((s) => s.arenaWins)
  const visitedPaths = useGameStore((s) => s.visitedPaths)
  const bonusClaimed = useGameStore((s) => s.launchReadiness.completionBonusClaimed)
  const comfort = useGameStore((s) => s.comfort)
  const setComfort = useGameStore((s) => s.setComfort)
  const claimLaunchChecklistBonus = useGameStore((s) => s.claimLaunchChecklistBonus)

  const ctx = { completedMissions, upgradeLevels, arenaWins, visitedPaths }
  const allDone = launchChecklistComplete(ctx)

  return (
    <Panel
      title="Release bay checklist"
      subtitle="Warm up every system once — then claim a one-time launch stipend."
    >
      <ul className="space-y-2">
        {LAUNCH_CHECKLIST.map((item) => {
          const ok = item.met(ctx)
          return (
            <li
              key={item.id}
              className={`rounded-xl border px-3 py-2 text-sm ${
                ok
                  ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-100'
                  : 'border-slate-700/80 bg-slate-950/40 text-slate-300'
              }`}
            >
              <p className="font-bold text-white">
                {ok ? '✓' : '○'} {item.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{item.hint}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-3 text-sm text-amber-50">
        <p className="font-bold">Launch stipend</p>
        <p className="mt-1 text-xs text-amber-100/80">
          +{LAUNCH_CHECKLIST_BONUS_SCRAP} scrap · +{LAUNCH_CHECKLIST_BONUS_XP} XP (once per save)
        </p>
        {claimMsg ? (
          <p className="mt-2 text-xs text-amber-100/90" role="status">
            {claimMsg}
          </p>
        ) : null}
        {bonusClaimed ? (
          <p className="mt-2 text-xs font-semibold text-emerald-200">Collected — thanks for touring the garage.</p>
        ) : (
          <button
            type="button"
            disabled={!allDone}
            onClick={() => {
              setClaimMsg(null)
              const r = claimLaunchChecklistBonus()
              if (!r.ok && r.message) setClaimMsg(r.message)
            }}
            className="mt-3 w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.35)] transition enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Claim stipend
          </button>
        )}
      </div>

      <div className="mt-4 border-t border-slate-800/80 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comfort</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={comfort.reducedMotion}
              onChange={(e) => setComfort({ reducedMotion: e.target.checked })}
              className="h-4 w-4 rounded border-slate-600"
            />
            Reduce motion
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={comfort.highContrast}
              onChange={(e) => setComfort({ highContrast: e.target.checked })}
              className="h-4 w-4 rounded border-slate-600"
            />
            High contrast
          </label>
        </div>
      </div>
    </Panel>
  )
}
