import type { MissionDef } from '../types/game'

export const MISSIONS: MissionDef[] = [
  {
    id: 'boot-sequence',
    name: 'Boot Sequence',
    description: 'Run diagnostics and calibrate servos. Low risk, steady payout.',
    rewardScrap: 18,
    requires: [],
  },
  {
    id: 'patrol-grid',
    name: 'Grid Patrol',
    description: 'Sweep the perimeter lanes. Expect light resistance.',
    rewardScrap: 32,
    requires: ['boot-sequence'],
  },
  {
    id: 'core-dust',
    name: 'Core Dust Run',
    description: 'Recover coolant cores from a derelict bay. Unlocks a premium finish.',
    rewardScrap: 48,
    requires: ['patrol-grid'],
    unlockColorId: 'gold',
  },
  {
    id: 'signal-hunt',
    name: 'Signal Hunt',
    description: 'Triangulate a rogue beacon through interference. Rewards crimson plating.',
    rewardScrap: 40,
    requires: ['patrol-grid'],
    unlockColorId: 'crimson',
  },
  {
    id: 'deep-sync',
    name: 'Deep Sync',
    description: 'Long-range uplink through a storm. Only for tuned chassis.',
    rewardScrap: 55,
    requires: ['core-dust', 'signal-hunt'],
    unlockColorId: 'violet',
  },
]
