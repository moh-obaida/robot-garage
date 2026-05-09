import type { UpgradeId } from '../types/game'
import { levelFromTotalXp } from './progression'

export interface QuestProgressEntry {
  completed: boolean
  bestScore?: number
  attempts: number
  completedAt?: string
}

export const STORAGE_V1 = 'robot-garage-save-v1'
export const STORAGE_V2 = 'robot-garage-save-v2'

const DEFAULT_UPGRADES: Record<UpgradeId, number> = {
  head: 1,
  arms: 1,
  body: 1,
  legs: 1,
  weapon: 1,
  core: 1,
}

function clampInt(n: unknown, fallback: number, min: number, max: number): number {
  const x = typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : NaN
  if (Number.isNaN(x)) return fallback
  return Math.max(min, Math.min(max, x))
}

function clampStr(s: unknown, fallback: string, maxLen: number): string {
  if (typeof s !== 'string') return fallback
  const t = s.trim().slice(0, maxLen)
  return t || fallback
}

function safeStringArray(a: unknown): string[] {
  if (!Array.isArray(a)) return []
  return a.filter((x): x is string => typeof x === 'string' && x.length > 0)
}

function safeQuestProgress(raw: unknown): Record<string, QuestProgressEntry> {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: Record<string, QuestProgressEntry> = {}
  for (const [k, v] of Object.entries(o)) {
    if (!k || typeof v !== 'object' || v === null) continue
    const e = v as Record<string, unknown>
    out[k] = {
      completed: typeof e.completed === 'boolean' ? e.completed : false,
      bestScore:
        typeof e.bestScore === 'number' && Number.isFinite(e.bestScore) ? e.bestScore : undefined,
      attempts: clampInt(e.attempts, 0, 0, 99_999),
      completedAt: typeof e.completedAt === 'string' ? e.completedAt : undefined,
    }
  }
  return out
}

function syncQuestProgressFromMissions(
  completed: string[],
  qp: Record<string, QuestProgressEntry>,
): Record<string, QuestProgressEntry> {
  const next = { ...qp }
  for (const id of completed) {
    const cur = next[id]
    next[id] = {
      completed: true,
      attempts: cur?.attempts ?? 0,
      bestScore: cur?.bestScore,
      completedAt: cur?.completedAt,
    }
  }
  return next
}

function mapOldUpgradeLevels(
  old: Record<string, unknown> | undefined,
): Record<UpgradeId, number> {
  const out = { ...DEFAULT_UPGRADES }
  if (!old || typeof old !== 'object') return out

  const getLv = (k: string) => {
    const v = old[k]
    return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0
  }

  const chassis = getLv('chassis')
  const actuators = getLv('actuators')
  const plating = getLv('plating')
  const gyros = getLv('gyros')

  const bodyFromOld = 1 + Math.min(4, chassis + plating)
  const armsFromOld = 1 + Math.min(4, actuators)
  const legsFromOld = 1 + Math.min(4, gyros)
  const headGuess = 1 + Math.min(4, Math.floor(plating / 2))
  const weaponGuess = 1 + Math.min(4, Math.floor(actuators / 2))
  const coreGuess = 1 + Math.min(4, Math.floor((chassis + actuators) / 3))

  if (chassis + actuators + plating + gyros > 0) {
    out.body = clampInt(bodyFromOld, 1, 1, 5)
    out.arms = clampInt(armsFromOld, 1, 1, 5)
    out.legs = clampInt(legsFromOld, 1, 1, 5)
    out.head = clampInt(headGuess, 1, 1, 5)
    out.weapon = clampInt(weaponGuess, 1, 1, 5)
    out.core = clampInt(coreGuess, 1, 1, 5)
  }

  return out
}

const COLOR_ALIASES: Record<string, string> = {
  cyan: 'blue',
  fuchsia: 'purple',
  violet: 'purple',
  emerald: 'green',
  amber: 'yellow',
  rose: 'red',
}

function normalizeColorId(id: string): string {
  return COLOR_ALIASES[id] ?? id
}

export interface MigratedSnapshot {
  scrap: number
  xp: number
  level: number
  trophies: number
  selectedRobotId: string
  robotName: string
  paintColorId: string
  upgradeLevels: Record<UpgradeId, number>
  unlockedColors: string[]
  completedMissions: string[]
  /** Side quest stats; keyed by quest id */
  questProgress: Record<string, QuestProgressEntry>
  arenaWins: number
  arenaLosses: number
  defeatedOpponents: string[]
  unlockedBadges: string[]
  achievementUnlocks: string[]
}

