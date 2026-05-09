import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { evaluateNewAchievementIds } from '../data/achievements'
import { COLORS } from '../data/colors'
import { OPPONENTS } from '../data/opponents'
import { computeCombatStats, nextUpgradeCost } from '../data/upgrades'
import type { CombatStats, UpgradeId } from '../types/game'
import type { MiniGameResult } from '../types/quests'
import { canStartQuest, getQuestById } from '../utils/questEngine'
import { levelFromTotalXp } from '../utils/progression'
import {
  DEFAULT_SNAPSHOT,
  STORAGE_V1,
  STORAGE_V2,
  loadInitialSnapshot,
  type MigratedSnapshot,
} from '../utils/saveMigration'

export type { MigratedSnapshot as GameSnapshot }

interface GameState extends MigratedSnapshot {
  levelUpToast: string | null
  renameRobot: (name: string) => void
  setLevelUpToast: (msg: string | null) => void
  addXp: (n: number) => void
  tryBuyUpgrade: (id: UpgradeId) => { ok: boolean; message?: string }
  startQuestPlay: (questId: string) => { ok: boolean; message?: string }
  completeQuestWithResult: (
    questId: string,
    result: MiniGameResult,
  ) => { ok: boolean; message?: string }
  equipColor: (colorId: string) => { ok: boolean; message?: string }
  tryUnlockColorWithScrap: (colorId: string) => { ok: boolean; message?: string }
  applyArenaRewards: (won: boolean, opponentId: string) => void
  resetProgress: () => void
  selectRobot: (robotId: string) => void
  syncColorUnlocks: () => void
}

function mergeAchievementUnlocks(s: MigratedSnapshot): string[] {
  const add = evaluateNewAchievementIds(s)
  return [...new Set([...(s.achievementUnlocks ?? []), ...add])]
}

export function collectColorUnlocks(s: MigratedSnapshot): string[] {
  const add = new Set<string>(s.unlockedColors)
  for (const o of OPPONENTS) {
    if (o.unlockColorId && s.defeatedOpponents.includes(o.id)) {
      add.add(o.unlockColorId)
    }
  }
  for (const c of COLORS) {
    if (c.comingSoon) continue
    if (c.starter) {
      add.add(c.id)
      continue
    }
    if (c.requiresMissionId && s.completedMissions.includes(c.requiresMissionId)) {
      add.add(c.id)
    }
    if (c.requiresPvpWins != null && s.arenaWins >= c.requiresPvpWins) {
      add.add(c.id)
    }
    if (c.id === 'gold') {
      if (s.completedMissions.includes('tournament') || s.defeatedOpponents.includes('gold-titan')) {
        add.add('gold')
      }
    }
    if (c.requiresDefeatOpponentId && s.defeatedOpponents.includes(c.requiresDefeatOpponentId)) {
      add.add(c.id)
    }
  }
  return Array.from(add)
}

