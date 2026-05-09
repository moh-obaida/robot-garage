import type { ChapterId, ChapterProgress } from './storyChapters';
import { robotLevelFromXp } from '../store/gameTypes';

export const ROBOT_ORDER = [
  'rig-kit',
  'haul-mule',
  'spark-hound',
  'apex-jr',
] as const;

export type RobotId = (typeof ROBOT_ORDER)[number];

export type RobotUnlock =
  | { kind: 'starter' }
  | { kind: 'chapter'; chapterId: ChapterId }
  | { kind: 'level'; minLevel: number };

export interface RobotDef {
  id: RobotId;
  name: string;
  blurb: string;
  unlock: RobotUnlock;
}

export const ROBOT_DEFS: Record<RobotId, RobotDef> = {
  'rig-kit': {
    id: 'rig-kit',
    name: 'Rig Kit',
    blurb: 'Starter frame — light, honest, easy to wrench.',
    unlock: { kind: 'starter' },
  },
  'haul-mule': {
    id: 'haul-mule',
    name: 'Haul Mule',
    blurb: 'Wide stance for salvage pulls and storm-dock work.',
    unlock: { kind: 'chapter', chapterId: 'night-haul' },
  },
  'spark-hound': {
    id: 'spark-hound',
    name: 'Spark Hound',
    blurb: 'Fast bus tuning — loves relay sprints.',
    unlock: { kind: 'chapter', chapterId: 'storm-dock' },
  },
  'apex-jr': {
    id: 'apex-jr',
    name: 'Apex Jr.',
    blurb: 'Compact tournament shell — unlocked when you have the levels to match.',
    unlock: { kind: 'level', minLevel: 8 },
  },
};

export const DEFAULT_ROBOT_ID: RobotId = 'rig-kit';

export function robotIsAvailable(
  id: RobotId,
  slice: { xp: number; chapters: Record<ChapterId, ChapterProgress> },
): boolean {
  const d = ROBOT_DEFS[id];
  if (d.unlock.kind === 'starter') return true;
  if (d.unlock.kind === 'chapter') {
    return Boolean(slice.chapters[d.unlock.chapterId]?.completedOnce);
  }
  return robotLevelFromXp(slice.xp) >= d.unlock.minLevel;
}
