export const TROPHY_ORDER = ['bronze', 'silver', 'gold'] as const;
export type TrophyId = (typeof TROPHY_ORDER)[number];

export interface TrophyMeta {
  id: TrophyId;
  label: string;
  minRankedWins: number;
  rewardScrap: number;
  rewardXp: number;
  blurb: string;
}

export const TROPHY_META: Record<TrophyId, TrophyMeta> = {
  bronze: {
    id: 'bronze',
    label: 'Bronze Circuit Cup',
    minRankedWins: 1,
    rewardScrap: 18,
    rewardXp: 12,
    blurb: 'Win your first ranked scrap in the pit.',
  },
  silver: {
    id: 'silver',
    label: 'Silver Dynamo Plate',
    minRankedWins: 5,
    rewardScrap: 40,
    rewardXp: 24,
    blurb: 'Five clean victories — rivals know your name.',
  },
  gold: {
    id: 'gold',
    label: 'Gold Garage Crown',
    minRankedWins: 12,
    rewardScrap: 72,
    rewardXp: 40,
    blurb: 'Twelve wins. You own the leaderboard vibe.',
  },
};
