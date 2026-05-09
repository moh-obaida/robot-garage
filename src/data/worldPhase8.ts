/** Story / world map progression (factory line, circuit cups, world bosses). */

export type StoryChapterId = 'neon-shakedown' | 'night-haul'
export type WorldBossId = 'tri-stack'
export type CircuitCupId = 'bronze-sparks' | 'silver-grid'

export const STORY_CHAPTER_IDS: StoryChapterId[] = ['neon-shakedown', 'night-haul']
export const WORLD_BOSS_IDS: WorldBossId[] = ['tri-stack']
export const CIRCUIT_CUP_IDS: CircuitCupId[] = ['bronze-sparks', 'silver-grid']

export interface StoryChapterProgress {
  unlocked: boolean
  completedOnce: boolean
}

export interface WorldBossProgress {
  unlocked: boolean
  defeatedOnce: boolean
}

export interface StoryChapterDef {
  title: string
  rewardScrap: number
  rewardXp: number
}

export const STORY_CHAPTER_DEFS: Record<StoryChapterId, StoryChapterDef> = {
  'neon-shakedown': { title: 'Neon Shakedown', rewardScrap: 80, rewardXp: 60 },
  'night-haul': { title: 'Night Haul', rewardScrap: 120, rewardXp: 90 },
}

export const WORLD_BOSSES: Record<WorldBossId, { rewardScrap: number; rewardXp: number }> = {
  'tri-stack': { rewardScrap: 200, rewardXp: 150 },
}

export const CIRCUIT_CUPS: Record<
  CircuitCupId,
  { minArenaWins: number; scrap: number; xp: number }
> = {
  'bronze-sparks': { minArenaWins: 2, scrap: 60, xp: 40 },
  'silver-grid': { minArenaWins: 5, scrap: 120, xp: 80 },
}

export const FACTORY_FIRST_SCRAP = 100
export const FACTORY_FIRST_XP = 75
export const FACTORY_REPEAT_SCRAP = 35
export const FACTORY_REPEAT_XP = 25

export function defaultStoryChapters(): Record<StoryChapterId, StoryChapterProgress> {
  return {
    'neon-shakedown': { unlocked: true, completedOnce: false },
    'night-haul': { unlocked: false, completedOnce: false },
  }
}

export function defaultWorldBosses(): Record<WorldBossId, WorldBossProgress> {
  return {
    'tri-stack': { unlocked: false, defeatedOnce: false },
  }
}

export function defaultCircuitCupClaimed(): Record<CircuitCupId, boolean> {
  return {
    'bronze-sparks': false,
    'silver-grid': false,
  }
}

/** Keep chapter chain coherent after merges or cheats. */
export function repairStoryChain(
  chapters: Record<StoryChapterId, StoryChapterProgress>,
): Record<StoryChapterId, StoryChapterProgress> {
  const out = { ...chapters }
  const first = out['neon-shakedown']!
  const second = out['night-haul']!
  out['neon-shakedown'] = { ...first, unlocked: true }
  if (first.completedOnce) {
    out['night-haul'] = { ...second, unlocked: true }
  }
  return out
}

export function syncBossUnlocksFromChapters(
  chapters: Record<StoryChapterId, StoryChapterProgress>,
  bosses: Record<WorldBossId, WorldBossProgress>,
): Record<WorldBossId, WorldBossProgress> {
  const triUnlocked = Boolean(chapters['night-haul']?.completedOnce)
  return {
    ...bosses,
    'tri-stack': {
      ...bosses['tri-stack']!,
      unlocked: bosses['tri-stack']!.unlocked || triUnlocked,
    },
  }
}

type RobotUnlock =
  | { kind: 'starter' }
  | { kind: 'chapter'; chapterId: StoryChapterId }
  | { kind: 'level'; minLevel: number }
  | { kind: 'chapterAndLevel'; chapterId: StoryChapterId; minLevel: number }

export const ROBOT_CATALOG: {
  id: string
  name: string
  type: string
  color: string
  unlock: RobotUnlock
}[] = [
  { id: 'bolt-x', name: 'Bolt-X', type: 'Standard chassis', color: '#22d3ee', unlock: { kind: 'starter' } },
  {
    id: 'spark-7',
    name: 'Spark-7',
    type: 'Sprinter frame',
    color: '#a855f7',
    unlock: { kind: 'chapter', chapterId: 'neon-shakedown' },
  },
  {
    id: 'titan-mk2',
    name: 'Titan Mk II',
    type: 'Heavy platform',
    color: '#f59e0b',
    unlock: { kind: 'chapterAndLevel', chapterId: 'night-haul', minLevel: 4 },
  },
]
