import { useCallback, useEffect, useRef, useState } from 'react'
import type { MiniGameResult } from '../types/quests'
import {
  type BattleAction,
  type Combatant,
  clamp,
  initiative,
  makeCombatant,
  rollDamage,
  simulateEnemyTurn,
} from '../utils/battleEngine'

export interface TrainingCombatProfile {
  name: string
  maxHp: number
  attack: number
  defense: number
  speed: number
}

export function TrainingBattleGame({
  player: playerProfile,
  onFinish,
}: {
  player: TrainingCombatProfile
  onFinish: (r: MiniGameResult) => void
}) {
  const [player, setPlayer] = useState<Combatant | null>(null)
  const [enemy, setEnemy] = useState<Combatant | null>(null)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [log, setLog] = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ended = useRef(false)

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    ended.current = false
    const p = makeCombatant(
      playerProfile.name,
      playerProfile.maxHp,
      playerProfile.attack,
      playerProfile.defense,
      playerProfile.speed,
    )
    const e = makeCombatant('Spar-Bot', 58, 4, 2, 2)
    const first = initiative(p.speed, e.speed)
    /* Battle bootstrap: sync local fight state when profile / remount changes */
    queueMicrotask(() => {
      setPlayer(p)
      setEnemy(e)
      setTurn(first)
      setLog([`Training start. ${first === 'player' ? p.name : e.name} moves first.`])
    })
    return () => {
      ended.current = true
      cleanupTimer()
    }
  }, [playerProfile])

  const endBattle = useCallback(
    (won: boolean, pHp: number) => {
      if (ended.current) return
      ended.current = true
      cleanupTimer()
      onFinish({ success: won, score: Math.max(0, won ? pHp + 40 : pHp) })
    },
    [onFinish],
  )

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 10))
  }, [])

  const applyEnemyTurn = useCallback(
    (pState: Combatant, eState: Combatant) => {
      if (ended.current) return
      const out = simulateEnemyTurn(pState, eState)
      out.logLines.forEach((l) => pushLog(l))
      if (out.playerDefeated) {
        setPlayer(out.player)
        setEnemy(out.enemy)
        endBattle(false, 0)
        return
      }
      setPlayer(out.player)
      setEnemy(out.enemy)
      setTurn('player')
    },
    [endBattle, pushLog],
  )

  const playerAct = (action: BattleAction) => {
    if (ended.current || turn !== 'player' || !player || !enemy) return

    const p = { ...player }
    const e = { ...enemy }

    if (action === 'strike') {
      const dmg = rollDamage(p.attack, e.defense, p.strikeMult, e.guardPct)
      e.hp = clamp(e.hp - dmg, 0, e.maxHp)
      e.guardPct = 0
      pushLog(`${p.name} strikes for ${dmg}.`)
      p.strikeMult = 1
    } else if (action === 'fortify') {
      p.guardPct = 0.35
      pushLog(`${p.name} fortifies.`)
    } else if (action === 'overcharge') {
      p.strikeMult = 1.5
      pushLog(`${p.name} overcharges.`)
    } else if (action === 'repair') {
      if (p.repairsLeft <= 0) {
        pushLog('No repairs left.')
        return
      }
      const heal = Math.floor(p.maxHp * 0.2)
      p.hp = clamp(p.hp + heal, 0, p.maxHp)
      p.repairsLeft -= 1
      pushLog(`${p.name} repairs (+${heal}).`)
    }

    if (e.hp <= 0) {
      setPlayer(p)
      setEnemy(e)
      endBattle(true, p.hp)
      return
    }

    setPlayer(p)
    setEnemy(e)
    setTurn('enemy')
    cleanupTimer()
    timerRef.current = setTimeout(() => applyEnemyTurn(p, e), 420)
  }

  if (!player || !enemy) {
    return <p className="text-center text-slate-400">Loading…</p>
  }

  const pp = Math.round((player.hp / player.maxHp) * 100)
  const ep = Math.round((enemy.hp / enemy.maxHp) * 100)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-cyan-500/40 bg-slate-900/80 p-2">
          <p className="font-bold text-cyan-100">{player.name}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-cyan-500" style={{ width: `${pp}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-rose-500/40 bg-slate-900/80 p-2">
          <p className="font-bold text-rose-100">{enemy.name}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-rose-500" style={{ width: `${ep}%` }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <MiniBtn label="Strike" disabled={turn !== 'player'} onClick={() => playerAct('strike')} />
        <MiniBtn label="Fortify" disabled={turn !== 'player'} onClick={() => playerAct('fortify')} />
        <MiniBtn
          label="Overcharge"
          disabled={turn !== 'player'}
          onClick={() => playerAct('overcharge')}
        />
        <MiniBtn
          label={`Repair (${player.repairsLeft})`}
          disabled={turn !== 'player' || player.repairsLeft <= 0}
          onClick={() => playerAct('repair')}
        />
      </div>
      <ul className="max-h-[100px] space-y-1 overflow-y-auto text-[11px] text-slate-500">
        {log.map((line, i) => (
          <li key={`${i}-${line.slice(0, 8)}`}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

function MiniBtn({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-bold ${
        disabled
          ? 'cursor-not-allowed bg-slate-800 text-slate-600'
          : 'bg-indigo-600 text-white hover:bg-indigo-500'
      }`}
    >
      {label}
    </button>
  )
}
