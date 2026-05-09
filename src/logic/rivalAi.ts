import type { BattleMove } from './battleEngine';
import type { RivalId } from '../data/rivals';

function randomMove(): BattleMove {
  const opts: BattleMove[] = ['strike', 'guard', 'overload'];
  return opts[Math.floor(Math.random() * 3)]!;
}

/** Beat `move` in the triangle, or random if unknown. */
function counterTo(move: BattleMove | null): BattleMove {
  if (!move) return randomMove();
  if (move === 'strike') return 'guard';
  if (move === 'guard') return 'overload';
  return 'strike';
}

/** Soft counter: loses on purpose sometimes for easy mode. */
function softCounter(move: BattleMove | null): BattleMove {
  const c = counterTo(move);
  if (Math.random() < 0.45) return randomMove();
  return c;
}

export function pickRivalMove(
  rivalId: RivalId,
  playerLastMove: BattleMove | null,
): BattleMove {
  switch (rivalId) {
    case 'sparky':
      return softCounter(playerLastMove);
    case 'rust-titan': {
      // Favors guard, sometimes overload; occasionally random
      const r = Math.random();
      if (r < 0.42) return 'guard';
      if (r < 0.72) return 'overload';
      return randomMove();
    }
    case 'circuit-queen': {
      if (Math.random() < 0.72) return counterTo(playerLastMove);
      return randomMove();
    }
    default:
      return randomMove();
  }
}
