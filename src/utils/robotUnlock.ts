import { ROBOT_CATALOG, type StoryChapterId } from '../data/worldPhase8'
import { levelFromTotalXp } from './progression'

export interface RobotUnlockSlice {
  storyChapters: Record<StoryChapterId, { unlocked: boolean; completedOnce: boolean }>
  xp: number
}

export function isRobotUnlocked(robotId: string, s: RobotUnlockSlice): boolean {
  const def = ROBOT_CATALOG.find((r) => r.id === robotId)
  if (!def) return false
  const u = def.unlock
  if (u.kind === 'starter') return true
  if (u.kind === 'chapter') return Boolean(s.storyChapters[u.chapterId]?.completedOnce)
  if (u.kind === 'level') return levelFromTotalXp(s.xp) >= u.minLevel
  if (u.kind === 'chapter_level') {
    return (
      Boolean(s.storyChapters[u.chapterId]?.completedOnce) &&
      levelFromTotalXp(s.xp) >= u.minLevel
    )
  }
  return false
}
