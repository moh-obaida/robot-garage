import type { GameStateSlice } from '../store/gameTypes';
import {
  GARAGE_UPGRADE_ORDER,
  type GarageUpgradeId,
} from './garageUpgrades';
import { UNLOCK_NODE_ORDER } from './unlockTree';
import { MINIGAME_ORDER } from './minigameMeta';
import { robotLevelFromXp } from '../store/gameTypes';

export const BADGE_ORDER = [
  'first-boot',
  'triple-play',
  'yard-regular',
  'level-five',
  'deep-bench',
  'synced-in',
] as const;

export type BadgeId = (typeof BADGE_ORDER)[number];

export interface BadgeDef {
  id: BadgeId;
  title: string;
  blurb: string;
  claimScrap: number;
  claimXp: number;
  isUnlocked: (s: GameStateSlice) => boolean;
}

function countCompletedMinigames(s: GameStateSlice): number {
  let n = 0;
  for (const id of MINIGAME_ORDER) {
    if (s.minigames[id]?.completedOnce) n += 1;
  }
  return n;
}

function countActivatedUnlocks(s: GameStateSlice): number {
  let n = 0;
  for (const id of UNLOCK_NODE_ORDER) {
    if (s.unlockNodes[id]?.activated) n += 1;
  }
  return n;
}

function anyGarageTrackAtLeast(
  s: GameStateSlice,
  minLevel: number,
): boolean {
  for (const id of GARAGE_UPGRADE_ORDER) {
    const v = s.garageUpgrades[id as GarageUpgradeId];
    if (typeof v === 'number' && v >= minLevel) return true;
  }
  return false;
}

export const BADGE_DEFS: Record<BadgeId, BadgeDef> = {
  'first-boot': {
    id: 'first-boot',
    title: 'First Boot',
    blurb: 'Clear any training drill once.',
    claimScrap: 10,
    claimXp: 8,
    isUnlocked: (s) => countCompletedMinigames(s) >= 1,
  },
  'triple-play': {
    id: 'triple-play',
    title: 'Triple Play',
    blurb: 'Clear three different drills.',
    claimScrap: 18,
    claimXp: 14,
    isUnlocked: (s) => countCompletedMinigames(s) >= 3,
  },
  'yard-regular': {
    id: 'yard-regular',
    title: 'Yard Regular',
    blurb: 'Clear six drills — you live in the bay now.',
    claimScrap: 28,
    claimXp: 22,
    isUnlocked: (s) => countCompletedMinigames(s) >= 6,
  },
  'level-five': {
    id: 'level-five',
    title: 'Level Five Crew',
    blurb: 'Reach robot level 5.',
    claimScrap: 22,
    claimXp: 18,
    isUnlocked: (s) => robotLevelFromXp(s.xp) >= 5,
  },
  'deep-bench': {
    id: 'deep-bench',
    title: 'Deep Bench',
    blurb: 'Push any garage track to level 3.',
    claimScrap: 24,
    claimXp: 20,
    isUnlocked: (s) => anyGarageTrackAtLeast(s, 3),
  },
  'synced-in': {
    id: 'synced-in',
    title: 'Synced In',
    blurb: 'Activate three unlock tree nodes.',
    claimScrap: 30,
    claimXp: 24,
    isUnlocked: (s) => countActivatedUnlocks(s) >= 3,
  },
};
