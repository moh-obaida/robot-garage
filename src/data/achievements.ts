import type { GameStateSlice } from '../store/gameTypes';
import { totalGarageUpgradeLevels } from './garageUpgrades';
import { UNLOCK_NODE_ORDER } from './unlockTree';
import { MINIGAME_ORDER } from './minigameMeta';
import { robotLevelFromXp } from '../store/gameTypes';

export const ACHIEVEMENT_ORDER = [
  'scrap-hoarder',
  'full-circuit',
  'garage-maestro',
  'fully-synced',
  'evolution-path',
  'veteran-pilot',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_ORDER)[number];

export interface AchievementDef {
  id: AchievementId;
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

function allUnlockNodesActive(s: GameStateSlice): boolean {
  for (const id of UNLOCK_NODE_ORDER) {
    if (!s.unlockNodes[id]?.activated) return false;
  }
  return true;
}

export const ACHIEVEMENT_DEFS: Record<AchievementId, AchievementDef> = {
  'scrap-hoarder': {
    id: 'scrap-hoarder',
    title: 'Scrap Hoarder',
    blurb: 'Stockpile 250 scrap in the bay.',
    claimScrap: 40,
    claimXp: 30,
    isUnlocked: (s) => s.scrap >= 250,
  },
  'full-circuit': {
    id: 'full-circuit',
    title: 'Full Circuit',
    blurb: 'Clear every workshop bench and Phase 7 arcade cabinet once.',
    claimScrap: 55,
    claimXp: 40,
    isUnlocked: (s) => countCompletedMinigames(s) >= MINIGAME_ORDER.length,
  },
  'garage-maestro': {
    id: 'garage-maestro',
    title: 'Garage Maestro',
    blurb: 'Invest 20 total levels across garage upgrades.',
    claimScrap: 50,
    claimXp: 36,
    isUnlocked: (s) => totalGarageUpgradeLevels(s.garageUpgrades) >= 20,
  },
  'fully-synced': {
    id: 'fully-synced',
    title: 'Fully Synced',
    blurb: 'Activate the entire unlock tree.',
    claimScrap: 60,
    claimXp: 44,
    isUnlocked: allUnlockNodesActive,
  },
  'evolution-path': {
    id: 'evolution-path',
    title: 'Evolution Path',
    blurb: 'Reach evolution stage 3.',
    claimScrap: 35,
    claimXp: 28,
    isUnlocked: (s) => s.evolutionTier >= 3,
  },
  'veteran-pilot': {
    id: 'veteran-pilot',
    title: 'Veteran Pilot',
    blurb: 'Reach robot level 10.',
    claimScrap: 45,
    claimXp: 38,
    isUnlocked: (s) => robotLevelFromXp(s.xp) >= 10,
  },
};
