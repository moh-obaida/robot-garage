import { QUESTS } from './quests'
import type { MigratedSnapshot } from '../utils/saveMigration'

export interface AchievementDef {
  id: string
  title: string
  description: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete any quest.',
  },
  {
    id: 'scrap_hoarder',
    title: 'Scrap Hoarder',
    description: 'Hold at least 2,000 scrap.',
  },
  {
    id: 'arena_rookie',
    title: 'Arena Rookie',
    description: 'Win 3 PvP matches.',
  },
  {
    id: 'titan_slayer',
    title: 'Titan Slayer',
    description: 'Defeat the Gold Titan.',
  },
  {
    id: 'story_clear',
    title: 'Garage Legend',
    description: 'Finish every story quest.',
  },
  {
    id: 'trophy_hunter',
    title: 'Trophy Hunter',
    description: 'Earn 100 trophies.',
  },
  {
    id: 'level_six',
    title: 'Level Six',
    description: 'Reach pilot level 6.',
  },
]

export function evaluateNewAchievementIds(s: MigratedSnapshot): string[] {
  const have = new Set(s.achievementUnlocks ?? [])
  const next: string[] = []
  const push = (id: string, ok: boolean) => {
    if (ok && !have.has(id)) next.push(id)
  }

  push('first_step', s.completedMissions.length >= 1)
  push('scrap_hoarder', s.scrap >= 2000)
  push('arena_rookie', s.arenaWins >= 3)
  push('titan_slayer', s.defeatedOpponents.includes('gold-titan'))
  push('story_clear', s.completedMissions.length >= QUESTS.length)
  push('trophy_hunter', s.trophies >= 100)
  push('level_six', s.level >= 6)

  return next
}
