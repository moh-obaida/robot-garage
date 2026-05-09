import type { RivalMeta } from '../data/rivals';

export type BattleMove = 'strike' | 'guard' | 'overload';

export interface RoundResolution {
  playerDamage: number;
  rivalDamage: number;
  playerFlavor: string;
  rivalFlavor: string;
  summary: string;
}

/** Strike > Overload > Guard > Strike */
export function resolveRound(
  player: BattleMove,
  rival: BattleMove,
  modifiers: { playerAmp: boolean },
): RoundResolution {
  const amp = modifiers.playerAmp ? 1 : 0;

  let playerDamage = 0;
  let rivalDamage = 0;
  let playerFlavor = '';
  let rivalFlavor = '';
  let summary = '';

  if (player === rival) {
    playerDamage = 1;
    rivalDamage = 1;
    playerFlavor = 'Both bots clash — sparks fly.';
    rivalFlavor = 'Stalemate strain chips both cores.';
    summary = 'Even exchange — each takes 1.';
  } else if (
    (player === 'strike' && rival === 'overload') ||
    (player === 'overload' && rival === 'guard') ||
    (player === 'guard' && rival === 'strike')
  ) {
    // Player wins triangle
    rivalDamage = 2 + amp;
    playerFlavor =
      player === 'strike'
        ? 'You snap the overload before it peaks.'
        : player === 'overload'
          ? 'Your surge blows the guard apart.'
          : 'You parry the strike and counter.';
    rivalFlavor = 'Rival takes the worse line.';
    summary = `You win the triangle for ${rivalDamage}.`;
  } else {
    // Rival wins triangle
    playerDamage = 2;
    rivalDamage = 0 + amp;
    if (rivalDamage > 0) {
      rivalFlavor = 'You still scrape them on the exit.';
    }
    playerFlavor = 'Their read lands clean.';
    rivalFlavor = 'Rival owns this exchange.';
    summary = 'Rival wins the triangle — you eat 2.';
  }

  return { playerDamage, rivalDamage, playerFlavor, rivalFlavor, summary };
}

export function initialPlayerHp(_rival: RivalMeta): number {
  void _rival;
  return 6;
}

/** Local PvP / couch cup: who wins the triangle exchange. */
export function couchTriangleResult(
  p1: BattleMove,
  p2: BattleMove,
): 'tie' | 'p1' | 'p2' {
  if (p1 === p2) return 'tie';
  const p1Wins =
    (p1 === 'strike' && p2 === 'overload') ||
    (p1 === 'guard' && p2 === 'strike') ||
    (p1 === 'overload' && p2 === 'guard');
  return p1Wins ? 'p1' : 'p2';
}
