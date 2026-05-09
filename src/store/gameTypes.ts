import type { MinigameId } from '../data/minigameMeta';
import type { GarageUpgradeId } from '../data/garageUpgrades';
import type { LaunchStepId } from '../data/launchReadiness';
import type { UnlockNodeId } from '../data/unlockTree';

export interface LaunchReadinessProgress {
  stepCompletion: Partial<Record<LaunchStepId, boolean>>;
  completionBonusClaimed: boolean;
}

export interface ComfortSettings {
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface MinigameProgress {
  unlocked: boolean;
  firstRewardClaimed: boolean;
  completedOnce: boolean;
  bestScore: number | null;
}

export interface BadgeProgress {
  unlocked: boolean;
  rewardClaimed: boolean;
}

export interface AchievementProgress {
  unlocked: boolean;
  rewardClaimed: boolean;
}

export interface UnlockNodeProgress {
  activated: boolean;
}

/** Subset passed into badge/achievement condition functions — avoids circular imports. */
export interface GameStateSlice {
  scrap: number;
  xp: number;
  minigames: Record<MinigameId, MinigameProgress>;
  garageUpgrades: Record<GarageUpgradeId, number>;
  unlockNodes: Record<UnlockNodeId, UnlockNodeProgress>;
  evolutionTier: number;
  rankedWins: number;
}

export const XP_PER_LEVEL = 50;

export function robotLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoCurrentLevel(xp: number): { level: number; into: number; need: number } {
  const level = robotLevelFromXp(xp);
  const into = xp % XP_PER_LEVEL;
  const need = XP_PER_LEVEL;
  return { level, into, need };
}
