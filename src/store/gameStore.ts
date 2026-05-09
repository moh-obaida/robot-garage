import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MINIGAME_META,
  MINIGAME_ORDER,
  type MinigameId,
} from '../data/minigameMeta';
import {
  GARAGE_UPGRADE_ORDER,
  GARAGE_UPGRADES,
  type GarageUpgradeId,
  totalGarageUpgradeLevels,
} from '../data/garageUpgrades';
import {
  UNLOCK_NODES,
  UNLOCK_NODE_ORDER,
  type UnlockNodeId,
  unlockPrerequisite,
} from '../data/unlockTree';
import { BADGE_DEFS, BADGE_ORDER, type BadgeId } from '../data/badges';
import {
  ACHIEVEMENT_DEFS,
  ACHIEVEMENT_ORDER,
  type AchievementId,
} from '../data/achievements';
import { EVOLUTION_TIERS, EVOLUTION_MAX_TIER } from '../data/evolution';
import {
  allLaunchStepsComplete,
  LAUNCH_COMPLETION_SCRAP,
  LAUNCH_COMPLETION_XP,
  LAUNCH_STEP_ORDER,
  type LaunchStepId,
} from '../data/launchReadiness';
import type {
  AchievementProgress,
  BadgeProgress,
  ComfortSettings,
  LaunchReadinessProgress,
  MinigameProgress,
  UnlockNodeProgress,
} from './gameTypes';
import {
  robotLevelFromXp,
  xpIntoCurrentLevel,
  XP_PER_LEVEL,
} from './gameTypes';
import { applyHonorUnlocks } from './honorsSync';
import {
  CHAPTER_DEFS,
  CHAPTER_ORDER,
  createDefaultChapterProgress,
  type ChapterId,
  type ChapterProgress,
} from '../data/storyChapters';
import {
  DEFAULT_ROBOT_ID,
  ROBOT_DEFS,
  robotIsAvailable,
  type RobotId,
} from '../data/robots';
import {
  PAINT_DEFS,
  PAINT_ORDER,
  createDefaultPaintsOwned,
  DEFAULT_PAINT_ID,
  type PaintId,
} from '../data/cosmetics';
import {
  BOSS_DEFS,
  BOSS_ORDER,
  createDefaultBossProgress,
  type BossId,
  type BossProgress,
} from '../data/worldBosses';
import {
  FACTORY_FIRST_SCRAP,
  FACTORY_FIRST_XP,
  FACTORY_REPEAT_SCRAP,
  FACTORY_REPEAT_XP,
} from '../data/factoryLine';
import {
  TROPHY_META,
  TROPHY_ORDER,
  type TrophyId,
} from '../data/pvpTrophies';
import {
  ASYNC_PVP_FIRST_WIN_REWARDS,
  LEADERBOARD_SPOTLIGHT,
  SAVED_BUILD_SLOT_COUNT,
} from '../data/phase9Meta';
import { RIVAL_META, RIVAL_ORDER, type RivalId } from '../data/rivals';

export const SAVE_VERSION = 8;

export type { MinigameProgress };

export interface GameSnapshot {
  scrap: number;
  xp: number;
  rankedWins: number;
  comfort: ComfortSettings;
  launchReadiness: LaunchReadinessProgress;
  minigames: Record<MinigameId, MinigameProgress>;
  garageUpgrades: Record<GarageUpgradeId, number>;
  unlockNodes: Record<UnlockNodeId, UnlockNodeProgress>;
  badges: Record<BadgeId, BadgeProgress>;
  achievements: Record<AchievementId, AchievementProgress>;
  evolutionTier: number;
  trophyClaimed: Record<TrophyId, boolean>;
  chapters: Record<ChapterId, ChapterProgress>;
  selectedRobotId: RobotId;
  paintsOwned: Record<PaintId, boolean>;
  equippedPaintId: PaintId;
  factoryFirstRewardClaimed: boolean;
  bosses: Record<BossId, BossProgress>;
  /** Phase 9 — first win vs each async ghost pays once. */
  asyncPvpFirstWinClaimed: Record<RivalId, boolean>;
  /** Phase 9 — one-time leaderboard spotlight payout. */
  leaderboardBonusClaimed: boolean;
  savedBuildSlots: SavedBuildSlots;
  /** Ephemeral player feedback; omitted from persist partialize. */
  rewardFlash: string | null;
}

export interface MinigameResultInput {
  won: boolean;
  /** Normalized so higher is always better for storage. */
  scoreIfWin?: number;
}

/** Garage-only snapshot for multiplayer prep build slots (no currency). */
export interface SavedBuildSnapshot {
  name: string;
  savedAt: number;
  garageUpgrades: Record<GarageUpgradeId, number>;
  evolutionTier: number;
}

export type SavedBuildSlot = SavedBuildSnapshot | null;
export type SavedBuildSlots = [
  SavedBuildSlot,
  SavedBuildSlot,
  SavedBuildSlot,
];

function defaultMinigameProgress(): MinigameProgress {
  return {
    unlocked: false,
    firstRewardClaimed: false,
    completedOnce: false,
    bestScore: null,
  };
}

