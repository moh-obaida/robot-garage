import {
  ACHIEVEMENT_DEFS,
  ACHIEVEMENT_ORDER,
  type AchievementId,
} from '../data/achievements';
import { BADGE_DEFS, BADGE_ORDER } from '../data/badges';
import type { BadgeId } from '../data/badges';
import type {
  AchievementProgress,
  BadgeProgress,
  GameStateSlice,
} from './gameTypes';

export type HonorsSlice = GameStateSlice & {
  badges: Record<BadgeId, BadgeProgress>;
  achievements: Record<AchievementId, AchievementProgress>;
};

/** Sets unlocked flags when conditions are met. Does not grant rewards. */
export function applyHonorUnlocks<T extends HonorsSlice>(state: T): T {
  let badges = state.badges;
  let achievements = state.achievements;
  let badgeTouch = false;
  let achievementTouch = false;

  for (const id of BADGE_ORDER) {
    const row = badges[id];
    if (!row.unlocked && BADGE_DEFS[id].isUnlocked(state)) {
      badges = { ...badges, [id]: { ...row, unlocked: true } };
      badgeTouch = true;
    }
  }

  for (const id of ACHIEVEMENT_ORDER) {
    const row = achievements[id];
    if (!row.unlocked && ACHIEVEMENT_DEFS[id].isUnlocked(state)) {
      achievements = {
        ...achievements,
        [id]: { ...row, unlocked: true },
      };
      achievementTouch = true;
    }
  }

  if (!badgeTouch && !achievementTouch) return state;
  return { ...state, badges, achievements };
}
