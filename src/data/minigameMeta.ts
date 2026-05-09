export const MINIGAME_ORDER = [
  'wire-repair',
  'junkyard',
  'speed-test',
  'core-charge',
  'balance-test',
  'obstacle-alley',
  'training-battle',
  'memory-circuit',
  'part-assembly',
  /** Phase 7 — classic arcade bay */
  'block-breaker',
  'memory-lights',
  'maze-bot',
  'falling-parts',
  'target-blaster',
  'pipe-connector',
  'rhythm-repair',
  'arcade-scoreboards',
] as const;

export type MinigameId = (typeof MINIGAME_ORDER)[number];

export interface MinigameMeta {
  id: MinigameId;
  title: string;
  blurb: string;
  firstRewardScrap: number;
  firstRewardXp: number;
}

/** Phase 6 vehicle bay — IDs unchanged for localStorage compatibility. */
export const MINIGAME_META: Record<MinigameId, MinigameMeta> = {
  'wire-repair': {
    id: 'wire-repair',
    title: 'Garage Kart Sprint',
    blurb: 'Swap lanes on the shop floor run — dodge rolling scrap until the pit lane opens.',
    firstRewardScrap: 28,
    firstRewardXp: 16,
  },
  junkyard: {
    id: 'junkyard',
    title: 'Scrap Racer',
    blurb: 'Hit the arrow the hauler flashes before the light times out — six clean shifts.',
    firstRewardScrap: 32,
    firstRewardXp: 18,
  },
  'speed-test': {
    id: 'speed-test',
    title: 'Battery Delivery Run',
    blurb: 'Route three power cells to the right depot bays in order — no wrong drops.',
    firstRewardScrap: 30,
    firstRewardXp: 19,
  },
  'core-charge': {
    id: 'core-charge',
    title: 'Hover Board Trial',
    blurb: 'Pick a deck tuning, then nudge against drift to stay inside the cyan stability band.',
    firstRewardScrap: 34,
    firstRewardXp: 21,
  },
  'balance-test': {
    id: 'balance-test',
    title: 'Magnet Truck Haul',
    blurb: 'Slide the boom under falling scrap — snag enough loads before the yard clears out.',
    firstRewardScrap: 33,
    firstRewardXp: 20,
  },
  'obstacle-alley': {
    id: 'obstacle-alley',
    title: 'Obstacle Alley',
    blurb: 'Low bar? Duck. High beam? Jump. Read the hazard and react before it clips you.',
    firstRewardScrap: 36,
    firstRewardXp: 22,
  },
  'training-battle': {
    id: 'training-battle',
    title: 'Ranked Pit',
    blurb:
      'Triangle combat: Strike, Guard, Overload. Budget energy, pick a rival, and chase ranked trophies.',
    firstRewardScrap: 40,
    firstRewardXp: 26,
  },
  'memory-circuit': {
    id: 'memory-circuit',
    title: 'Neon Time Trial',
    blurb: 'Memorize the gate order, then punch all checkpoints before the clock bleeds out.',
    firstRewardScrap: 35,
    firstRewardXp: 23,
  },
  'part-assembly': {
    id: 'part-assembly',
    title: 'Upgrade Stack',
    blurb: 'Bolt the drivetrain kit in the spec order — tires, shocks, then torque hub.',
    firstRewardScrap: 38,
    firstRewardXp: 24,
  },
  'block-breaker': {
    id: 'block-breaker',
    title: 'Scrap Brick Breaker',
    blurb: 'Bounce the energy core through the scrap wall — clear every tile without dropping.',
    firstRewardScrap: 42,
    firstRewardXp: 26,
  },
  'memory-lights': {
    id: 'memory-lights',
    title: 'Memory Lights',
    blurb: 'Watch the panel pulse, then tap the same order — pattern grows each round.',
    firstRewardScrap: 40,
    firstRewardXp: 25,
  },
  'maze-bot': {
    id: 'maze-bot',
    title: 'Maze Bot',
    blurb: 'Guide the service drone through the maintenance grid to the charge pad.',
    firstRewardScrap: 41,
    firstRewardXp: 25,
  },
  'falling-parts': {
    id: 'falling-parts',
    title: 'Falling Parts',
    blurb: 'Catch gears in the hopper — pick Easy, Standard, or Challenge drop speed.',
    firstRewardScrap: 43,
    firstRewardXp: 27,
  },
  'target-blaster': {
    id: 'target-blaster',
    title: 'Target Blaster',
    blurb: 'Targets flash on the bay wall — tap them before the timer burns out.',
    firstRewardScrap: 42,
    firstRewardXp: 26,
  },
  'pipe-connector': {
    id: 'pipe-connector',
    title: 'Coolant Pipes',
    blurb: 'Rotate each junction until coolant flows from the inlet to the manifold.',
    firstRewardScrap: 44,
    firstRewardXp: 28,
  },
  'rhythm-repair': {
    id: 'rhythm-repair',
    title: 'Rhythm Repair',
    blurb: 'Hit the sync pad on the beat — six clean stamps calibrate the line.',
    firstRewardScrap: 45,
    firstRewardXp: 29,
  },
  'arcade-scoreboards': {
    id: 'arcade-scoreboards',
    title: 'Arcade Scoreboards',
    blurb: 'Review your personal bests across the bay, then stamp them to the hall ledger.',
    firstRewardScrap: 35,
    firstRewardXp: 22,
  },
};