export function createDefaultMinigames(): Record<MinigameId, MinigameProgress> {
  const base = {} as Record<MinigameId, MinigameProgress>;
  for (const id of MINIGAME_ORDER) {
    base[id] = defaultMinigameProgress();
  }
  base[MINIGAME_ORDER[0]].unlocked = true;
  return base;
}

function defaultGarageLevels(): Record<GarageUpgradeId, number> {
  const base = {} as Record<GarageUpgradeId, number>;
  for (const id of GARAGE_UPGRADE_ORDER) {
    base[id] = 0;
  }
  return base;
}

function defaultUnlockNodes(): Record<UnlockNodeId, UnlockNodeProgress> {
  const base = {} as Record<UnlockNodeId, UnlockNodeProgress>;
  for (const id of UNLOCK_NODE_ORDER) {
    base[id] = { activated: false };
  }
  return base;
}

function defaultBadges(): Record<BadgeId, BadgeProgress> {
  const base = {} as Record<BadgeId, BadgeProgress>;
  for (const id of BADGE_ORDER) {
    base[id] = { unlocked: false, rewardClaimed: false };
  }
  return base;
}

function defaultAchievements(): Record<AchievementId, AchievementProgress> {
  const base = {} as Record<AchievementId, AchievementProgress>;
  for (const id of ACHIEVEMENT_ORDER) {
    base[id] = { unlocked: false, rewardClaimed: false };
  }
  return base;
}

function garagePayoutBonus(levelsSum: number, firstClear: boolean): {
  scrap: number;
  xp: number;
} {
  if (firstClear) {
    return {
      scrap: Math.floor(levelsSum * 2.2),
      xp: Math.floor(levelsSum * 0.65),
    };
  }
  return {
    scrap: Math.max(1, Math.floor(levelsSum * 0.85)),
    xp: Math.max(1, Math.floor(levelsSum * 0.35)),
  };
}

/** Keeps the linear unlock chain coherent when new minigame IDs are added. */
function repairSequentialUnlocks(
  m: Record<MinigameId, MinigameProgress>,
): Record<MinigameId, MinigameProgress> {
  const out = { ...m };
  out[MINIGAME_ORDER[0]] = { ...out[MINIGAME_ORDER[0]], unlocked: true };
  for (let i = 0; i < MINIGAME_ORDER.length - 1; i++) {
    const cur = MINIGAME_ORDER[i];
    if (out[cur]?.completedOnce) {
      const nextId = MINIGAME_ORDER[i + 1];
      out[nextId] = { ...out[nextId], unlocked: true };
    }
  }
  return out;
}

function mergeMinigames(
  incoming: Partial<Record<MinigameId, Partial<MinigameProgress>>> | undefined,
): Record<MinigameId, MinigameProgress> {
  const fresh = createDefaultMinigames();
  if (!incoming) return repairSequentialUnlocks(fresh);
  for (const id of MINIGAME_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      ...fresh[id],
      unlocked: Boolean(patch.unlocked),
      firstRewardClaimed: Boolean(patch.firstRewardClaimed),
      completedOnce: Boolean(patch.completedOnce),
      bestScore:
        typeof patch.bestScore === 'number' && Number.isFinite(patch.bestScore)
          ? patch.bestScore
          : patch.bestScore === null
            ? null
            : fresh[id].bestScore,
    };
  }
  return repairSequentialUnlocks(fresh);
}

function mergeGarage(
  incoming: Partial<Record<GarageUpgradeId, number>> | undefined,
): Record<GarageUpgradeId, number> {
  const fresh = defaultGarageLevels();
  if (!incoming) return fresh;
  for (const id of GARAGE_UPGRADE_ORDER) {
    const v = incoming[id];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      fresh[id] = Math.min(GARAGE_UPGRADES[id].maxLevel, Math.floor(v));
    }
  }
  return fresh;
}

function mergeUnlockNodes(
  incoming:
    | Partial<Record<UnlockNodeId, Partial<UnlockNodeProgress>>>
    | undefined,
): Record<UnlockNodeId, UnlockNodeProgress> {
  const fresh = defaultUnlockNodes();
  if (!incoming) return fresh;
  for (const id of UNLOCK_NODE_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      activated: Boolean(patch.activated),
    };
  }
  return fresh;
}

function mergeBadges(
  incoming: Partial<Record<BadgeId, Partial<BadgeProgress>>> | undefined,
): Record<BadgeId, BadgeProgress> {
  const fresh = defaultBadges();
  if (!incoming) return fresh;
  for (const id of BADGE_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      unlocked: Boolean(patch.unlocked),
      rewardClaimed: Boolean(patch.rewardClaimed),
    };
  }
  return fresh;
}

function mergeAchievements(
  incoming:
    | Partial<Record<AchievementId, Partial<AchievementProgress>>>
    | undefined,
): Record<AchievementId, AchievementProgress> {
  const fresh = defaultAchievements();
  if (!incoming) return fresh;
  for (const id of ACHIEVEMENT_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      unlocked: Boolean(patch.unlocked),
      rewardClaimed: Boolean(patch.rewardClaimed),
    };
  }
  return fresh;
}

function defaultComfort(): ComfortSettings {
  return { reducedMotion: false, highContrast: false };
}

