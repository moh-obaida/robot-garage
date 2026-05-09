import type { CombatStats, UpgradeId } from '../types/game'
import { upgradeCostForStep } from '../utils/progression'

export const UPGRADE_META: Record<
  UpgradeId,
  { label: string; description: string; short: string }
> = {
  head: {
    label: 'Head module',
    description: '+1 Energy per level beyond the first.',
    short: 'HEAD',
  },
  arms: {
    label: 'Arm actuators',
    description: '+2 Power per level beyond the first.',
    short: 'ARMS',
  },
  body: {
    label: 'Body frame',
    description: '+2 Armor and +10 HP per level beyond the first.',
    short: 'BODY',
  },
  legs: {
    label: 'Leg drives',
    description: '+2 Speed per level beyond the first.',
    short: 'LEGS',
  },
  weapon: {
    label: 'Weapon mount',
    description: '+3 Power per level beyond the first.',
    short: 'WEAPON',
  },
  core: {
    label: 'Power core',
    description: '+2 Energy, +15 HP per level; +1 Power/Armor/Speed every 2 levels.',
    short: 'CORE',
  },
}

const BASE: CombatStats = {
  power: 8,
  armor: 6,
  speed: 6,
  energy: 40,
  hp: 100,
}

/** Level is 1–5. Bonuses apply for levels above 1. */
export function computeCombatStats(levels: Record<UpgradeId, number>): CombatStats {
  const h = Math.max(1, Math.min(5, levels.head ?? 1))
  const a = Math.max(1, Math.min(5, levels.arms ?? 1))
  const b = Math.max(1, Math.min(5, levels.body ?? 1))
  const l = Math.max(1, Math.min(5, levels.legs ?? 1))
  const w = Math.max(1, Math.min(5, levels.weapon ?? 1))
  const c = Math.max(1, Math.min(5, levels.core ?? 1))

  const hd = h - 1
  const ad = a - 1
  const bd = b - 1
  const ld = l - 1
  const wd = w - 1
  const cd = c - 1

  let power = BASE.power + ad * 2 + wd * 3
  let armor = BASE.armor + bd * 2
  let speed = BASE.speed + ld * 2
  const energy = BASE.energy + hd * 1 + cd * 2
  const hp = BASE.hp + bd * 10 + cd * 15

  const coreTri = Math.floor(c / 2)
  power += coreTri
  armor += coreTri
  speed += coreTri

  return {
    power: Math.max(1, power),
    armor: Math.max(1, armor),
    speed: Math.max(1, speed),
    energy: Math.max(10, energy),
    hp: Math.max(20, hp),
  }
}

export function nextUpgradeCost(_id: UpgradeId, currentLevel: number): number | null {
  return upgradeCostForStep(currentLevel)
}
