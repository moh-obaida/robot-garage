export type FallingPartsMode = 'easy' | 'standard' | 'challenge';

export const FALLING_PARTS_CONFIG: Record<
  FallingPartsMode,
  { label: string; tickMs: number; spawnEvery: number; fallStep: number; needCatch: number; maxMiss: number; tip: string }
> = {
  easy: {
    label: 'Easy',
    tickMs: 45,
    spawnEvery: 28,
    fallStep: 1.4,
    needCatch: 10,
    maxMiss: 5,
    tip: 'Stay under the drop shadow — you can afford a few misses on Easy.',
  },
  standard: {
    label: 'Standard',
    tickMs: 40,
    spawnEvery: 22,
    fallStep: 2,
    needCatch: 12,
    maxMiss: 4,
    tip: 'Slide early: gears drift faster on Standard.',
  },
  challenge: {
    label: 'Challenge',
    tickMs: 32,
    spawnEvery: 16,
    fallStep: 2.6,
    needCatch: 14,
    maxMiss: 3,
    tip: 'Challenge spawns tighter — finish Easy first to learn the rhythm.',
  },
};