function mergeComfort(
  incoming: Partial<ComfortSettings> | undefined,
): ComfortSettings {
  const fresh = defaultComfort();
  if (!incoming) return fresh;
  return {
    reducedMotion: Boolean(incoming.reducedMotion),
    highContrast: Boolean(incoming.highContrast),
  };
}

function defaultLaunchReadiness(): LaunchReadinessProgress {
  return { stepCompletion: {}, completionBonusClaimed: false };
}

function mergeLaunchReadiness(
  incoming: Partial<LaunchReadinessProgress> | undefined,
): LaunchReadinessProgress {
  const fresh = defaultLaunchReadiness();
  if (!incoming) return fresh;
  const stepCompletion: Partial<Record<LaunchStepId, boolean>> = {
    ...fresh.stepCompletion,
  };
  if (incoming.stepCompletion) {
    for (const id of LAUNCH_STEP_ORDER) {
      if (incoming.stepCompletion[id] === true) {
        stepCompletion[id] = true;
      }
    }
  }
  return {
    stepCompletion,
    completionBonusClaimed: Boolean(incoming.completionBonusClaimed),
  };
}

function defaultTrophyClaimed(): Record<TrophyId, boolean> {
  const t = {} as Record<TrophyId, boolean>;
  for (const id of TROPHY_ORDER) {
    t[id] = false;
  }
  return t;
}

function mergeTrophyClaimed(
  incoming: Partial<Record<TrophyId, boolean>> | undefined,
): Record<TrophyId, boolean> {
  const fresh = defaultTrophyClaimed();
  if (!incoming) return fresh;
  for (const id of TROPHY_ORDER) {
    if (incoming[id] === true) fresh[id] = true;
  }
  return fresh;
}

function defaultAsyncPvpFirstWinClaimed(): Record<RivalId, boolean> {
  const o = {} as Record<RivalId, boolean>;
  for (const id of RIVAL_ORDER) {
    o[id] = false;
  }
  return o;
}

function createEmptySavedSlots(): SavedBuildSlots {
  return [null, null, null];
}

function mergeChapters(
  incoming: Partial<Record<ChapterId, Partial<ChapterProgress>>> | undefined,
): Record<ChapterId, ChapterProgress> {
  const fresh = createDefaultChapterProgress();
  if (!incoming) return fresh;
  for (const id of CHAPTER_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      unlocked: Boolean(patch.unlocked),
      completedOnce: Boolean(patch.completedOnce),
      firstRewardClaimed: Boolean(patch.firstRewardClaimed),
    };
  }
  return fresh;
}

function mergeBosses(
  incoming: Partial<Record<BossId, Partial<BossProgress>>> | undefined,
): Record<BossId, BossProgress> {
  const fresh = createDefaultBossProgress();
  if (!incoming) return fresh;
  for (const id of BOSS_ORDER) {
    const patch = incoming[id];
    if (!patch) continue;
    fresh[id] = {
      unlocked: Boolean(patch.unlocked),
      defeatedOnce: Boolean(patch.defeatedOnce),
      firstRewardClaimed: Boolean(patch.firstRewardClaimed),
    };
  }
  return fresh;
}

function mergePaintsOwned(
  incoming: Partial<Record<PaintId, boolean>> | undefined,
): Record<PaintId, boolean> {
  const fresh = createDefaultPaintsOwned();
  if (!incoming) return fresh;
  for (const id of PAINT_ORDER) {
    if (incoming[id] === true) fresh[id] = true;
  }
  fresh[DEFAULT_PAINT_ID] = true;
  return fresh;
}

function syncBossUnlocksWithChapters(
  chapters: Record<ChapterId, ChapterProgress>,
  bosses: Record<BossId, BossProgress>,
): Record<BossId, BossProgress> {
  let next = bosses;
  let touched = false;
  for (const bid of BOSS_ORDER) {
    const gate = BOSS_DEFS[bid].unlockAfterChapter;
    if (chapters[gate]?.completedOnce && !next[bid].unlocked) {
      next = {
        ...next,
        [bid]: { ...next[bid], unlocked: true },
      };
      touched = true;
    }
  }
  return touched ? next : bosses;
}

interface GameStore extends GameSnapshot {
  applyMinigameResult: (id: MinigameId, result: MinigameResultInput) => void;
  purchaseGarageUpgrade: (id: GarageUpgradeId) => void;
  activateUnlockNode: (id: UnlockNodeId) => void;
  claimBadgeReward: (id: BadgeId) => void;
  claimAchievementReward: (id: AchievementId) => void;
  purchaseNextEvolution: () => void;
  completeLaunchStep: (id: LaunchStepId) => void;
  claimLaunchReadinessBonus: () => void;
  setComfort: (patch: Partial<ComfortSettings>) => void;
  claimTrophy: (id: TrophyId) => void;
  completeChapter: (id: ChapterId) => void;
  selectRobot: (id: RobotId) => void;
  buyPaint: (id: PaintId) => void;
  equipPaint: (id: PaintId) => void;
  applyFactoryResult: (won: boolean) => void;
  defeatBoss: (id: BossId) => void;
  clearRewardFlash: () => void;
  finalizeAsyncPvpMatch: (rivalId: RivalId, won: boolean) => void;
  claimLeaderboardSpotlight: () => void;
  saveBuildToSlot: (slot: number, name: string) => void;
  loadBuildFromSlot: (slot: number) => void;
  clearBuildSlot: (slot: number) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      scrap: 0,
      xp: 0,
      rankedWins: 0,
      comfort: defaultComfort(),
      launchReadiness: defaultLaunchReadiness(),
      minigames: createDefaultMinigames(),
      garageUpgrades: defaultGarageLevels(),
      unlockNodes: defaultUnlockNodes(),
      badges: defaultBadges(),
      achievements: defaultAchievements(),
      evolutionTier: 0,
      trophyClaimed: defaultTrophyClaimed(),
      chapters: createDefaultChapterProgress(),
      selectedRobotId: DEFAULT_ROBOT_ID,
      paintsOwned: createDefaultPaintsOwned(),
      equippedPaintId: DEFAULT_PAINT_ID,
      factoryFirstRewardClaimed: false,
      bosses: createDefaultBossProgress(),
      asyncPvpFirstWinClaimed: defaultAsyncPvpFirstWinClaimed(),
      leaderboardBonusClaimed: false,
      savedBuildSlots: createEmptySavedSlots(),
      rewardFlash: null,

