/** Phase 6 — vehicle minigame tuning (data separate from UI). */

export const garageKartConfig = {
  tickMs: 380,
  lanes: 3,
  dodgesToWin: 12,
  obstacleSpeed: 14,
  spawnEveryTicks: 2,
  collisionBand: { min: 68, max: 92 } as const,
} as const;

export const scrapRacerConfig = {
  rounds: 6,
  cueMs: 2000,
} as const;

/** Junkyard drill (Scrap Racer) — easy teaching, standard shop floor, optional challenge. */
export type JunkyardDrillDifficulty = 'easy' | 'standard' | 'challenge';

export const JUNKYARD_DRILL: Record<
  JunkyardDrillDifficulty,
  { rounds: number; cueMs: number; label: string; loseTip: string }
> = {
  easy: {
    rounds: 4,
    cueMs: 2600,
    label: 'Easy — long light window, fewer pulls',
    loseTip: 'Tip: read the arrow label out loud once before you commit.',
  },
  standard: {
    rounds: scrapRacerConfig.rounds,
    cueMs: scrapRacerConfig.cueMs,
    label: 'Standard — yard timing',
    loseTip: 'Tip: stage your finger over the correct haul before the pulse ends.',
  },
  challenge: {
    rounds: 8,
    cueMs: 1450,
    label: 'Challenge — hot shifts (unlock after first clear)',
    loseTip:
      'Tip: warm up on Easy. Challenge rewards clean reads, not wild guesses.',
  },
};

export const batteryDeliveryConfig = {
  stops: 3,
  depotCount: 3,
} as const;

export const hoverBoardConfig = {
  tickMs: 420,
  stableTicksToWin: 8,
  driftStrength: 0.12,
  nudge: 0.22,
  band: {
    easy: 0.52,
    standard: 0.34,
    challenge: 0.2,
  } as const,
} as const;

export const magnetTruckConfig = {
  tickMs: 320,
  catchesToWin: 9,
  totalDrops: 22,
  fallSpeed: 10,
  magnetWidth: 22,
  fieldHeight: 100,
} as const;

export const obstacleAlleyConfig = {
  rounds: 6,
  reactMs: 1400,
} as const;

export const timeTrialConfig = {
  checkpoints: 4,
  memorizeMs: 1200,
  totalMs: 14000,
} as const;

export const vehicleUpgradeConfig = {
  steps: 3,
  choices: 3,
} as const;
