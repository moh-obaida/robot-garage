/** Cumulative XP thresholds: level L requires total XP >= XP_LEVELS[L-1] */
export const XP_FOR_LEVEL: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 850,
  6: 1300,
}

const MAX_LEVEL = 6

export function levelFromTotalXp(xp: number): number {
  let lv = 1
  for (let l = MAX_LEVEL; l >= 1; l--) {
    if (xp >= (XP_FOR_LEVEL[l] ?? 0)) {
      lv = l
      break
    }
  }
  return lv
}

export function xpProgress(xp: number): { level: number; current: number; next: number; pct: number } {
  const level = levelFromTotalXp(xp)
  if (level >= MAX_LEVEL) {
    return { level, current: xp, next: xp, pct: 100 }
  }
  const floor = XP_FOR_LEVEL[level] ?? 0
  const ceiling = XP_FOR_LEVEL[level + 1] ?? floor + 1
  const span = Math.max(1, ceiling - floor)
  const pct = Math.min(100, Math.round(((xp - floor) / span) * 100))
  return { level, current: xp - floor, next: ceiling - floor, pct }
}

const RANKS: { min: number; label: string }[] = [
  { min: 800, label: 'Garage Champion' },
  { min: 500, label: 'Platinum Bot Master' },
  { min: 300, label: 'Gold Inventor' },
  { min: 150, label: 'Silver Engineer' },
  { min: 50, label: 'Bronze Mechanic' },
  { min: 0, label: 'Rookie Builder' },
]

export function rankFromTrophies(trophies: number): string {
  for (const r of RANKS) {
    if (trophies >= r.min) return r.label
  }
  return 'Rookie Builder'
}

export function upgradeCostForStep(currentLevel: number): number | null {
  if (currentLevel >= 5) return null
  const step = currentLevel
  if (step === 1) return 150
  if (step === 2) return 300
  if (step === 3) return 600
  if (step === 4) return 1000
  return null
}