      resetProgress: () =>
        set({
          scrap: 0,
          xp: 0,
          rankedWins: 0,
          comfort: defaultComfort(),
          launchReadiness: defaultLaunchReadiness(),
          minigames: createDefaultMinigames(),
          garageUpgrades: defaultGarageLevels(),
          unlockNodes: defaultUnlockNodes(),
          badges: defaultBadges(),
          achievements: defaultAchievements(),
          evolutionTier: 0,
          trophyClaimed: defaultTrophyClaimed(),
          chapters: createDefaultChapterProgress(),
          selectedRobotId: DEFAULT_ROBOT_ID,
          paintsOwned: createDefaultPaintsOwned(),
          equippedPaintId: DEFAULT_PAINT_ID,
          factoryFirstRewardClaimed: false,
          bosses: createDefaultBossProgress(),
          asyncPvpFirstWinClaimed: defaultAsyncPvpFirstWinClaimed(),
          leaderboardBonusClaimed: false,
          savedBuildSlots: createEmptySavedSlots(),
          rewardFlash: null,
        }),

      clearRewardFlash: () => set({ rewardFlash: null }),

      finalizeAsyncPvpMatch: (rivalId, won) => {
        set((state) => {
          if (!state.minigames['training-battle']?.completedOnce) {
            return {
              ...state,
              rewardFlash:
                'Clear the Ranked Pit once in Training — then ghosts answer your challenges.',
            };
          }
          const rival = RIVAL_META[rivalId];
          if (!won) {
            return {
              ...state,
              rewardFlash: `Async loss vs ${rival.name}. ${rival.tipOnLoss}`,
            };
          }
          if (state.asyncPvpFirstWinClaimed[rivalId]) {
            return {
              ...state,
              rewardFlash: `Win vs ${rival.name} logged — first ghost bonus already claimed.`,
            };
          }
          const rw = ASYNC_PVP_FIRST_WIN_REWARDS[rivalId];
          const next = applyHonorUnlocks({
            ...state,
            scrap: state.scrap + rw.scrap,
            xp: state.xp + rw.xp,
            asyncPvpFirstWinClaimed: {
              ...state.asyncPvpFirstWinClaimed,
              [rivalId]: true,
            },
            rewardFlash: `Async win vs ${rival.name}: +${rw.scrap} scrap, +${rw.xp} XP (first time only).`,
          });
          return next;
        });
      },

      claimLeaderboardSpotlight: () => {
        set((state) => {
          if (state.leaderboardBonusClaimed) return state;
          if (state.rankedWins < LEADERBOARD_SPOTLIGHT.minRankedWins) {
            return {
              ...state,
              rewardFlash: `Need ${LEADERBOARD_SPOTLIGHT.minRankedWins} pit wins for the spotlight bonus.`,
            };
          }
          return applyHonorUnlocks({
            ...state,
            scrap: state.scrap + LEADERBOARD_SPOTLIGHT.scrap,
            xp: state.xp + LEADERBOARD_SPOTLIGHT.xp,
            leaderboardBonusClaimed: true,
            rewardFlash: `Spotlight bonus: +${LEADERBOARD_SPOTLIGHT.scrap} scrap, +${LEADERBOARD_SPOTLIGHT.xp} XP (one time).`,
          });
        });
      },

      saveBuildToSlot: (slot, name) => {
        set((state) => {
          const i = Math.floor(slot);
          if (i < 0 || i >= SAVED_BUILD_SLOT_COUNT) return state;
          const label = name.trim() ? name.trim().slice(0, 32) : `Bay ${i + 1}`;
          const snapshot: SavedBuildSnapshot = {
            name: label,
            savedAt: Date.now(),
            garageUpgrades: { ...state.garageUpgrades },
            evolutionTier: state.evolutionTier,
          };
          const savedBuildSlots = [...state.savedBuildSlots] as SavedBuildSlots;
          savedBuildSlots[i] = snapshot;
          return {
            ...state,
            savedBuildSlots,
            rewardFlash: `Saved “${label}” to slot ${i + 1}.`,
          };
        });
      },

