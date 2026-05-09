import { useCallback, useMemo, useState } from 'react'
import { OPPONENTS } from '../data/opponents'
import { getColorById } from '../data/colors'
import { Panel } from '../components/Panel'
import { buildPlayerCombatants, useGameStore } from '../store/useGameStore'
import type { ArenaOpponent } from '../types/game'

type Phase = 'pick' | 'fight' | 'end'

type BattleAction = 'strike' | 'fortify' | 'overcharge' | 'repair'

interface Combatant {
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

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function rollDamage(attack: number, defense: number, mult: number, guardPct: number): number {
  const variance = 0.88 + Math.random() * 0.24
  let raw = attack * mult * variance - defense * 0.55
  if (guardPct > 0) raw *= 1 - guardPct
  return Math.max(1, Math.floor(raw))
}

function initiative(playerSpd: number, enemySpd: number): 'player' | 'enemy' {
  if (playerSpd > enemySpd) return 'player'
  if (enemySpd > playerSpd) return 'enemy'
  return Math.random() < 0.5 ? 'player' : 'enemy'
}

function makeCombatant(
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

export function Arena() {
  const snapshot = useGameStore((s) => ({
    robotName: s.robotName,
    paintColorId: s.paintColorId,
    upgradeLevels: s.upgradeLevels,
    completedMissions: s.completedMissions,
  }))
  const recordArenaResult = useGameStore((s) => s.recordArenaResult)

  const [phase, setPhase] = useState<Phase>('pick')
  const [opponent, setOpponent] = useState<ArenaOpponent | null>(null)
  const [player, setPlayer] = useState<Combatant | null>(null)
  const [enemy, setEnemy] = useState<Combatant | null>(null)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [log, setLog] = useState<string[]>([])
  const [result, setResult] = useState<'win' | 'loss' | null>(null)

  const playerBase = useMemo(() => buildPlayerCombatants(snapshot), [snapshot])

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 14))
  }, [])

  const startMatch = (opp: ArenaOpponent) => {
    const p = makeCombatant(
      playerBase.name,
      playerBase.maxHp,
      playerBase.attack,
      playerBase.defense,
      playerBase.speed,
    )
    const e = makeCombatant(opp.callsign, opp.maxHp, opp.attack, opp.defense, opp.speed)
    const first = initiative(p.speed, e.speed)
    setOpponent(opp)
    setPlayer(p)
    setEnemy(e)
    setTurn(first)
    setPhase('fight')
    setResult(null)
    setLog([
      `Match vs ${opp.callsign}.`,
      `${first === 'player' ? p.name : e.name} seizes initiative (speed ${first === 'player' ? p.speed : e.speed}).`,
    ])
  }

  const endBattle = useCallback(
    (won: boolean) => {
      if (!opponent) return
      setPhase('end')
      setResult(won ? 'win' : 'loss')
      recordArenaResult(won, won ? opponent.winScrap : 0)
      pushLog(won ? `Victory! +${opponent.winScrap} scrap.` : 'Defeat — scrap withheld.')
    },
    [opponent, pushLog, recordArenaResult],
  )

  const applyEnemyTurn = useCallback(
    (pState: Combatant, eState: Combatant) => {
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

      if (p.hp <= 0) {
        setPlayer(p)
        setEnemy(e)
        logLines.forEach((l) => pushLog(l))
        endBattle(false)
        return
      }

      setPlayer(p)
      setEnemy(e)
      logLines.push(`Your turn.`)
      logLines.forEach((l) => pushLog(l))
      setTurn('player')
    },
    [endBattle, pushLog],
  )

  const playerAct = (action: BattleAction) => {
    if (phase !== 'fight' || turn !== 'player' || !player || !enemy) return

    const p = { ...player }
    const e = { ...enemy }
    const lines: string[] = []

    if (action === 'strike') {
      const dmg = rollDamage(p.attack, e.defense, p.strikeMult, e.guardPct)
      e.hp = clamp(e.hp - dmg, 0, e.maxHp)
      e.guardPct = 0
      lines.push(`${p.name} strikes for ${dmg}${p.strikeMult > 1 ? ' (overcharged)' : ''}.`)
      p.strikeMult = 1
    } else if (action === 'fortify') {
      p.guardPct = 0.35
      lines.push(`${p.name} fortifies — incoming damage reduced next hit.`)
    } else if (action === 'overcharge') {
      p.strikeMult = 1.55
      lines.push(`${p.name} overcharges weapons — next strike amplified.`)
    } else if (action === 'repair') {
      if (p.repairsLeft <= 0) {
        pushLog('No repairs remaining.')
        return
      }
      const heal = Math.floor(p.maxHp * 0.22)
      p.hp = clamp(p.hp + heal, 0, p.maxHp)
      p.repairsLeft -= 1
      lines.push(`${p.name} patches hull (+${heal}).`)
    }

    lines.forEach((l) => pushLog(l))

    if (e.hp <= 0) {
      setPlayer(p)
      setEnemy(e)
      endBattle(true)
      return
    }

    setPlayer(p)
    setEnemy(e)
    setTurn('enemy')
    window.setTimeout(() => applyEnemyTurn(p, e), 450)
  }

  const pc = getColorById(playerBase.color)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="PvP circuit" subtitle="Turn-based. Out-think the rival pilots." className="lg:col-span-2">
        {phase === 'pick' ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {OPPONENTS.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-4"
              >
                <h3 className="font-[family-name:var(--font-display)] font-bold text-slate-100">
                  {o.callsign}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  HP {o.maxHp} · ATK {o.attack} · DEF {o.defense} · SPD {o.speed}
                </p>
                <p className="mt-2 text-sm text-amber-200/90">Win: +{o.winScrap} scrap</p>
                <button
                  type="button"
                  onClick={() => startMatch(o)}
                  className="mt-3 w-full rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Enter arena
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {phase === 'fight' && player && enemy ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FighterCard
                label="You"
                tint={pc?.hex ?? '#22d3ee'}
                c={player}
                active={turn === 'player'}
              />
              <FighterCard label="Rival" tint="#f472b6" c={enemy} active={turn === 'enemy'} />
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                label="Strike"
                hint="Deal damage"
                disabled={turn !== 'player'}
                onClick={() => playerAct('strike')}
              />
              <ActionBtn
                label="Fortify"
                hint="Reduce next hit"
                disabled={turn !== 'player'}
                onClick={() => playerAct('fortify')}
              />
              <ActionBtn
                label="Overcharge"
                hint="Buff next strike"
                disabled={turn !== 'player'}
                onClick={() => playerAct('overcharge')}
              />
              <ActionBtn
                label={`Repair (${player.repairsLeft})`}
                hint="Heal 22% max HP"
                disabled={turn !== 'player' || player.repairsLeft <= 0}
                onClick={() => playerAct('repair')}
              />
            </div>
          </div>
        ) : null}

        {phase === 'end' && result ? (
          <div className="rounded-xl border border-slate-600 bg-slate-950/70 p-6 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-50">
              {result === 'win' ? 'Win recorded' : 'Loss logged'}
            </p>
            <p className="mt-2 text-slate-400">
              {result === 'win' && opponent
                ? `Payout: ${opponent.winScrap} scrap.`
                : 'Train in upgrades and try another callsign.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setPhase('pick')
                setOpponent(null)
                setPlayer(null)
                setEnemy(null)
                setLog([])
                setResult(null)
              }}
              className="mt-6 rounded-lg bg-cyan-500 px-6 py-2 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Back to matchmaking
            </button>
          </div>
        ) : null}
      </Panel>

      <Panel title="Battle log" subtitle="Latest exchanges.">
        <ul className="max-h-[420px] space-y-2 overflow-y-auto text-sm text-slate-300">
          {log.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 12)}`}
              className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2"
            >
              {line}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function FighterCard({
  label,
  tint,
  c,
  active,
}: {
  label: string
  tint: string
  c: Combatant
  active: boolean
}) {
  const pct = Math.round((c.hp / c.maxHp) * 100)
  return (
    <div
      className={`rounded-xl border p-4 ${
        active ? 'border-cyan-400/70 bg-cyan-950/20 shadow-[0_0_24px_rgba(34,211,238,0.15)]' : 'border-slate-700 bg-slate-950/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-display)] font-bold text-slate-100">{c.name}</p>
        <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tint}, #fff2)`,
            boxShadow: `0 0 12px ${tint}`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {c.hp}/{c.maxHp} HP · mult ×{c.strikeMult.toFixed(2)} · guard{' '}
        {c.guardPct > 0 ? `${Math.round(c.guardPct * 100)}%` : '—'}
      </p>
    </div>
  )
}

function ActionBtn({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string
  hint: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
        disabled
          ? 'cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600'
          : 'border-cyan-500/50 bg-slate-900 text-cyan-50 hover:border-cyan-400 hover:bg-slate-800'
      }`}
    >
      <span className="block">{label}</span>
      <span className="block text-[10px] font-normal text-slate-500">{hint}</span>
    </button>
  )
}
