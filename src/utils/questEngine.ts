import { QUESTS } from '../data/quests'
import type { QuestDef } from '../types/quests'
import { levelFromTotalXp } from './progression'
import type { MigratedSnapshot } from './saveMigration'

export function getQuestById(id: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === id)
}

export function canStartQuest(q: QuestDef, s: MigratedSnapshot): { ok: boolean; message?: string } {
  const lv = levelFromTotalXp(s.xp)
  if (lv < q.requiredLevel) {
    return { ok: false, message: `Requires level ${q.requiredLevel}.` }
  }
  if (!q.requires.every((r) => s.completedMissions.includes(r))) {
    return { ok: false, message: 'Complete prior ops first.' }
  }
  return { ok: true }
}

export function isQuestCompleted(s: MigratedSnapshot, questId: string): boolean {
  return s.completedMissions.includes(questId)
}