      loadBuildFromSlot: (slot) => {
        set((state) => {
          const i = Math.floor(slot);
          if (i < 0 || i >= SAVED_BUILD_SLOT_COUNT) return state;
          const snap = state.savedBuildSlots[i];
          if (!snap) {
            return {
              ...state,
              rewardFlash: 'That slot is empty — save a build first.',
            };
          }
          let next: GameSnapshot = {
            ...state,
            garageUpgrades: mergeGarage(snap.garageUpgrades),
            evolutionTier: Math.min(
              EVOLUTION_MAX_TIER,
              Math.max(0, snap.evolutionTier),
            ),
            rewardFlash: `Loaded “${snap.name}” — garage tuning and frame tier restored.`,
          };
          if (!robotIsAvailable(next.selectedRobotId, next)) {
            next = { ...next, selectedRobotId: DEFAULT_ROBOT_ID };
          }
          return applyHonorUnlocks(next);
        });
      },

      clearBuildSlot: (slot) => {
        set((state) => {
          const i = Math.floor(slot);
          if (i < 0 || i >= SAVED_BUILD_SLOT_COUNT) return state;
          const savedBuildSlots = [...state.savedBuildSlots] as SavedBuildSlots;
          savedBuildSlots[i] = null;
          return {
            ...state,
            savedBuildSlots,
            rewardFlash: `Cleared build slot ${i + 1}.`,
          };
        });
      },

      completeLaunchStep: (id) => {
        set((state) => {
          if (state.launchReadiness.stepCompletion[id]) return state;
          return {
            ...state,
            launchReadiness: {
              ...state.launchReadiness,
              stepCompletion: {
                ...state.launchReadiness.stepCompletion,
                [id]: true,
              },
            },
          };
        });
      },

      claimLaunchReadinessBonus: () => {
        set((state) => {
          if (state.launchReadiness.completionBonusClaimed) return state;
          if (!allLaunchStepsComplete(state.launchReadiness.stepCompletion)) {
            return state;
          }
          const next = applyHonorUnlocks({
            ...state,
            scrap: state.scrap + LAUNCH_COMPLETION_SCRAP,
            xp: state.xp + LAUNCH_COMPLETION_XP,
            launchReadiness: {
              ...state.launchReadiness,
              completionBonusClaimed: true,
            },
          });
          return next;
        });
      },

      setComfort: (patch) => {
        set((state) => ({
          ...state,
          comfort: mergeComfort({ ...state.comfort, ...patch }),
        }));
      },

      applyMinigameResult: (id, result) => {
        if (!result.won) return;

        set((state) => {
          const prog = state.minigames[id];
          if (!prog?.unlocked) return state;

          const meta = MINIGAME_META[id];
          let scrap = state.scrap;
          let xp = state.xp;
          let firstRewardClaimed = prog.firstRewardClaimed;
          const levelsSum = totalGarageUpgradeLevels(state.garageUpgrades);

          if (!prog.firstRewardClaimed) {
            const bonus = garagePayoutBonus(levelsSum, true);
            scrap += meta.firstRewardScrap + bonus.scrap;
            xp += meta.firstRewardXp + bonus.xp;
            firstRewardClaimed = true;
          } else {
            const bonus = garagePayoutBonus(levelsSum, false);
            scrap += bonus.scrap;
            xp += bonus.xp;
          }

          let bestScore = prog.bestScore;
          if (result.scoreIfWin !== undefined) {
            const next = result.scoreIfWin;
            bestScore =
              bestScore === null ? next : Math.max(bestScore, next);
          }

          const nextMinigames: Record<MinigameId, MinigameProgress> = {
            ...state.minigames,
            [id]: {
              ...prog,
              firstRewardClaimed,
              completedOnce: true,
              bestScore,
            },
          };

          const idx = MINIGAME_ORDER.indexOf(id);
          if (idx >= 0 && idx < MINIGAME_ORDER.length - 1) {
            const nextId = MINIGAME_ORDER[idx + 1];
            const nextProg = nextMinigames[nextId];
            nextMinigames[nextId] = { ...nextProg, unlocked: true };
          }

          let rankedWins = state.rankedWins;
          if (id === 'training-battle') {
            rankedWins += 1;
          }

          let selectedRobotId = state.selectedRobotId;
          if (
            !robotIsAvailable(selectedRobotId, {
              xp,
              chapters: state.chapters,
            })
          ) {
            selectedRobotId = DEFAULT_ROBOT_ID;
          }

          let next: GameSnapshot = {
            ...state,
            scrap,
            xp,
            rankedWins,
            minigames: nextMinigames,
            selectedRobotId,
          };

          next = applyHonorUnlocks(next);
          return next;
        });
      },

