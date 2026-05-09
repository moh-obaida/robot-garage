import type { RivalTier } from '../data/rivals';

/** Local async ghost bout — forgiving odds scale slightly with pilot level. */
export function rollAsyncGhostWin(tier: RivalTier, pilotLevel: number): boolean {
  const base =
    tier === 'easy' ? 0.7 : tier === 'standard' ? 0.48 : 0.3;
  const bump = Math.min(0.2, pilotLevel * 0.012);
  return Math.random() < Math.min(0.92, base + bump);
}
