import type { ArenaOpponent } from '../types/game'

export const OPPONENTS: ArenaOpponent[] = [
  {
    id: 'rook',
    callsign: 'Rook-3',
    maxHp: 85,
    attack: 11,
    defense: 3,
    speed: 9,
    winScrap: 14,
  },
  {
    id: 'bulwark',
    callsign: 'Bulwark-9',
    maxHp: 120,
    attack: 10,
    defense: 6,
    speed: 7,
    winScrap: 22,
  },
  {
    id: 'striker',
    callsign: 'Striker-V',
    maxHp: 75,
    attack: 16,
    defense: 2,
    speed: 12,
    winScrap: 26,
  },
  {
    id: 'apex',
    callsign: 'Apex Null',
    maxHp: 110,
    attack: 14,
    defense: 5,
    speed: 11,
    winScrap: 38,
  },
]
