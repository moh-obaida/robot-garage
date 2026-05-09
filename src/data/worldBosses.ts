import type { ChapterId } from './storyChapters';

export const BOSS_ORDER = ['scrap-warden', 'forge-overseer'] as const;

export type BossId = (typeof BOSS_ORDER)[number];

export interface BossDef {
  id: BossId;
  title: string;
  blurb: string;
  tipOnLoss: string;
  unlockAfterChapter: ChapterId;
  rewardScrap: number;
  rewardXp: number;
}

export interface BossProgress {
  unlocked: boolean;
  defeatedOnce: boolean;
  firstRewardClaimed: boolean;
}

export function createDefaultBossProgress(): Record<BossId, BossProgress> {
  const o = {} as Record<BossId, BossProgress>;
  for (const id of BOSS_ORDER) {
    o[id] = {
      unlocked: false,
      defeatedOnce: false,
      firstRewardClaimed: false,
    };
  }
  return o;
}

export const BOSS_DEFS: Record<BossId, BossDef> = {
  'scrap-warden': {
    id: 'scrap-warden',
    title: 'Scrap Warden',
    blurb:
      'A yard overseer bot that punishes greedy strikes — read the triangle.',
    tipOnLoss:
      'Tip: when they Guard twice, feed an Overload, then pivot to Strike.',
    unlockAfterChapter: 'relay-rush',
    rewardScrap: 42,
    rewardXp: 32,
  },
  'forge-overseer': {
    id: 'forge-overseer',
    title: 'Forge Overseer',
    blurb: 'Runs hot — overloads love to bait, but Strike timing wins the lane.',
    tipOnLoss:
      'Tip: slow down. Two Guards to bait their Strike, then Overload the opening.',
    unlockAfterChapter: 'apex-run',
    rewardScrap: 64,
    rewardXp: 48,
  },
};
