import type { RobotStats, UpgradeId } from '../types/game'

export const BASE_ROBOT: RobotStats = {
  maxHp: 100,
  attack: 12,
  defense: 4,
  speed: 10,
}

export const UPGRADE_META: Record<
  UpgradeId,
  { label: string; description: string; baseCost: number; perLevel: Partial<RobotStats> }
> = {
  chassis: {
    label: 'Reinforced Chassis',
    description: '+8 max HP per level. Stay in the fight longer.',
    baseCost: 22,
    perLevel: { maxHp: 8 },
  },
  actuators: {
    label: 'Kinetic Actuators',
    description: '+2 attack per level. Hit harder in the arena.',
    baseCost: 26,
    perLevel: { attack: 2 },
  },
  plating: {
    label: 'Composite Plating',
    description: '+1 defense per level. Soak incoming damage.',
    baseCost: 24,
    perLevel: { defense: 1 },
  },
  gyros: {
    label: 'Precision Gyros',
    description: '+1 speed per level. Better initiative and tempo.',
    baseCost: 20,
    perLevel: { speed: 1 },
  },
}

export function upgradePrice(id: UpgradeId, currentLevel: number): number {
  const { baseCost } = UPGRADE_META[id]
  return Math.floor(baseCost * Math.pow(1.32, currentLevel))
}

export function computeStats(levels: Record<UpgradeId, number>): RobotStats {
  const s: RobotStats = { ...BASE_ROBOT }
  ;(Object.keys(UPGRADE_META) as UpgradeId[]).forEach((id) => {
    const lv = levels[id] ?? 0
    const p = UPGRADE_META[id].perLevel
    if (p.maxHp) s.maxHp += p.maxHp * lv
    if (p.attack) s.attack += p.attack * lv
    if (p.defense) s.defense += p.defense * lv
    if (p.speed) s.speed += p.speed * lv
  })
  return s
}
