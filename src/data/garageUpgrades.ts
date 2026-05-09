export const GARAGE_UPGRADE_ORDER = [
  'power-coil',
  'sensor-grid',
  'armor-weave',
  'workshop-tools',
] as const;

export type GarageUpgradeId = (typeof GARAGE_UPGRADE_ORDER)[number];

export interface GarageUpgradeDef {
  id: GarageUpgradeId;
  title: string;
  blurb: string;
  maxLevel: number;
  /** Scrap cost for upgrading from level L → L+1 (L is current level). */
  costForLevel: (level: number) => number;
  /** Minimum robot level (1-based) required to hold this upgrade level after purchase. */
  minRobotLevelForNext: (currentLevel: number) => number;
}

export const GARAGE_UPGRADES: Record<GarageUpgradeId, GarageUpgradeDef> = {
  'power-coil': {
    id: 'power-coil',
    title: 'Power Coil',
    blurb: 'Stabilizes bus voltage — extra scrap from successful field tests.',
    maxLevel: 5,
    costForLevel: (level) => 18 + level * 12,
    minRobotLevelForNext: (currentLevel) => currentLevel + 1,
  },
  'sensor-grid': {
    id: 'sensor-grid',
    title: 'Sensor Grid',
    blurb: 'Sharper telemetry — bonus XP when you clear training drills.',
    maxLevel: 5,
    costForLevel: (level) => 20 + level * 11,
    minRobotLevelForNext: (currentLevel) => currentLevel + 1,
  },
  'armor-weave': {
    id: 'armor-weave',
    title: 'Armor Weave',
    blurb: 'Hardens the frame — small scrap drip even on repeat clears.',
    maxLevel: 5,
    costForLevel: (level) => 22 + level * 10,
    minRobotLevelForNext: (currentLevel) => Math.max(2, currentLevel + 1),
  },
  'workshop-tools': {
    id: 'workshop-tools',
    title: 'Workshop Tools',
    blurb: 'Better fixtures — boosts every payout from the garage floor.',
    maxLevel: 5,
    costForLevel: (level) => 24 + level * 14,
    minRobotLevelForNext: (currentLevel) => Math.max(2, currentLevel + 1),
  },
};

export function totalGarageUpgradeLevels(
  levels: Record<GarageUpgradeId, number>,
): number {
  let sum = 0;
  for (const id of GARAGE_UPGRADE_ORDER) {
    const n = levels[id];
    if (typeof n === 'number' && n > 0) sum += n;
  }
  return sum;
}
