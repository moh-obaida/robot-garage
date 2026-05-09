import { useCallback, useMemo, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

type Cell = 'part' | 'junk' | 'spark' | 'empty'

const SIZE = 5

function buildGrid(): Cell[] {
  const cells: Cell[] = Array(SIZE * SIZE).fill('empty')
  const idx = () => Math.floor(Math.random() * cells.length)
  const place = (t: Cell) => {
    let i = idx()
    let guard = 0
    while (cells[i] !== 'empty' && guard++ < 80) i = idx()
    if (cells[i] === 'empty') cells[i] = t
  }
  for (let p = 0; p < 3; p++) place('part')
  for (let j = 0; j < 6; j++) place('junk')
  place('spark')
  return cells
}

export function JunkyardSearchGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const grid = useMemo(() => buildGrid(), [])
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set())
  const [clicksLeft, setClicksLeft] = useState(11)
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
      if (np >= 3) {
        end(true, 300 - (11 - nextClicks) * 10)
        return
      }
    }
    if (nextClicks <= 0 && parts < 3) end(false, parts * 40)
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-amber-200">Digs left: {clicksLeft} · Parts: {parts}/3</p>
      <div
        className="mx-auto grid max-w-[280px] gap-1"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
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
