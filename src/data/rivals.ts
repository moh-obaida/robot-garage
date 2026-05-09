export const RIVAL_ORDER = ['sparky', 'rust-titan', 'circuit-queen'] as const;
export type RivalId = (typeof RIVAL_ORDER)[number];

export type RivalTier = 'easy' | 'standard' | 'challenge';

export interface RivalMeta {
  id: RivalId;
  name: string;
  tier: RivalTier;
  hp: number;
  tipOnLoss: string;
  blurb: string;
  /** Added to battle score when you win (higher = harder reward). */
  scoreBonus: number;
}

export const RIVAL_META: Record<RivalId, RivalMeta> = {
  sparky: {
    id: 'sparky',
    name: 'Sparky',
    tier: 'easy',
    hp: 5,
    tipOnLoss: 'Try Guard when Sparky keeps Striking — then answer with Overload.',
    blurb: 'A jumpy sparring bot. Great for learning the triangle.',
    scoreBonus: 0,
  },
  'rust-titan': {
    id: 'rust-titan',
    name: 'Rust Titan',
    tier: 'standard',
    hp: 6,
    tipOnLoss: 'Titan loves Overload after you Guard. Strike into their charge to disrupt.',
    blurb: 'Heavy plates, slow tells. Punish greedy Overloads.',
    scoreBonus: 35,
  },
  'circuit-queen': {
    id: 'circuit-queen',
    name: 'Circuit Queen',
    tier: 'challenge',
    hp: 7,
    tipOnLoss: 'She counters patterns. Change tempo — two Guards, then a surprise Strike.',
    blurb: 'Reads your habits. Stay unpredictable.',
    scoreBonus: 80,
  },
};
