export const CHAPTER_ORDER = [
  'night-haul',
  'relay-rush',
  'storm-dock',
  'apex-run',
] as const;

export type ChapterId = (typeof CHAPTER_ORDER)[number];

export interface ChapterDef {
  id: ChapterId;
  title: string;
  objective: string;
  rewardScrap: number;
  rewardXp: number;
  flavorWin: string;
}

export const CHAPTER_DEFS: Record<ChapterId, ChapterDef> = {
  'night-haul': {
    id: 'night-haul',
    title: 'Night Haul',
    objective:
      'Escort a fragile sensor crate across the yard without tripping the flood lamps.',
    rewardScrap: 20,
    rewardXp: 16,
    flavorWin: 'The lamps stay dark. Dispatch logs a clean run.',
  },
  'relay-rush': {
    id: 'relay-rush',
    title: 'Relay Rush',
    objective:
      'Swap three bus couplers before the backup battery bleeds out.',
    rewardScrap: 28,
    rewardXp: 22,
    flavorWin: 'Voltage holds — the relay choir hums in tune.',
  },
  'storm-dock': {
    id: 'storm-dock',
    title: 'Storm Dock',
    objective:
      'Batten the magnetic clamps while wind shear tries to peel them.',
    rewardScrap: 36,
    rewardXp: 28,
    flavorWin: 'The stack holds. The dock boss owes you a favor.',
  },
  'apex-run': {
    id: 'apex-run',
    title: 'Apex Run',
    objective:
      'Pilot the prototype chassis through the final proving lane — no second chances.',
    rewardScrap: 48,
    rewardXp: 36,
    flavorWin: 'Garage certification clears. You are on the board.',
  },
};

export function chapterIndex(id: ChapterId): number {
  return CHAPTER_ORDER.indexOf(id);
}

export interface ChapterProgress {
  unlocked: boolean;
  completedOnce: boolean;
  firstRewardClaimed: boolean;
}

export function createDefaultChapterProgress(): Record<
  ChapterId,
  ChapterProgress
> {
  const o = {} as Record<ChapterId, ChapterProgress>;
  for (const id of CHAPTER_ORDER) {
    o[id] = {
      unlocked: false,
      completedOnce: false,
      firstRewardClaimed: false,
    };
  }
  o[CHAPTER_ORDER[0]].unlocked = true;
  return o;
}
