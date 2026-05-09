export const EVOLUTION_MAX_TIER = 3;

export interface EvolutionTierDef {
  tier: number;
  title: string;
  blurb: string;
  scrapCost: number;
  minRobotLevel: number;
}

/** Tier 0 is default chassis; purchasing advances to tier 1..3 */
export const EVOLUTION_TIERS: EvolutionTierDef[] = [
  {
    tier: 1,
    title: 'Mk II Frame',
    blurb: 'Reinforced struts and brighter optics.',
    scrapCost: 80,
    minRobotLevel: 3,
  },
  {
    tier: 2,
    title: 'Mk III Frame',
    blurb: 'Hydraulic assist and duel-ready plating.',
    scrapCost: 140,
    minRobotLevel: 6,
  },
  {
    tier: 3,
    title: 'Mk IV Apex',
    blurb: 'Full sync with the garage core — showroom ready.',
    scrapCost: 220,
    minRobotLevel: 9,
  },
];

export function evolutionLabel(tier: number): string {
  if (tier <= 0) return 'Mk I Chassis';
  const def = EVOLUTION_TIERS.find((t) => t.tier === tier);
  return def?.title ?? `Mk I Chassis`;
}
