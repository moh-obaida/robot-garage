import type { MinigameId } from './minigameMeta';
import type { GarageUpgradeId } from './garageUpgrades';
import type { UnlockNodeId } from './unlockTree';

/**
 * Serializable slice intended for a future online profile / cloud sync.
 * Keep UI and gameplay code on richer store types; map to this at boundaries.
 */
export interface WireableGarageProfileV1 {
  schemaVersion: 1;
  scrap: number;
  xp: number;
  evolutionTier: number;
  garageUpgrades: Record<GarageUpgradeId, number>;
  unlockNodesActive: UnlockNodeId[];
  minigameBestScores: Partial<Record<MinigameId, number | null>>;
  rankedWins: number;
}

/** Payload for reporting an async or ranked bout result to a future server. */
export interface WireableBoutResultV1 {
  schemaVersion: 1;
  kind: 'training-win' | 'async-ghost';
  minigameOrModeId: string;
  won: boolean;
  score?: number;
  /** Client-generated idempotency key to prevent double credit server-side. */
  clientRequestId: string;
}
