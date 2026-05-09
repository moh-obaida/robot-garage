/** Tunables for vehicle-themed mini-games. */

export const garageKartConfig = {
  lanes: 3,
  obstacleSpeed: 8,
  collisionBand: { min: 78, max: 94 },
  spawnEveryTicks: 4,
  dodgesToWin: 12,
  tickMs: 120,
} as const

export const scrapRacerConfig = {
  rounds: 5,
  cueMs: 1800,
} as const

export const batteryDeliveryConfig = {
  stops: 3,
  depotCount: 3,
} as const

export const hoverBoardConfig = {
  band: { easy: 0.45, standard: 0.28, challenge: 0.15 },
  driftStrength: 0.08,
  stableTicksToWin: 28,
  tickMs: 100,
  nudge: 0.12,
} as const

export const magnetTruckConfig = {
  magnetWidth: 18,
  fallSpeed: 5,
  fieldHeight: 92,
  catchesToWin: 6,
  totalDrops: 14,
  tickMs: 80,
} as const

export const obstacleAlleyConfig = {
  reactMs: 2000,
  rounds: 6,
} as const

export const timeTrialConfig = {
  checkpoints: 4,
  memorizeMs: 650,
  totalMs: 12_000,
} as const

export const vehicleUpgradeConfig = {
  steps: 3,
} as const
