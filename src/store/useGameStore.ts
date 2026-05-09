import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COLORS } from '../data/colors'
import { MISSIONS } from '../data/missions'
import { computeStats, upgradePrice } from '../data/upgrades'
import type { RobotStats, UpgradeId, ViewId } from '../types/game'

const STORAGE_KEY = 'robot-garage-save-v1'

export interface GameSnapshot {
  scrap: number
  robotName: string
  paintColorId: string
  upgradeLevels: Record<UpgradeId, number>
  unlockedColors: string[]
  completedMissions: string[]
  arenaWins: number
  arenaLosses: number
  lastView: ViewId
}

const starterColors = COLORS.filter((c) => c.starter).map((c) => c.id)

interface GameState extends GameSnapshot {
  setView: (v: ViewId) => void
  renameRobot: (name: string) => void
  addScrap: (n: number) => void
  tryBuyUpgrade: (id: UpgradeId) => boolean
  tryCompleteMission: (missionId: string) => { ok: boolean; message?: string }
  tryUnlockColorWithScrap: (colorId: string) => { ok: boolean; message?: string }
  equipColor: (colorId: string) => { ok: boolean; message?: string }
  recordArenaResult: (won: boolean, scrapGain?: number) => void
  resetProgress: () => void
}

const defaultSnapshot: GameSnapshot = {
  scrap: 30,
  robotName: 'Unit-07',
  paintColorId: 'cyan',
  upgradeLevels: { chassis: 0, actuators: 0, plating: 0, gyros: 0 },
  unlockedColors: [...starterColors],
  completedMissions: [],
  arenaWins: 0,
  arenaLosses: 0,
  lastView: 'dashboard',
}

function missionAvailable(completed: string[], missionId: string): boolean {
  const m = MISSIONS.find((x) => x.id === missionId)
  if (!m) return false
  return m.requires.every((r) => completed.includes(r))
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...defaultSnapshot,

      setView: (v) => set({ lastView: v }),

      renameRobot: (name) => {
        const trimmed = name.trim().slice(0, 24) || 'Unit-07'
        set({ robotName: trimmed })
      },

      addScrap: (n) => set((s) => ({ scrap: Math.max(0, s.scrap + n) })),

      tryBuyUpgrade: (id) => {
        const state = get()
        const lv = state.upgradeLevels[id] ?? 0
        const cost = upgradePrice(id, lv)
        if (state.scrap < cost) return false
        set({
          scrap: state.scrap - cost,
          upgradeLevels: { ...state.upgradeLevels, [id]: lv + 1 },
        })
        return true
      },

      tryCompleteMission: (missionId) => {
        const state = get()
        const m = MISSIONS.find((x) => x.id === missionId)
        if (!m) return { ok: false, message: 'Unknown mission.' }
        if (state.completedMissions.includes(missionId)) {
          return { ok: false, message: 'Already completed.' }
        }
        if (!missionAvailable(state.completedMissions, missionId)) {
          return { ok: false, message: 'Prerequisites not met.' }
        }
        const newColors = new Set(state.unlockedColors)
        if (m.unlockColorId) newColors.add(m.unlockColorId)
        set({
          scrap: state.scrap + m.rewardScrap,
          completedMissions: [...state.completedMissions, missionId],
          unlockedColors: Array.from(newColors),
        })
        return { ok: true }
      },

      tryUnlockColorWithScrap: (colorId) => {
        const state = get()
        const c = COLORS.find((x) => x.id === colorId)
        if (!c) return { ok: false, message: 'Unknown finish.' }
        if (state.unlockedColors.includes(colorId)) {
          return { ok: false, message: 'Already unlocked.' }
        }
        if (c.scrapCost <= 0 && c.requiresMissionId) {
          return { ok: false, message: 'Earn this finish by completing its mission.' }
        }
        if (c.requiresMissionId && !state.completedMissions.includes(c.requiresMissionId)) {
          return { ok: false, message: 'Complete the linked mission first.' }
        }
        if (c.scrapCost <= 0) {
          return { ok: false, message: 'Not purchasable with scrap.' }
        }
        if (state.scrap < c.scrapCost) {
          return { ok: false, message: 'Not enough scrap.' }
        }
        set({
          scrap: state.scrap - c.scrapCost,
          unlockedColors: [...state.unlockedColors, colorId],
        })
        return { ok: true }
      },

      equipColor: (colorId) => {
        const state = get()
        if (!state.unlockedColors.includes(colorId)) {
          return { ok: false, message: 'Finish not unlocked.' }
        }
        set({ paintColorId: colorId })
        return { ok: true }
      },

      recordArenaResult: (won, scrapGain = 0) =>
        set((s) => ({
          scrap: won ? s.scrap + scrapGain : s.scrap,
          arenaWins: won ? s.arenaWins + 1 : s.arenaWins,
          arenaLosses: won ? s.arenaLosses : s.arenaLosses + 1,
        })),

      resetProgress: () => {
        localStorage.removeItem(STORAGE_KEY)
        set({ ...defaultSnapshot })
      },
    }),
    { name: STORAGE_KEY },
  ),
)

export function selectRobotStats(upgradeLevels: Record<UpgradeId, number>) {
  return computeStats(upgradeLevels)
}

export function selectCurrentHpCap(stats: RobotStats) {
  return stats.maxHp
}

/** For arena: clone stats for battle */
export function buildPlayerCombatants(
  state: Pick<GameSnapshot, 'robotName' | 'paintColorId' | 'upgradeLevels'>,
) {
  const stats = computeStats(state.upgradeLevels)
  return {
    name: state.robotName,
    maxHp: stats.maxHp,
    hp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    color: state.paintColorId,
  }
}
