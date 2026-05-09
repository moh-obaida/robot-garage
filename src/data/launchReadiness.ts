import type { UpgradeId } from '../types/game'

export const LAUNCH_CHECKLIST_BONUS_SCRAP = 120
export const LAUNCH_CHECKLIST_BONUS_XP = 90

/** Narrow shape for checklist rules — avoids importing the full save snapshot (no circular deps). */
export interface LaunchChecklistContext {
  completedMissions: string[]
  upgradeLevels: Record<UpgradeId, number>
  arenaWins: number
  visitedPaths: string[]
}

export interface ComfortSettings {
  reducedMotion: boolean
  highContrast: boolean
}

export interface LaunchReadinessState {
  stepCompletion: Record<string, string>
  completionBonusClaimed: boolean
}

export const DEFAULT_COMFORT: ComfortSettings = {
  reducedMotion: false,
  highContrast: false,
}

export const DEFAULT_LAUNCH_READINESS: LaunchReadinessState = {
  stepCompletion: {},
  completionBonusClaimed: false,
}

export function mergeComfort(raw: unknown): ComfortSettings {
  const d = DEFAULT_COMFORT
  if (!raw || typeof raw !== 'object') return { ...d }
  const o = raw as Record<string, unknown>
  return {
    reducedMotion: typeof o.reducedMotion === 'boolean' ? o.reducedMotion : d.reducedMotion,
    highContrast: typeof o.highContrast === 'boolean' ? o.highContrast : d.highContrast,
  }
}

export function mergeLaunchReadiness(raw: unknown): LaunchReadinessState {
  const d = DEFAULT_LAUNCH_READINESS
  if (!raw || typeof raw !== 'object') return { ...d }
  const o = raw as Record<string, unknown>
  const stepCompletion: Record<string, string> = {}
  if (o.stepCompletion && typeof o.stepCompletion === 'object') {
    for (const [k, v] of Object.entries(o.stepCompletion as Record<string, unknown>)) {
      if (!k) continue
      if (typeof v === 'string' && v.length > 0) {
        stepCompletion[k] = v.slice(0, 64)
      } else if (v === true) {
        stepCompletion[k] = '1'
      }
    }
  }
  return {
    stepCompletion,
    completionBonusClaimed:
      typeof o.completionBonusClaimed === 'boolean' ? o.completionBonusClaimed : d.completionBonusClaimed,
  }
}

export interface LaunchChecklistItem {
  id: string
  label: string
  hint: string
  met: (s: LaunchChecklistContext) => boolean
}

/** Player-facing “release bay” checklist — all must be true to collect the one-time bonus. */
export const LAUNCH_CHECKLIST: LaunchChecklistItem[] = [
  {
    id: 'missions',
    label: 'Clear two missions',
    hint: 'Open Missions and finish any two jobs.',
    met: (s) => s.completedMissions.length >= 2,
  },
  {
    id: 'upgrade',
    label: 'Push any part to level II+',
    hint: 'Upgrades — buy a level on head, arms, body, legs, weapon, or core.',
    met: (s) => Object.values(s.upgradeLevels).some((v) => v >= 2),
  },
  {
    id: 'arena',
    label: 'Win a PvP bout',
    hint: 'Arena — take a ranked win.',
    met: (s) => s.arenaWins >= 1,
  },
  {
    id: 'explore',
    label: 'Visit Garage, Arcade & Shop',
    hint: 'Tour those three bays once each.',
    met: (s) =>
      ['/garage', '/arcade', '/shop'].every((p) => s.visitedPaths.includes(p)),
  },
]

export function launchChecklistComplete(s: LaunchChecklistContext): boolean {
  return LAUNCH_CHECKLIST.every((i) => i.met(s))
}

/** Pilot QA sign-off stamps (stored in `launchReadiness.stepCompletion`). */
export const LAUNCH_PILOT_STEP_ORDER = ['stash-verified', 'controls-ok'] as const

export type LaunchStepId = (typeof LAUNCH_PILOT_STEP_ORDER)[number]

export const LAUNCH_STEP_META: Record<LaunchStepId, { label: string; hint: string }> = {
  'stash-verified': {
    label: 'Save channel OK',
    hint: 'You have seen scrap/XP change and refresh still loads your bay.',
  },
  'controls-ok': {
    label: 'Bay navigation OK',
    hint: 'You can open missions, upgrades, and return to the dashboard.',
  },
}

export function allLaunchStepsComplete(lr: LaunchReadinessState): boolean {
  return LAUNCH_PILOT_STEP_ORDER.every((id) => Boolean(lr.stepCompletion[id]))
}

