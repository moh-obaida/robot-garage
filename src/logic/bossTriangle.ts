export type BossTactic = 'strike' | 'guard' | 'overload';

const ORDER: BossTactic[] = ['strike', 'guard', 'overload'];

export function resolveBossRound(
  player: BossTactic,
  rival: BossTactic,
): 'win' | 'lose' | 'tie' {
  if (player === rival) return 'tie';
  if (
    (player === 'strike' && rival === 'overload') ||
    (player === 'overload' && rival === 'guard') ||
    (player === 'guard' && rival === 'strike')
  ) {
    return 'win';
  }
  return 'lose';
}

export function randomBossTactic(): BossTactic {
  return ORDER[Math.floor(Math.random() * ORDER.length)]!;
}
