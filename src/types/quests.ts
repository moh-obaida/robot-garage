export type JunkyardDifficulty = 'easy' | 'standard' | 'challenge'

export type MiniGameKind =
  | 'coreCharge'
  | 'wireRepair'
  | 'junkyardSearch'
  | 'speedTest'
  | 'balanceTest'
  | 'trainingBattle'
  | 'memoryCircuit'
  | 'garageKart'
  | 'scrapRacer'
  | 'batteryDelivery'
  | 'hoverBoard'
  | 'magnetTruck'
  | 'obstacleAlley'
  | 'timeTrial'
  | 'vehicleUpgrade'

export type QuestType = 'story' | 'minigame'

export interface QuestDef {
  id: string
  name: string
  description: string
  /** Short line shown before play */
  instruction: string
  requiredLevel: number
  rewardScrap: number
  rewardXp: number
  requires: string[]
  unlockColorId?: string
  unlockBadgeId?: string
  type: QuestType
  miniGame?: MiniGameKind
  junkyardDifficulty?: JunkyardDifficulty
  /** For score-based minigames: minimum score to count as mission success */
  passScore?: number
}

export interface MiniGameResult {
  success: boolean
  /** Higher is better where applicable */
  score?: number
}
