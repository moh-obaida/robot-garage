import { useCallback, useEffect, useRef, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

const COLS = [
  { id: 0, bg: 'bg-red-500', glow: 'shadow-[0_0_20px_#ef4444]' },
  { id: 1, bg: 'bg-blue-500', glow: 'shadow-[0_0_20px_#3b82f6]' },
  { id: 2, bg: 'bg-green-500', glow: 'shadow-[0_0_20px_#22c55e]' },
  { id: 3, bg: 'bg-amber-400', glow: 'shadow-[0_0_20px_#facc15]' },
]

const ROUNDS_WIN = 3
const SHOW_MS = 520
const BETWEEN_MS = 280

type Phase = 'show' | 'input' | 'done'

export function MemoryCircuitGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('show')
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIdx, setInputIdx] = useState(0)
  const [lit, setLit] = useState<number | null>(null)
  const [message, setMessage] = useState('Watch the pattern…')
  const [ended, setEnded] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const fail = useCallback(
    (r: number) => {
      setEnded(true)
      clearTimers()
      setMessage('Pattern missed!')
      onFinishRef.current({ success: false, score: Math.max(0, r - 1) })
    },
    [],
  )

  const winAll = useCallback(() => {
    setEnded(true)
    clearTimers()
    setPhase('done')
    setMessage('Circuits synced!')
    onFinishRef.current({ success: true, score: ROUNDS_WIN })
  }, [])

  const playSequence = useCallback((seq: number[], then: () => void) => {
    clearTimers()
    let t = 0
    seq.forEach((cell, i) => {
      t += i === 0 ? 400 : BETWEEN_MS
      const tid1 = setTimeout(() => {
        setLit(cell)
        setMessage(`Pattern ${i + 1}/${seq.length}`)
      }, t)
      timers.current.push(tid1)
      t += SHOW_MS
      const tid2 = setTimeout(() => setLit(null), t)
      timers.current.push(tid2)
    })
    const tidEnd = setTimeout(then, t + 200)
    timers.current.push(tidEnd)
  }, [])

  const startRound = useCallback(
    (r: number) => {
      const len = 2 + Math.min(r, 2)
      const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4))
      setSequence(seq)
      setInputIdx(0)
      setPhase('show')
      setMessage('Watch…')
      playSequence(seq, () => {
        setPhase('input')
        setMessage('Your turn — tap the cells.')
      })
    },
    [playSequence],
  )

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      startRound(1)
    })
    return () => {
      window.cancelAnimationFrame(id)
      clearTimers()
    }
  }, [startRound])

  const onCellTap = (id: number) => {
    if (phase !== 'input' || ended) return
    const expect = sequence[inputIdx]
    if (id !== expect) {
      fail(round)
      return
    }
    const next = inputIdx + 1
    setInputIdx(next)
    if (next >= sequence.length) {
      if (round >= ROUNDS_WIN) {
        winAll()
      } else {
        const nr = round + 1
        setRound(nr)
        setPhase('show')
        setMessage('Nice! Next round…')
        const t = setTimeout(() => startRound(nr), 600)
        timers.current.push(t)
      }
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-cyan-100/90">{message}</p>
      <p className="text-center text-xs text-slate-500">
        Round {Math.min(round, ROUNDS_WIN)}/{ROUNDS_WIN}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {COLS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={phase !== 'input' || ended}
            onClick={() => onCellTap(c.id)}
            className={`relative h-20 rounded-xl border-2 border-slate-700 transition ${
              lit === c.id ? `${c.bg} ${c.glow} scale-95` : 'bg-slate-900/90'
            } ${phase === 'input' && !ended ? 'hover:brightness-125 active:scale-95' : 'opacity-80'}`}
          >
            <span className="sr-only">cell {c.id}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
