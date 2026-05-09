/** App paths — each screen is its own route */
export const ROUTES = {
  play: '/',
  garage: '/garage',
  missions: '/missions',
  upgrade: '/upgrades',
  colors: '/colors',
  arena: '/arena',
  shop: '/shop',
  vehicles: '/vehicles',
  arcade: '/arcade',
  world: '/world',
} as const

export type UpgradeId = 'head' | 'arms' | 'body' | 'legs' | 'weapon' | 'core'

export interface CombatStats {
  power: number
  armor: number
  speed: number
  energy: number
  hp: number
}

export interface ColorDef {
  id: string
  name: string
  hex: string
  /** Scrap cost; 0 = mission / condition only */
  scrapCost: number
  requiresMissionId?: string
  requiresPvpWins?: number
  requiresDefeatOpponentId?: string
  requiresAllMissions?: boolean
  starter?: boolean
  comingSoon?: boolean
}

export interface ArenaOpponent {
  id: string
  callsign: string
  requiredLevel: number
  difficulty: string
  colorId: string
  power: number
  armor: number
  speed: number
  energy: number
  hp: number
  rewardScrap: number
  rewardXp: number
  rewardTrophies: number
  unlockColorId?: string
  unlockBadgeId?: string
}

export interface CharacterDef {
  id: string
  name: string
  role: string
  unlocked: boolean
}

export interface RobotCatalogEntry {
  id: string
  callsign: string
  type: string
  colorId: string
  locked: boolean
  requiredLevel?: number
}