export const DEFAULT_SNAPSHOT: MigratedSnapshot = {
  scrap: 500,
  xp: 0,
  level: 1,
  trophies: 0,
  selectedRobotId: 'bolt-x',
  robotName: 'Bolt-X',
  paintColorId: 'blue',
  upgradeLevels: { ...DEFAULT_UPGRADES },
  unlockedColors: ['blue', 'white', 'gray'],
  completedMissions: [],
  questProgress: {},
  arenaWins: 0,
  arenaLosses: 0,
  defeatedOpponents: [],
  unlockedBadges: [],
  achievementUnlocks: [],
}

export function migrateUnknownToSnapshot(raw: unknown): MigratedSnapshot {
  const base = structuredClone(DEFAULT_SNAPSHOT)
  if (!raw || typeof raw !== 'object') return base

  const o = raw as Record<string, unknown>
  const state = (o.state as Record<string, unknown> | undefined) ?? o

  base.scrap = clampInt(state.scrap, base.scrap, 0, 99_999_999)
  base.xp = clampInt(state.xp, 0, 0, 99_999_999)
  base.trophies = clampInt(state.trophies, 0, 0, 99_999_999)
  base.robotName = clampStr(state.robotName, base.robotName, 24)
  base.selectedRobotId = clampStr(state.selectedRobotId, base.selectedRobotId, 32)
  base.arenaWins = clampInt(state.arenaWins, 0, 0, 99_999)
  base.arenaLosses = clampInt(state.arenaLosses, 0, 0, 99_999)

  const paintRaw = typeof state.paintColorId === 'string' ? state.paintColorId : 'blue'
  base.paintColorId = normalizeColorId(paintRaw)

  if (state.upgradeLevels && typeof state.upgradeLevels === 'object') {
    const ul = state.upgradeLevels as Record<string, unknown>
    const hasNew = ['head', 'arms', 'body', 'legs', 'weapon', 'core'].every(
      (k) => typeof ul[k] === 'number',
    )
    if (hasNew) {
      ;(Object.keys(base.upgradeLevels) as UpgradeId[]).forEach((k) => {
        base.upgradeLevels[k] = clampInt(ul[k], DEFAULT_UPGRADES[k], 1, 5)
      })
    } else {
      base.upgradeLevels = mapOldUpgradeLevels(ul as Record<string, unknown>)
    }
  }

  base.unlockedColors = safeStringArray(state.unlockedColors).map(normalizeColorId)
  if (base.unlockedColors.length === 0) {
    base.unlockedColors = [...DEFAULT_SNAPSHOT.unlockedColors]
  }

  base.completedMissions = safeStringArray(state.completedMissions)
  base.questProgress = safeQuestProgress(state.questProgress)
  base.questProgress = syncQuestProgressFromMissions(base.completedMissions, base.questProgress)
  base.defeatedOpponents = safeStringArray(state.defeatedOpponents)
  base.unlockedBadges = safeStringArray(state.unlockedBadges)
  base.achievementUnlocks = safeStringArray(state.achievementUnlocks)

  if (!base.unlockedColors.includes(base.paintColorId)) {
    base.paintColorId = base.unlockedColors[0] ?? 'blue'
  }

  base.level = levelFromTotalXp(base.xp)
  return base
}

export function tryParseStorage(json: string | null): MigratedSnapshot | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as unknown
    return migrateUnknownToSnapshot(parsed)
  } catch {
    return null
  }
}

export function loadInitialSnapshot(): MigratedSnapshot {
  const v2 = tryParseStorage(localStorage.getItem(STORAGE_V2))
  if (v2) return v2

  const v1Raw = localStorage.getItem(STORAGE_V1)
  if (v1Raw) {
    const migrated = tryParseStorage(v1Raw)
    if (migrated) {
      try {
        localStorage.setItem(STORAGE_V2, JSON.stringify({ state: migrated, version: 2 }))
      } catch {
        /* ignore */
      }
      return migrated
    }
  }

  return structuredClone(DEFAULT_SNAPSHOT)
}
