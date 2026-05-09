export const UNLOCK_NODE_ORDER = [
  'telemetry-uplink',
  'rigging-harness',
  'composite-lattice',
  'neural-bus',
  'sync-core',
] as const;

export type UnlockNodeId = (typeof UNLOCK_NODE_ORDER)[number];

export interface UnlockNodeDef {
  id: UnlockNodeId;
  title: string;
  blurb: string;
  scrapCost: number;
  /** Minimum robot level (1-based) to activate. */
  minRobotLevel: number;
  firstRewardScrap: number;
  firstRewardXp: number;
}

export const UNLOCK_NODES: Record<UnlockNodeId, UnlockNodeDef> = {
  'telemetry-uplink': {
    id: 'telemetry-uplink',
    title: 'Telemetry Uplink',
    blurb: 'Patch into the yard grid — one-time calibration payout.',
    scrapCost: 35,
    minRobotLevel: 2,
    firstRewardScrap: 15,
    firstRewardXp: 12,
  },
  'rigging-harness': {
    id: 'rigging-harness',
    title: 'Rigging Harness',
    blurb: 'Lock heavy salvage lines — safer pulls, bigger bonus.',
    scrapCost: 55,
    minRobotLevel: 3,
    firstRewardScrap: 22,
    firstRewardXp: 16,
  },
  'composite-lattice': {
    id: 'composite-lattice',
    title: 'Composite Lattice',
    blurb: 'Reinforce joints for high-G tests.',
    scrapCost: 75,
    minRobotLevel: 4,
    firstRewardScrap: 28,
    firstRewardXp: 20,
  },
  'neural-bus': {
    id: 'neural-bus',
    title: 'Neural Bus',
    blurb: 'Widen the reflex lane for battle drills.',
    scrapCost: 95,
    minRobotLevel: 5,
    firstRewardScrap: 35,
    firstRewardXp: 26,
  },
  'sync-core': {
    id: 'sync-core',
    title: 'Sync Core',
    blurb: 'Master clock for the whole bay — capstone unlock.',
    scrapCost: 120,
    minRobotLevel: 6,
    firstRewardScrap: 45,
    firstRewardXp: 32,
  },
};

export function unlockPrerequisite(
  id: UnlockNodeId,
): UnlockNodeId | null {
  const idx = UNLOCK_NODE_ORDER.indexOf(id);
  if (idx <= 0) return null;
  return UNLOCK_NODE_ORDER[idx - 1];
}