function seed(): MigratedSnapshot & { levelUpToast: null } {
  const snap = loadInitialSnapshot()
  return {
    ...snap,
    unlockedColors: collectColorUnlocks(snap),
    level: levelFromTotalXp(snap.xp),
    levelUpToast: null,
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...seed(),

      setLevelUpToast: (msg) => set({ levelUpToast: msg }),

      syncColorUnlocks: () => {
        const s = get()
        set({ unlockedColors: collectColorUnlocks(s) })
      },

      renameRobot: (name) => {
        const trimmed = name.trim().slice(0, 24) || 'Bolt-X'
        set({ robotName: trimmed })
      },

      selectRobot: (robotId) => {
        set({ selectedRobotId: robotId })
      },

      addXp: (n) => {
        if (n <= 0) return
        set((s) => {
          const prevLv = levelFromTotalXp(s.xp)
          const xp = s.xp + n
          const nextLv = levelFromTotalXp(xp)
          const levelUpToast =
            nextLv > prevLv ? `Level up! Now level ${nextLv}.` : s.levelUpToast
          return { xp, level: nextLv, levelUpToast }
        })
      },

      tryBuyUpgrade: (id) => {
        const state = get()
        const lv = state.upgradeLevels[id] ?? 1
        if (lv >= 5) return { ok: false, message: 'MAX LEVEL' }
        const cost = nextUpgradeCost(id, lv)
        if (cost == null) return { ok: false, message: 'MAX LEVEL' }
        if (state.scrap < cost) return { ok: false, message: 'Not enough scrap.' }
        const scrap = state.scrap - cost
        const upgradeLevels = { ...state.upgradeLevels, [id]: lv + 1 }
        const next: MigratedSnapshot = { ...state, scrap, upgradeLevels }
        set({
          scrap,
          upgradeLevels,
          achievementUnlocks: mergeAchievementUnlocks(next),
        })
        return { ok: true }
      },

      startQuestPlay: (questId) => {
        const q = getQuestById(questId)
        if (!q) return { ok: false, message: 'Unknown quest.' }
        return canStartQuest(q, get())
      },

      completeQuestWithResult: (questId, result) => {
        const state = get()
        const q = getQuestById(questId)
        if (!q) return { ok: false, message: 'Unknown quest.' }

        let effectiveSuccess = result.success
        if (effectiveSuccess && q.passScore != null) {
          const sc = result.score ?? 0
          if (sc < q.passScore) effectiveSuccess = false
        }

        const prev = state.questProgress[questId]
        const attempts = (prev?.attempts ?? 0) + 1
        let bestScore = prev?.bestScore
        if (result.score != null && Number.isFinite(result.score)) {
          bestScore = bestScore == null ? result.score : Math.max(bestScore, result.score)
        }

        const alreadyDone = state.completedMissions.includes(questId)

        if (!effectiveSuccess) {
          set({
            questProgress: {
              ...state.questProgress,
              [questId]: {
                completed: alreadyDone,
                attempts,
                bestScore,
                completedAt: prev?.completedAt,
              },
            },
          })
          return { ok: true }
        }

        if (alreadyDone) {
          set({
            questProgress: {
              ...state.questProgress,
              [questId]: {
                completed: true,
                attempts,
                bestScore,
                completedAt: prev?.completedAt,
              },
            },
            achievementUnlocks: mergeAchievementUnlocks(state),
          })
          return { ok: true }
        }

        const gate = canStartQuest(q, state)
        if (!gate.ok) {
          set({
            questProgress: {
              ...state.questProgress,
              [questId]: {
                completed: false,
                attempts,
                bestScore,
              },
            },
          })
          return { ok: false, message: gate.message ?? 'Cannot complete yet.' }
        }

        const prevLv = levelFromTotalXp(state.xp)
        const xp = state.xp + q.rewardXp
        const nextLv = levelFromTotalXp(xp)
        const scrap = state.scrap + q.rewardScrap
        const completed = [...state.completedMissions, questId]
        const badges = new Set(state.unlockedBadges)
        if (q.unlockBadgeId) badges.add(q.unlockBadgeId)

        const colorExtras = new Set(state.unlockedColors)
        if (q.unlockColorId) colorExtras.add(q.unlockColorId)

        const partial: MigratedSnapshot = {
          ...state,
          scrap,
          xp,
          level: nextLv,
          completedMissions: completed,
          unlockedBadges: Array.from(badges),
          unlockedColors: Array.from(colorExtras),
          questProgress: {
            ...state.questProgress,
            [questId]: {
              completed: true,
              attempts,
              bestScore,
              completedAt: new Date().toISOString(),
            },
          },
        }

        const unlockedColors = collectColorUnlocks(partial)
        const achievementUnlocks = mergeAchievementUnlocks({
          ...partial,
          unlockedColors,
        })

        set({
          scrap,
          xp,
          level: nextLv,
          completedMissions: completed,
          unlockedBadges: Array.from(badges),
          unlockedColors,
          questProgress: partial.questProgress,
          achievementUnlocks,
          levelUpToast: nextLv > prevLv ? `Level up! Now level ${nextLv}.` : null,
        })
        return { ok: true }
      },

      equipColor: (colorId) => {
        const state = get()
        const c = COLORS.find((x) => x.id === colorId)
        if (!c) return { ok: false, message: 'Unknown color.' }
        if (c.comingSoon) return { ok: false, message: 'Coming soon.' }
        if (!state.unlockedColors.includes(colorId)) {
          return { ok: false, message: 'Locked.' }
        }
        set({ paintColorId: colorId })
        return { ok: true }
      },

      tryUnlockColorWithScrap: (colorId) => {
        const state = get()
        const c = COLORS.find((x) => x.id === colorId)
        if (!c) return { ok: false, message: 'Unknown color.' }
        if (c.comingSoon) return { ok: false, message: 'Coming soon.' }
        if (state.unlockedColors.includes(colorId)) {
          return { ok: false, message: 'Already unlocked.' }
        }
        if (c.scrapCost <= 0) {
          return { ok: false, message: 'Unlock via missions or conditions.' }
        }
        if (state.scrap < c.scrapCost) {
          return { ok: false, message: 'Not enough scrap.' }
        }
        const scrap = state.scrap - c.scrapCost
        const unlockedColors = [...state.unlockedColors, colorId]
        const partial: MigratedSnapshot = { ...state, scrap, unlockedColors }
        const unlockedColorsNext = collectColorUnlocks(partial)
        const nextSnap: MigratedSnapshot = { ...partial, unlockedColors: unlockedColorsNext }
        set({
          scrap,
          unlockedColors: unlockedColorsNext,
          achievementUnlocks: mergeAchievementUnlocks(nextSnap),
        })
        return { ok: true }
      },

      applyArenaRewards: (won, opponentId) => {
        const opp = OPPONENTS.find((o) => o.id === opponentId)
        if (!opp) return

        set((s) => {
          const wins = won ? s.arenaWins + 1 : s.arenaWins
          const losses = won ? s.arenaLosses : s.arenaLosses + 1
          let scrap = s.scrap
          let xp = s.xp
          let trophies = s.trophies
          const defeated = new Set(s.defeatedOpponents)
          const badges = new Set(s.unlockedBadges)

          if (won) {
            scrap += opp.rewardScrap
            xp += opp.rewardXp
            trophies += opp.rewardTrophies
            defeated.add(opp.id)
            if (opp.unlockBadgeId) badges.add(opp.unlockBadgeId)
          }

          const prevLv = levelFromTotalXp(s.xp)
          const nextLv = levelFromTotalXp(xp)
          const levelUpToast = nextLv > prevLv ? `Level up! Now level ${nextLv}.` : s.levelUpToast

          const partial: MigratedSnapshot = {
            ...s,
            scrap,
            xp,
            level: nextLv,
            trophies,
            arenaWins: wins,
            arenaLosses: losses,
            defeatedOpponents: Array.from(defeated),
            unlockedBadges: Array.from(badges),
          }

          const unlockedColors = collectColorUnlocks(partial)
          const achievementUnlocks = mergeAchievementUnlocks({
            ...partial,
            unlockedColors,
          })

          return {
            scrap,
            xp,
            level: nextLv,
            trophies,
            arenaWins: wins,
            arenaLosses: losses,
            defeatedOpponents: Array.from(defeated),
            unlockedBadges: Array.from(badges),
            unlockedColors,
            achievementUnlocks,
            levelUpToast,
          }
        })
      },

      resetProgress: () => {
        try {
          localStorage.removeItem(STORAGE_V1)
          localStorage.removeItem(STORAGE_V2)
        } catch {
          /* ignore */
        }
        const fresh = seed()
        set({ ...fresh, levelUpToast: null })
      },
    }),
    {
      name: STORAGE_V2,
      version: 4,
      partialize: (s) => ({
        scrap: s.scrap,
        xp: s.xp,
        level: s.level,
        trophies: s.trophies,
        selectedRobotId: s.selectedRobotId,
        robotName: s.robotName,
        paintColorId: s.paintColorId,
        upgradeLevels: s.upgradeLevels,
        unlockedColors: s.unlockedColors,
        completedMissions: s.completedMissions,
        questProgress: s.questProgress,
        arenaWins: s.arenaWins,
        arenaLosses: s.arenaLosses,
        defeatedOpponents: s.defeatedOpponents,
        unlockedBadges: s.unlockedBadges,
        achievementUnlocks: s.achievementUnlocks,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MigratedSnapshot>
        const merged: MigratedSnapshot = {
          ...DEFAULT_SNAPSHOT,
          ...current,
          ...p,
          upgradeLevels: {
            ...DEFAULT_SNAPSHOT.upgradeLevels,
            ...(p.upgradeLevels ?? {}),
          },
          questProgress: {
            ...DEFAULT_SNAPSHOT.questProgress,
            ...((current as MigratedSnapshot).questProgress ?? {}),
            ...(p.questProgress ?? {}),
          },
          achievementUnlocks: [
            ...new Set([
              ...(DEFAULT_SNAPSHOT.achievementUnlocks ?? []),
              ...((current as MigratedSnapshot).achievementUnlocks ?? []),
              ...(p.achievementUnlocks ?? []),
            ]),
          ],
        }
        merged.level = levelFromTotalXp(merged.xp)
        merged.unlockedColors = collectColorUnlocks(merged)
        merged.achievementUnlocks = mergeAchievementUnlocks(merged)
        return { ...current, ...merged, levelUpToast: null }
      },
    },
  ),
)

