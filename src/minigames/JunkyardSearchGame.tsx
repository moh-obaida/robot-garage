import { useCallback, useMemo, useState } from 'react'
import type { JunkyardDifficulty, MiniGameResult } from '../types/quests'

type Cell = 'part' | 'junk' | 'spark' | 'empty'

const PRESETS: Record<
  JunkyardDifficulty,
  { junk: number; sparks: number; parts: number }
> = {
  easy: { junk: 5, sparks: 1, parts: 3 },
  standard: { junk: 6, sparks: 1, parts: 3 },
  challenge: { junk: 8, sparks: 2, parts: 3 },
}

const CLICKS: Record<JunkyardDifficulty, number> = {
  easy: 13,
  standard: 11,
  challenge: 7,
}

function buildGrid(size: number, diff: JunkyardDifficulty): Cell[] {
  const { junk, sparks, parts } = PRESETS[diff]
  const cells: Cell[] = Array(size * size).fill('empty')
  const idx = () => Math.floor(Math.random() * cells.length)
  const place = (t: Cell) => {
    let i = idx()
    let guard = 0
    while (cells[i] !== 'empty' && guard++ < 120) i = idx()
    if (cells[i] === 'empty') cells[i] = t
  }
  for (let p = 0; p < parts; p++) place('part')
  for (let j = 0; j < junk; j++) place('junk')
  for (let s = 0; s < sparks; s++) place('spark')
  return cells
}

export function JunkyardSearchGame({
  difficulty,
  onFinish,
}: {
  difficulty: JunkyardDifficulty
  onFinish: (r: MiniGameResult) => void
}) {
  const size = difficulty === 'easy' ? 4 : 5
  const maxClicks = CLICKS[difficulty]
  const partsNeeded = PRESETS[difficulty].parts

  const grid = useMemo(() => buildGrid(size, difficulty), [size, difficulty])
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set())
  const [clicksLeft, setClicksLeft] = useState(maxClicks)
  const [parts, setParts] = useState(0)

  const end = useCallback(
    (success: boolean, score: number) => {
      onFinish({ success, score })
    },
    [onFinish],
  )

  const tap = (i: number) => {
    if (revealed.has(i) || clicksLeft <= 0) return
    const nextRev = new Set(revealed)
    nextRev.add(i)
    setRevealed(nextRev)
    const c = grid[i]
    const nextClicks = clicksLeft - 1
    setClicksLeft(nextClicks)

    if (c === 'spark') {
      end(false, parts * 40)
      return
    }
    if (c === 'part') {
      const np = parts + 1
      setParts(np)
      if (np >= partsNeeded) {
        end(true, 300 - (maxClicks - nextClicks) * 10)
        return
      }
    }
    if (nextClicks <= 0 && parts < partsNeeded) end(false, parts * 40)
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-amber-200">
        {difficulty === 'easy'
          ? 'Easy'
          : difficulty === 'challenge'
            ? 'Challenge'
            : 'Standard'}
        : {size}×{size} · Digs left: {clicksLeft} · Parts: {parts}/{partsNeeded}
      </p>
      <div
        className="mx-auto grid max-w-[280px] gap-1"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {grid.map((cell, i) => {
          const show = revealed.has(i)
          let label = '?'
          let cls = 'bg-slate-800 text-slate-400 border-slate-600'
          if (show) {
            if (cell === 'part') {
              label = '⚙'
              cls = 'bg-emerald-900/80 text-emerald-200 border-emerald-500/50'
            } else if (cell === 'junk') {
              label = '···'
              cls = 'bg-slate-900 text-slate-500 border-slate-700'
            } else if (cell === 'spark') {
              label = '⚡'
              cls = 'bg-rose-900/80 text-rose-200 border-rose-500/60'
            } else {
              label = '·'
              cls = 'bg-slate-900/60 text-slate-600 border-slate-800'
            }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={show || clicksLeft <= 0}
              onClick={() => tap(i)}
              className={`flex aspect-square items-center justify-center rounded-lg border-2 text-lg font-bold ${cls}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
