import type { ColorDef } from '../types/game'

export const COLORS: ColorDef[] = [
  { id: 'cyan', name: 'Neon Cyan', hex: '#22d3ee', scrapCost: 0, starter: true },
  { id: 'slate', name: 'Shadow Slate', hex: '#94a3b8', scrapCost: 20 },
  { id: 'magenta', name: 'Plasma Magenta', hex: '#e879f9', scrapCost: 35 },
  { id: 'lime', name: 'Matrix Lime', hex: '#a3e635', scrapCost: 50, requiresMissionId: 'patrol-grid' },
  { id: 'gold', name: 'Auric Gold', hex: '#fbbf24', scrapCost: 0, requiresMissionId: 'core-dust' },
  { id: 'crimson', name: 'Crimson Core', hex: '#f43f5e', scrapCost: 45, requiresMissionId: 'signal-hunt' },
  { id: 'violet', name: 'Void Violet', hex: '#a78bfa', scrapCost: 60, requiresMissionId: 'deep-sync' },
]

export function getColorById(id: string): ColorDef | undefined {
  return COLORS.find((c) => c.id === id)
}