export function selectCombatStats(upgradeLevels: Record<UpgradeId, number>): CombatStats {
  return computeCombatStats(upgradeLevels)
}

export function selectRobotStats(upgradeLevels: Record<UpgradeId, number>) {
  const st = computeCombatStats(upgradeLevels)
  return {
    maxHp: st.hp,
    attack: st.power,
    defense: st.armor,
    speed: st.speed,
  }
}

export { xpProgress, rankFromTrophies, levelFromTotalXp } from '../utils/progression'

export function buildPlayerBattleProfile(
  state: Pick<MigratedSnapshot, 'robotName' | 'paintColorId' | 'upgradeLevels'>,
) {
  const st = computeCombatStats(state.upgradeLevels)
  return {
    name: state.robotName,
    colorId: state.paintColorId,
    maxHp: st.hp,
    maxEnergy: st.energy,
    power: st.power,
    armor: st.armor,
    speed: st.speed,
  }
}

export function buildPlayerCombatants(
  state: Pick<MigratedSnapshot, 'robotName' | 'paintColorId' | 'upgradeLevels'>,
) {
  const p = buildPlayerBattleProfile(state)
  return {
    name: p.name,
    colorId: p.colorId,
    maxHp: p.maxHp,
    attack: p.power,
    defense: p.armor,
    speed: p.speed,
  }
}
