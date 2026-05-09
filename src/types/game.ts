export type ViewId = 'dashboard' | 'garage' | 'upgrades' | 'missions' | 'colors' | 'arena'

export type UpgradeId = 'chassis' | 'actuators' | 'plating' | 'gyros'

export interface RobotStats {
  maxHp: number
  attack: number
  defense: number
  speed: number
}

export interface MissionDef {
  id: string
  name: string
  description: string
  rewardScrap: number
  /** Mission ids that must be completed first */
  requires: string[]
  /** Color id unlocked on first completion (in addition to scrap) */
  unlockColorId?: string
}

export interface ColorDef {
  id: string
  name: string
  hex: string
  /** Scrap cost; 0 = default or mission-only */
  scrapCost: number
  /** If set, must complete this mission (once) to allow purchase or use */
  requiresMissionId?: string
  starter?: boolean
}

export interface ArenaOpponent {
  id: string
  callsign: string
  maxHp: number
  attack: number
  defense: number
  speed: number
  winScrap: number
}
