import { useState } from 'react'
import { Panel } from '../components/Panel'
import { FactoryLineGame } from '../components/FactoryLineGame'
import {
  CIRCUIT_CUP_IDS,
  CIRCUIT_CUPS,
  STORY_CHAPTER_DEFS,
  STORY_CHAPTER_IDS,
  WORLD_BOSSES,
  WORLD_BOSS_IDS,
  type WorldBossId,
} from '../data/worldPhase8'
import { randomBossTactic, resolveBossRound, type BossTactic } from '../logic/bossTriangle'
import { useGameStore } from '../store/useGameStore'

function tacticLabel(t: BossTactic) {
  switch (t) {
    case 'strike':
      return 'Strike'
    case 'guard':
      return 'Guard'
    case 'overload':
      return 'Overload'
    default:
      return t
  }
}

function bossLockedHint(id: WorldBossId): string {
  if (id === 'tri-stack') return 'Unlocks after Night Haul.'
  return 'Unlocks after both story chapters are cleared.'
}

function WorldBossPanel({ bossId }: { bossId: WorldBossId }) {
  const def = WORLD_BOSSES[bossId]
  const prog = useGameStore((s) => s.worldBosses[bossId])
  const claimVictory = useGameStore((s) => s.claimWorldBossVictory)
  const [pw, setPw] = useState(0)
  const [bw, setBw] = useState(0)
  const [lastLine, setLastLine] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const resetBout = () => {
    setPw(0)
    setBw(0)
    setLastLine(null)
    setFeedback(null)
  }

  const playTactic = (player: BossTactic) => {
    if (!prog?.unlocked || prog.defeatedOnce) return
    if (pw >= 2 || bw >= 2) return
    const rival = randomBossTactic()
    const out = resolveBossRound(player, rival)
    const detail = `You ${tacticLabel(player)} vs ${tacticLabel(rival)}`
    if (out === 'tie') {
      setLastLine(`${detail} — stalemate, no point scored.`)
      return
    }
    if (out === 'win') {
      const next = pw + 1
      setPw(next)
      setLastLine(`${detail} — you score. (${next}/2)`)
      if (next >= 2) {
        const r = claimVictory(bossId)
        if (!r.ok && r.message) setFeedback(r.message)
        else setFeedback('Boss down — rewards banked.')
      }
      return
    }
    const next = bw + 1
    setBw(next)
    setLastLine(`${detail} — boss scores. (${next}/2)`)
    if (next >= 2) {
      setFeedback(def.tipOnLoss)
    }
  }

  if (!prog) return null

  return (
    <div
      className={`rounded-xl border px-3 py-3 text-sm ${
        prog.defeatedOnce
          ? 'border-emerald-500/35 bg-emerald-950/20'
          : prog.unlocked
            ? 'border-rose-500/35 bg-rose-950/15'
            : 'border-slate-800 bg-slate-950/40 opacity-70'
      }`}
    >
      <p className="font-bold text-slate-100">{def.title}</p>
      <p className="mt-1 text-xs text-slate-400">{def.blurb}</p>
      {!prog.unlocked ? (
        <p className="mt-2 text-xs text-slate-500">{bossLockedHint(bossId)}</p>
      ) : prog.defeatedOnce ? (
        <p className="mt-2 text-xs text-emerald-200/90">Defeated — one-time payout collected.</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-slate-500">
            First to two clean wins — Strike beats Overload, Overload beats Guard, Guard beats Strike.
          </p>
          <p className="mt-1 text-xs text-amber-200/90">
            Score: you {pw} — boss {bw}
          </p>
          {lastLine ? (
            <p className="mt-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-2 py-1 text-xs text-slate-300">
              {lastLine}
            </p>
          ) : null}
          {feedback && bw >= 2 ? (
            <p className="mt-2 text-xs text-amber-200/90">{feedback}</p>
          ) : feedback && pw >= 2 ? (
            <p className="mt-2 text-xs text-emerald-200/90">{feedback}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {(['strike', 'guard', 'overload'] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={pw >= 2 || bw >= 2}
                onClick={() => playTactic(t)}
                className="min-h-[40px] rounded-lg bg-slate-800 px-3 text-xs font-bold text-slate-100 hover:bg-slate-700 disabled:opacity-45"
              >
                {tacticLabel(t)}
              </button>
            ))}
            <button
              type="button"
              onClick={resetBout}
              className="min-h-[40px] rounded-lg border border-slate-600 px-3 text-xs font-bold text-slate-300 hover:bg-slate-900"
            >
              Reset bout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function World() {
  const storyChapters = useGameStore((s) => s.storyChapters)
  const arenaWins = useGameStore((s) => s.arenaWins)
  const circuitCupClaimed = useGameStore((s) => s.circuitCupClaimed)
  const completeStoryChapter = useGameStore((s) => s.completeStoryChapter)
  const claimCircuitCup = useGameStore((s) => s.claimCircuitCup)
  const claimFactoryRunSuccess = useGameStore((s) => s.claimFactoryRunSuccess)

  const [chapterMsg, setChapterMsg] = useState<string | null>(null)
  const [cupMsg, setCupMsg] = useState<string | null>(null)
  const [factoryMsg, setFactoryMsg] = useState<string | null>(null)

  const nightDone = storyChapters['night-haul']?.completedOnce

  return (
    <div className="space-y-5">
      <Panel
        title="World bay"
        subtitle="Story chapters, factory payout, circuit cups, and yard bosses — one-time rewards where noted."
      >
        <p className="text-sm text-slate-400">
          PvP wins unlock circuit cups; story chapters open the factory and bosses.
        </p>
      </Panel>

      <Panel title="Story chapters" subtitle="Complete in order for scrap and XP.">
        {chapterMsg ? (
          <p className="mb-3 rounded-lg border border-cyan-500/30 bg-cyan-950/25 px-3 py-2 text-xs text-cyan-100">
            {chapterMsg}
          </p>
        ) : null}
        <ul className="space-y-3">
          {STORY_CHAPTER_IDS.map((id) => {
            const def = STORY_CHAPTER_DEFS[id]
            const row = storyChapters[id]
            const done = row?.completedOnce
            const locked = !row?.unlocked
            return (
              <li
                key={id}
                className="rounded-xl border border-slate-700/80 bg-slate-950/55 px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-100">{def.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{def.objective}</p>
                    <p className="mt-2 text-xs text-amber-200/85">
                      +{def.rewardScrap} scrap · +{def.rewardXp} XP
                    </p>
                    {done ? (
                      <p className="mt-1 text-xs italic text-emerald-200/80">{def.flavorWin}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={locked || done}
                    onClick={() => {
                      setChapterMsg(null)
                      const r = completeStoryChapter(id)
                      if (r.ok) setChapterMsg(def.flavorWin)
                      else if (r.message) setChapterMsg(r.message)
                    }}
                    className="min-h-[40px] shrink-0 rounded-xl bg-cyan-500 px-4 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {done ? 'Cleared' : locked ? 'Locked' : 'Complete chapter'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel
        title="Factory line"
        subtitle="Stamp three clean hits. First batch pays extra once per save."
      >
        {factoryMsg ? (
          <p className="mb-3 rounded-lg border border-amber-500/35 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
            {factoryMsg}
          </p>
        ) : null}
        {!nightDone ? (
          <p className="text-sm text-slate-500">
            Certify <strong className="text-slate-300">Night Haul</strong> above to unlock the press.
          </p>
        ) : (
          <FactoryLineGame
            disabled={!nightDone}
            onSuccessRun={() => {
              setFactoryMsg(null)
              const wasFirst = !useGameStore.getState().factoryFirstBonusClaimed
              const r = claimFactoryRunSuccess()
              if (r.ok) {
                setFactoryMsg(
                  wasFirst
                    ? `First batch bonus banked — extra scrap and XP.`
                    : `Repeat run paid +scrap / +XP (smaller stipend).`,
                )
              } else if (r.message) setFactoryMsg(r.message)
            }}
          />
        )}
      </Panel>

      <Panel title="Circuit cups" subtitle="Claim once per cup when you have enough arena wins.">
        {cupMsg ? (
          <p className="mb-3 rounded-lg border border-violet-500/35 bg-violet-950/25 px-3 py-2 text-xs text-violet-100">
            {cupMsg}
          </p>
        ) : null}
        <ul className="space-y-3">
          {CIRCUIT_CUP_IDS.map((id) => {
            const c = CIRCUIT_CUPS[id]
            const claimed = circuitCupClaimed[id]
            const eligible = arenaWins >= c.minArenaWins
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-3"
              >
                <div>
                  <p className="font-bold text-slate-100">{c.label}</p>
                  <p className="text-xs text-slate-500">{c.blurb}</p>
                  <p className="mt-1 text-xs text-amber-200/85">
                    Requires {c.minArenaWins} win{c.minArenaWins === 1 ? '' : 's'} · +{c.scrap}{' '}
                    scrap · +{c.xp} XP
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!eligible || claimed}
                  onClick={() => {
                    setCupMsg(null)
                    const r = claimCircuitCup(id)
                    if (r.ok) setCupMsg(`${c.label} rewards banked.`)
                    else if (r.message) setCupMsg(r.message)
                  }}
                  className="min-h-[40px] rounded-xl bg-violet-500 px-4 text-xs font-bold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {claimed ? 'Claimed' : eligible ? 'Claim' : 'Not eligible'}
                </button>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel title="Yard bosses" subtitle="Triangle tactics — one-time scrap and XP each.">
        <div className="grid gap-3 md:grid-cols-2">
          {WORLD_BOSS_IDS.map((id) => (
            <WorldBossPanel key={id} bossId={id} />
          ))}
        </div>
      </Panel>
    </div>
  )
}
