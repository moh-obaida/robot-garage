import type { ColorDef } from '../types/game'

export const COLORS: ColorDef[] = [
  { id: 'blue', name: 'Blue', hex: '#3b82f6', scrapCost: 0, starter: true },
  { id: 'white', name: 'White', hex: '#e2e8f0', scrapCost: 0, starter: true },
  { id: 'gray', name: 'Gray', hex: '#64748b', scrapCost: 0, starter: true },
  {
    id: 'green',
    name: 'Green',
    hex: '#22c55e',
    scrapCost: 0,
    requiresMissionId: 'junkyard',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#eab308',
    scrapCost: 0,
    requiresMissionId: 'speed-test',
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#ef4444',
    scrapCost: 0,
    requiresMissionId: 'first-battle',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#a855f7',
    scrapCost: 0,
    requiresMissionId: 'rival-signal',
  },
  {
    id: 'black',
    name: 'Black',
    hex: '#1e293b',
    scrapCost: 0,
    requiresPvpWins: 3,
  },
  {
    id: 'gold',
    name: 'Gold',
    hex: '#f59e0b',
    scrapCost: 0,
    requiresMissionId: 'tournament',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    hex: '#ec4899',
    scrapCost: 0,
    requiresAllMissions: true,
    requiresDefeatOpponentId: 'gold-titan',
    comingSoon: true,
  },
]

export function getColorById(id: string): ColorDef | undefined {
  return COLORS.find((c) => c.id === id)
}
