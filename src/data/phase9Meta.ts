import type { RivalId } from './rivals';

export const SAVED_BUILD_SLOT_COUNT = 3;

/** One-time bonus for beating each ghost in async challenges (guarded in store). */
export const ASYNC_PVP_FIRST_WIN_REWARDS: Record<RivalId, { scrap: number; xp: number }> = {
  sparky: { scrap: 16, xp: 10 },
  'rust-titan': { scrap: 28, xp: 18 },
  'circuit-queen': { scrap: 44, xp: 28 },
};

/** Spotlight payout on the local leaderboard (guarded, once per save). */
export const LEADERBOARD_SPOTLIGHT = {
  minRankedWins: 2,
  scrap: 26,
  xp: 20,
} as const;
