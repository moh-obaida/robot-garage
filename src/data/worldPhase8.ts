/** World bay: story chapters, circuit cups, factory bonuses, bosses, robot gates. */

export const STORY_CHAPTER_IDS = ['storm-dock', 'night-haul'] as const
export type StoryChapterId = (typeof STORY_CHAPTER_IDS)[number]

export interface StoryChapterProgress {
  unlocked: boolean
  completedOnce: boolean
}

export interface StoryChapterDef {
  title: string
  objective: string
  rewardScrap: number
  rewardXp: number
  flavorWin: string
}

export const STORY_CHAPTER_DEFS: Record<StoryChapterId, StoryChapterDef> = {
  'storm-dock': {
    title: 'Storm Dock',
    objective: 'Stabilize the loading gantry before the squall hits.',
    rewardScrap: 220,
    rewardXp: 95,
    flavorWin: 'Dock crews radio thanks — crates are lashed for the storm.',
  },
  'night-haul': {
    title: 'Night Haul',
    objective: 'Run escort down the floodlit causeway without losing a pallet.',
    rewardScrap: 280,
    rewardXp: 115,
    flavorWin: 'Night haul certified — the press line will take your stamp.',
  },
}

export function defaultStoryChapters(): Record<StoryChapterId, StoryChapterProgress> {
  return {
    'storm-dock': { unlocked: true, completedOnce: false },
    'night-haul': { unlocked: false, completedOnce: false },
  }
}

export function repairStoryChain(
  chapters: Record<StoryChapterId, StoryChapterProgress>,
): Record<StoryChapterId, StoryChapterProgress> {
  const next = { ...chapters }
  for (let i = 0; i < STORY_CHAPTER_IDS.length; i++) {
    const id = STORY_CHAPTER_IDS[i]!
    if (i === 0) {
      next[id] = { ...next[id]!, unlocked: true }
      continue
    }
    const prev = STORY_CHAPTER_IDS[i - 1]!
    if (next[prev]?.completedOnce) {
      next[id] = { ...next[id]!, unlocked: true }
    }
  }
  return next
}

export const WORLD_BOSS_IDS = ['tri-stack', 'yard-mantis'] as const
export type WorldBossId = (typeof WORLD_BOSS_IDS)[number]

export interface WorldBossProgress {
  unlocked: boolean
  defeatedOnce: boolean
}

export interface WorldBossDef {
  title: string
  blurb: string
  tipOnLoss: string
  rewardScrap: number
  rewardXp: number
}

export const WORLD_BOSSES: Record<WorldBossId, WorldBossDef> = {
  'tri-stack': {
    title: 'Tri-Stack Foreman',
    blurb: 'A loader boss that feints between strike and guard patterns.',
    tipOnLoss: 'Anticipate the feint — reset the bout and vary tactics.',
    rewardScrap: 420,
    rewardXp: 210,
  },
  'yard-mantis': {
    title: 'Yard Mantis',
    blurb: 'Quick overload cycles — do not tunnel one tactic.',
    tipOnLoss: 'Rotate answers — the mantis punishes repetition.',
    rewardScrap: 520,
    rewardXp: 260,
  },
}

export function defaultWorldBosses(): Record<WorldBossId, WorldBossProgress> {
  return {
    'tri-stack': { unlocked: false, defeatedOnce: false },
    'yard-mantis': { unlocked: false, defeatedOnce: false },
  }
}

export function syncBossUnlocksFromChapters(
  chapters: Record<StoryChapterId, StoryChapterProgress>,
  bosses: Record<WorldBossId, WorldBossProgress>,
): Record<WorldBossId, WorldBossProgress> {
  const next = { ...bosses }
  if (chapters['night-haul']?.completedOnce) {
    next['tri-stack'] = { ...next['tri-stack']!, unlocked: true }
  }
  if (chapters['storm-dock']?.completedOnce && chapters['night-haul']?.completedOnce) {
    next['yard-mantis'] = { ...next['yard-mantis']!, unlocked: true }
  }
  return next
}

export const CIRCUIT_CUP_IDS = ['neon-500', 'heavy-haul'] as const
export type CircuitCupId = (typeof CIRCUIT_CUP_IDS)[number]

export const CIRCUIT_CUPS: Record<
  CircuitCupId,
  { label: string; blurb: string; minArenaWins: number; scrap: number; xp: number }
> = {
  'neon-500': {
    label: 'Neon 500',
    blurb: 'Short-course scrappers — prove your telemetry.',
    minArenaWins: 1,
    scrap: 180,
    xp: 90,
  },
  'heavy-haul': {
    label: 'Heavy Haul Cup',
    blurb: 'Tournament traction — only for steady win streaks.',
    minArenaWins: 3,
    scrap: 320,
    xp: 150,
  },
}

export function defaultCircuitCupClaimed(): Record<CircuitCupId, boolean> {
  return { 'neon-500': false, 'heavy-haul': false }
}

export const FACTORY_FIRST_SCRAP = 140
export const FACTORY_FIRST_XP = 85
export const FACTORY_REPEAT_SCRAP = 55
export const FACTORY_REPEAT_XP = 35

export type RobotUnlock =
  | { kind: 'starter' }
  | { kind: 'chapter'; chapterId: StoryChapterId }
  | { kind: 'level'; minLevel: number }
  | { kind: 'chapter_level'; chapterId: StoryChapterId; minLevel: number }

export interface RobotCatalogEntry {
  id: string
  name: string
  type: string
  color: string
  unlock: RobotUnlock
}

export const ROBOT_CATALOG: RobotCatalogEntry[] = [
  {
    id: 'bolt-x',
    name: 'Bolt X',
    type: 'Scout chassis',
    color: '#22d3ee',
    unlock: { kind: 'starter' },
  },
  {
    id: 'spark-7',
    name: 'Spark-7',
    type: 'Dock striker',
    color: '#f472b6',
    unlock: { kind: 'chapter', chapterId: 'storm-dock' },
  },
  {
    id: 'titan-mk2',
    name: 'Titan Mk-II',
    type: 'Heavy hauler',
    color: '#a78bfa',
    unlock: { kind: 'chapter_level', chapterId: 'night-haul', minLevel: 5 },
  },
]