      purchaseGarageUpgrade: (id) => {
        set((state) => {
          const def = GARAGE_UPGRADES[id];
          const level = state.garageUpgrades[id] ?? 0;
          if (level >= def.maxLevel) return state;

          const cost = def.costForLevel(level);
          const needLevel = def.minRobotLevelForNext(level);
          if (state.scrap < cost) return state;
          if (robotLevelFromXp(state.xp) < needLevel) return state;

          let next: GameSnapshot = {
            ...state,
            scrap: state.scrap - cost,
            garageUpgrades: {
              ...state.garageUpgrades,
              [id]: level + 1,
            },
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      activateUnlockNode: (id) => {
        set((state) => {
          if (state.unlockNodes[id]?.activated) return state;

          const def = UNLOCK_NODES[id];
          const prev = unlockPrerequisite(id);
          if (prev && !state.unlockNodes[prev]?.activated) return state;

          if (state.scrap < def.scrapCost) return state;
          if (robotLevelFromXp(state.xp) < def.minRobotLevel) return state;

          let next: GameSnapshot = {
            ...state,
            scrap: state.scrap - def.scrapCost + def.firstRewardScrap,
            xp: state.xp + def.firstRewardXp,
            unlockNodes: {
              ...state.unlockNodes,
              [id]: { activated: true },
            },
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      claimBadgeReward: (id) => {
        set((state) => {
          const row = state.badges[id];
          const def = BADGE_DEFS[id];
          if (!row?.unlocked || row.rewardClaimed) return state;

          let next: GameSnapshot = {
            ...state,
            scrap: state.scrap + def.claimScrap,
            xp: state.xp + def.claimXp,
            badges: {
              ...state.badges,
              [id]: { ...row, rewardClaimed: true },
            },
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      claimAchievementReward: (id) => {
        set((state) => {
          const row = state.achievements[id];
          const def = ACHIEVEMENT_DEFS[id];
          if (!row?.unlocked || row.rewardClaimed) return state;

          let next: GameSnapshot = {
            ...state,
            scrap: state.scrap + def.claimScrap,
            xp: state.xp + def.claimXp,
            achievements: {
              ...state.achievements,
              [id]: { ...row, rewardClaimed: true },
            },
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      purchaseNextEvolution: () => {
        set((state) => {
          if (state.evolutionTier >= EVOLUTION_MAX_TIER) return state;

          const nextTierDef = EVOLUTION_TIERS.find(
            (t) => t.tier === state.evolutionTier + 1,
          );
          if (!nextTierDef) return state;

          if (state.scrap < nextTierDef.scrapCost) return state;
          if (robotLevelFromXp(state.xp) < nextTierDef.minRobotLevel)
            return state;

          let next: GameSnapshot = {
            ...state,
            scrap: state.scrap - nextTierDef.scrapCost,
            evolutionTier: state.evolutionTier + 1,
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      claimTrophy: (trophyId) => {
        set((state) => {
          if (state.trophyClaimed[trophyId]) return state;
          const meta = TROPHY_META[trophyId];
          if (state.rankedWins < meta.minRankedWins) return state;
          return applyHonorUnlocks({
            ...state,
            scrap: state.scrap + meta.rewardScrap,
            xp: state.xp + meta.rewardXp,
            trophyClaimed: { ...state.trophyClaimed, [trophyId]: true },
            rewardFlash: `${meta.label} secured: +${meta.rewardScrap} scrap, +${meta.rewardXp} XP.`,
          });
        });
      },

      completeChapter: (chapterId) => {
        set((state) => {
          const ch = state.chapters[chapterId];
          if (!ch?.unlocked || ch.completedOnce) return state;
          const ix = CHAPTER_ORDER.indexOf(chapterId);
          if (ix > 0) {
            const prev = CHAPTER_ORDER[ix - 1];
            if (!state.chapters[prev]?.completedOnce) return state;
          }
          const def = CHAPTER_DEFS[chapterId];
          const chapters = { ...state.chapters };
          chapters[chapterId] = {
            ...ch,
            completedOnce: true,
            firstRewardClaimed: true,
          };
          if (ix + 1 < CHAPTER_ORDER.length) {
            const nxt = CHAPTER_ORDER[ix + 1];
            chapters[nxt] = { ...chapters[nxt], unlocked: true };
          }
          const scrap = state.scrap + def.rewardScrap;
          const xp = state.xp + def.rewardXp;
          const nextBosses = syncBossUnlocksWithChapters(chapters, state.bosses);
          let selectedRobotId = state.selectedRobotId;
          if (
            !robotIsAvailable(selectedRobotId, {
              xp,
              chapters,
            })
          ) {
            selectedRobotId = DEFAULT_ROBOT_ID;
          }
          let next: GameSnapshot = {
            ...state,
            scrap,
            xp,
            chapters,
            bosses: nextBosses,
            selectedRobotId,
          };
          next = applyHonorUnlocks(next);
          return next;
        });
      },

      selectRobot: (robotId) => {
        set((state) => {
          if (!robotIsAvailable(robotId, state)) return state;
          return { ...state, selectedRobotId: robotId };
        });
      },

      buyPaint: (paintId) => {
        set((state) => {
          if (state.paintsOwned[paintId]) return state;
          const def = PAINT_DEFS[paintId];
          if (def.scrapCost <= 0) return state;
          if (state.scrap < def.scrapCost) return state;
          return {
            ...state,
            scrap: state.scrap - def.scrapCost,
            paintsOwned: { ...state.paintsOwned, [paintId]: true },
          };
        });
      },

      equipPaint: (paintId) => {
        set((state) => {
          if (!state.paintsOwned[paintId]) return state;
          return { ...state, equippedPaintId: paintId };
        });
      },

      applyFactoryResult: (won) => {
        if (!won) return;
        set((state) => {
          if (!state.chapters['night-haul']?.completedOnce) return state;
          let scrap = state.scrap;
          let xp = state.xp;
          let factoryFirstRewardClaimed = state.factoryFirstRewardClaimed;
          if (!factoryFirstRewardClaimed) {
            scrap += FACTORY_FIRST_SCRAP;
            xp += FACTORY_FIRST_XP;
            factoryFirstRewardClaimed = true;
          } else {
            scrap += FACTORY_REPEAT_SCRAP;
            xp += FACTORY_REPEAT_XP;
          }
          return applyHonorUnlocks({
            ...state,
            scrap,
            xp,
            factoryFirstRewardClaimed,
          });
        });
      },

      defeatBoss: (bossId) => {
        set((state) => {
          const b = state.bosses[bossId];
          if (!b?.unlocked || b.defeatedOnce) return state;
          const def = BOSS_DEFS[bossId];
          const next = applyHonorUnlocks({
            ...state,
            scrap: state.scrap + def.rewardScrap,
            xp: state.xp + def.rewardXp,
            bosses: {
              ...state.bosses,
              [bossId]: {
                ...b,
                defeatedOnce: true,
                firstRewardClaimed: true,
              },
            },
          });
          return next;
        });
      },
    }),
    {
      name: 'robot-garage-save',
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: unknown, version: number) => {
        function mergeAsyncPvpFirstWinClaimed(
          incoming: Partial<Record<RivalId, boolean>> | undefined,
        ): Record<RivalId, boolean> {
          const fresh = defaultAsyncPvpFirstWinClaimed();
          if (!incoming) return fresh;
          for (const id of RIVAL_ORDER) {
            if (incoming[id] === true) fresh[id] = true;
          }
          return fresh;
        }

        function mergeSavedBuildSlots(incoming: unknown): SavedBuildSlots {
          const empty = createEmptySavedSlots();
          if (!Array.isArray(incoming)) return empty;
          const out: SavedBuildSlots = [...empty];
          for (let i = 0; i < SAVED_BUILD_SLOT_COUNT; i++) {
            const cell = incoming[i];
            if (!cell || typeof cell !== 'object') continue;
            const c = cell as Record<string, unknown>;
            const nameRaw = typeof c.name === 'string' ? c.name.trim() : '';
            const name = nameRaw ? nameRaw.slice(0, 32) : `Bay ${i + 1}`;
            const savedAt =
              typeof c.savedAt === 'number' && Number.isFinite(c.savedAt)
                ? c.savedAt
                : Date.now();
            const evolutionTier =
              typeof c.evolutionTier === 'number' &&
              Number.isFinite(c.evolutionTier)
                ? Math.min(
                    EVOLUTION_MAX_TIER,
                    Math.max(0, Math.floor(c.evolutionTier)),
                  )
                : 0;
            const garageUpgrades = mergeGarage(
              c.garageUpgrades as Partial<Record<GarageUpgradeId, number>>,
            );
            out[i] = { name, savedAt, garageUpgrades, evolutionTier };
          }
          return out;
        }

        type P = Partial<{
          scrap: unknown;
          xp: unknown;
          rankedWins: unknown;
          minigames: Partial<Record<MinigameId, Partial<MinigameProgress>>>;
          garageUpgrades: Partial<Record<GarageUpgradeId, number>>;
          unlockNodes: Partial<
            Record<UnlockNodeId, Partial<UnlockNodeProgress>>
          >;
          badges: Partial<Record<BadgeId, Partial<BadgeProgress>>>;
          achievements: Partial<
            Record<AchievementId, Partial<AchievementProgress>>
          >;
          evolutionTier: unknown;
          comfort: Partial<ComfortSettings>;
          launchReadiness: Partial<LaunchReadinessProgress>;
          trophyClaimed: Partial<Record<TrophyId, boolean>>;
          chapters: Partial<Record<ChapterId, Partial<ChapterProgress>>>;
          bosses: Partial<Record<BossId, Partial<BossProgress>>>;
          selectedRobotId: string;
          paintsOwned: Partial<Record<PaintId, boolean>>;
          equippedPaintId: string;
          factoryFirstRewardClaimed: boolean;
          asyncPvpFirstWinClaimed: Partial<Record<RivalId, boolean>>;
          leaderboardBonusClaimed: boolean;
          savedBuildSlots: unknown;
        }>;
        const p = persisted as P;

        const scrap =
          typeof p.scrap === 'number' && Number.isFinite(p.scrap) ? p.scrap : 0;
        const xp = typeof p.xp === 'number' && Number.isFinite(p.xp) ? p.xp : 0;
        let rankedWins =
          typeof p.rankedWins === 'number' && Number.isFinite(p.rankedWins)
            ? Math.max(0, Math.floor(p.rankedWins))
            : 0;

        type RawMinigames = Partial<
          Record<string, Partial<MinigameProgress> | undefined>
        >;
        let rawMinigames: RawMinigames | undefined = p.minigames as
          | RawMinigames
          | undefined;
        if (version < 8 && rawMinigames) {
          rawMinigames = { ...rawMinigames };
          const oldTb = rawMinigames['training-battle'];
          if (oldTb && rawMinigames['obstacle-alley'] === undefined) {
            rawMinigames['obstacle-alley'] = { ...oldTb };
            rawMinigames['training-battle'] = {
              unlocked: false,
              firstRewardClaimed: false,
              completedOnce: false,
              bestScore: null,
            };
          }
        }

        const minigames = mergeMinigames(
          rawMinigames as Partial<
            Record<MinigameId, Partial<MinigameProgress>>
          > | undefined,
        );

        const garageUpgrades =
          version >= 4 && p.garageUpgrades
            ? mergeGarage(p.garageUpgrades)
            : defaultGarageLevels();

        const unlockNodes =
          version >= 4 && p.unlockNodes
            ? mergeUnlockNodes(p.unlockNodes)
            : defaultUnlockNodes();

        const badges =
          version >= 4 && p.badges ? mergeBadges(p.badges) : defaultBadges();

        const achievements =
          version >= 4 && p.achievements
            ? mergeAchievements(p.achievements)
            : defaultAchievements();

        const evolutionTier =
          version >= 4 &&
          typeof p.evolutionTier === 'number' &&
          Number.isFinite(p.evolutionTier)
            ? Math.min(
                EVOLUTION_MAX_TIER,
                Math.max(0, Math.floor(p.evolutionTier)),
              )
            : 0;

        const comfort =
          version >= 4 && p.comfort
            ? mergeComfort(p.comfort)
            : defaultComfort();

        const launchReadiness =
          version >= 4 && p.launchReadiness
            ? mergeLaunchReadiness(p.launchReadiness)
            : defaultLaunchReadiness();

        if (
          version < 5 &&
          (minigames['training-battle']?.completedOnce ||
            minigames['obstacle-alley']?.completedOnce)
        ) {
          rankedWins = Math.max(rankedWins, 1);
        }

        const chapters = mergeChapters(version >= 5 ? p.chapters : undefined);
        let bosses = mergeBosses(version >= 5 ? p.bosses : undefined);
        bosses = syncBossUnlocksWithChapters(chapters, bosses);

        const trophyClaimed = mergeTrophyClaimed(
          version >= 5 ? p.trophyClaimed : undefined,
        );

        const paintsOwned = mergePaintsOwned(
          version >= 5 ? p.paintsOwned : undefined,
        );

        let equippedPaintId: PaintId = DEFAULT_PAINT_ID;
        if (
          version >= 5 &&
          typeof p.equippedPaintId === 'string' &&
          p.equippedPaintId in PAINT_DEFS &&
          paintsOwned[p.equippedPaintId as PaintId]
        ) {
          equippedPaintId = p.equippedPaintId as PaintId;
        }

        let selectedRobotId: RobotId = DEFAULT_ROBOT_ID;
        if (
          version >= 5 &&
          typeof p.selectedRobotId === 'string' &&
          p.selectedRobotId in ROBOT_DEFS
        ) {
          selectedRobotId = p.selectedRobotId as RobotId;
        }

        const factoryFirstRewardClaimed =
          version >= 5 && p.factoryFirstRewardClaimed === true;

        const asyncPvpFirstWinClaimed = mergeAsyncPvpFirstWinClaimed(
          version >= 7 ? p.asyncPvpFirstWinClaimed : undefined,
        );
        const leaderboardBonusClaimed =
          version >= 7 && p.leaderboardBonusClaimed === true;
        const savedBuildSlots = mergeSavedBuildSlots(
          version >= 7 ? p.savedBuildSlots : undefined,
        );

        let base: GameSnapshot = {
          scrap,
          xp,
          rankedWins,
          comfort,
          launchReadiness,
          minigames,
          garageUpgrades,
          unlockNodes,
          badges,
          achievements,
          evolutionTier,
          trophyClaimed,
          chapters,
          selectedRobotId,
          paintsOwned,
          equippedPaintId,
          factoryFirstRewardClaimed,
          bosses,
          asyncPvpFirstWinClaimed,
          leaderboardBonusClaimed,
          savedBuildSlots,
          rewardFlash: null,
        };

        if (!robotIsAvailable(selectedRobotId, base)) {
          base = { ...base, selectedRobotId: DEFAULT_ROBOT_ID };
        }

        return applyHonorUnlocks(base);
      },
      partialize: (s) => ({
        scrap: s.scrap,
        xp: s.xp,
        rankedWins: s.rankedWins,
        comfort: s.comfort,
        launchReadiness: s.launchReadiness,
        minigames: s.minigames,
        garageUpgrades: s.garageUpgrades,
        unlockNodes: s.unlockNodes,
        badges: s.badges,
        achievements: s.achievements,
        evolutionTier: s.evolutionTier,
        trophyClaimed: s.trophyClaimed,
        chapters: s.chapters,
        selectedRobotId: s.selectedRobotId,
        paintsOwned: s.paintsOwned,
        equippedPaintId: s.equippedPaintId,
        factoryFirstRewardClaimed: s.factoryFirstRewardClaimed,
        bosses: s.bosses,
        asyncPvpFirstWinClaimed: s.asyncPvpFirstWinClaimed,
        leaderboardBonusClaimed: s.leaderboardBonusClaimed,
        savedBuildSlots: s.savedBuildSlots,
      }),
    },
  ),
);

/** @deprecated Use robotLevelFromXp from gameTypes */
export function robotLevel(xp: number): number {
  return robotLevelFromXp(xp);
}

export { xpIntoCurrentLevel, XP_PER_LEVEL, robotLevelFromXp };
