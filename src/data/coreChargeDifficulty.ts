export type CoreChargeDifficulty = 'easy' | 'standard' | 'challenge';

/** Green acceptance band on a 0–1 track (fraction of width). */
export const CORE_CHARGE_BAND: Record<
  CoreChargeDifficulty,
  { left: number; width: number }
> = {
  easy: { left: 0.34, width: 0.32 },
  standard: { left: 0.4, width: 0.2 },
  challenge: { left: 0.44, width: 0.12 },
};

export const CORE_CHARGE_SCORE_BASE: Record<CoreChargeDifficulty, number> = {
  easy: 220,
  standard: 420,
  challenge: 720,
};

export const CORE_CHARGE_LABEL: Record<CoreChargeDifficulty, string> = {
  easy: 'Easy — wide coupling window',
  standard: 'Standard — shop floor timing',
  challenge: 'Challenge — tight core lock',
};
