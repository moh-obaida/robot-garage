/** Shared turn-based combat helpers for PvP Arena and training battles. */

export type BattleAction = 'strike' | 'fortify' | 'overcharge' | 'repair'

export interface Combatant {
  name: string
  maxHp: number
  hp: number
  attack: number
  defense: number
  speed: number
  guardPct: number
  strikeMult: number
  repairsLeft: number
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function rollDamage(attack: number, defense: number, mult: number, guardPct: number): number {
  const variance = 0.88 + Math.random() * 0.24
  let raw = attack * mult * variance - defense * 0.55
  if (guardPct > 0) raw *= 1 - guardPct
  return Math.max(1, Math.floor(raw))
}

export function initiative(playerSpd: number, enemySpd: number): 'player' | 'enemy' {
  if (playerSpd > enemySpd) return 'player'
  if (enemySpd > playerSpd) return 'enemy'
  return Math.random() < 0.5 ? 'player' : 'enemy'
}

export function makeCombatant(
  name: string,
  maxHp: number,
  atk: number,
  def: number,
  spd: number,
): Combatant {
  return {
    name,
    maxHp,
    hp: maxHp,
    attack: atk,
    defense: def,
    speed: spd,
    guardPct: 0,
    strikeMult: 1,
    repairsLeft: 2,
  }
}

export interface EnemyTurnOutcome {
  player: Combatant
  enemy: Combatant
  logLines: string[]
  playerDefeated: boolean
}

/** One enemy turn: repair, strike, or brace. */
export function simulateEnemyTurn(pState: Combatant, eState: Combatant): EnemyTurnOutcome {
  const e = { ...eState }
  const p = { ...pState }
  const logLines: string[] = []

  const pct = e.hp / e.maxHp
  if (pct < 0.35 && e.repairsLeft > 0 && Math.random() < 0.62) {
    const heal = Math.floor(e.maxHp * 0.22)
    e.hp = clamp(e.hp + heal, 0, e.maxHp)
    e.repairsLeft -= 1
    logLines.push(`${e.name} executes field repair (+${heal}).`)
  } else if (Math.random() < 0.72) {
    const mult = e.strikeMult
    const dmg = rollDamage(e.attack, p.defense, mult, p.guardPct)
    p.hp = clamp(p.hp - dmg, 0, p.maxHp)
    p.guardPct = 0
    e.strikeMult = 1
    logLines.push(`${e.name} strikes for ${dmg}.`)
  } else {
    e.guardPct = 0.35
    logLines.push(`${e.name} braces — next hit mitigated.`)
  }

  const playerDefeated = p.hp <= 0
  if (!playerDefeated) logLines.push(`Your turn.`)
  return {
    player: p,
    enemy: e,
    logLines,
    playerDefeated,
  }
}
