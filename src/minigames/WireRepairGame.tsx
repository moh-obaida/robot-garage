import { useCallback, useMemo, useState } from 'react'
import type { MiniGameResult } from '../types/quests'

const WIRES = ['A', 'B', 'C', 'D', 'E'] as const

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function WireRepairGame({ onFinish }: { onFinish: (r: MiniGameResult) => void }) {
  const mapping = useMemo(() => {
    const ports = shuffle([0, 1, 2, 3, 4])
    return Object.fromEntries(WIRES.map((w, i) => [w, ports[i]])) as Record<
      (typeof WIRES)[number],
      number
    >
  }, [])

  const [selectedWire, setSelectedWire] = useState<(typeof WIRES)[number] | null>(null)
  const [paired, setPaired] = useState<Partial<Record<(typeof WIRES)[number], number>>>({})
  const [wrongLeft, setWrongLeft] = useState(4)
  const [shake, setShake] = useState(false)

  const donePairs = Object.keys(paired).length

  const finishWin = useCallback(() => {
    const wrong = 4 - wrongLeft
    onFinish({ success: true, score: Math.max(0, 100 - wrong * 15) })
  }, [onFinish, wrongLeft])

  const pickPort = (portIndex: number) => {
    if (!selectedWire || paired[selectedWire] != null) return
    if (mapping[selectedWire] === portIndex) {
      const next = { ...paired, [selectedWire]: portIndex }
      setPaired(next)
      setSelectedWire(null)
      if (Object.keys(next).length === WIRES.length) finishWin()
    } else {
      setShake(true)
      window.setTimeout(() => setShake(false), 400)
      const w = wrongLeft - 1
      setWrongLeft(w)
      setSelectedWire(null)
      if (w <= 0) onFinish({ success: false, score: donePairs * 20 })
    }
  }

  return (
    <div className={`space-y-4 ${shake ? 'animate-pulse' : ''}`}>
      <p className="text-center text-sm text-slate-300">Tries left: {wrongLeft}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {WIRES.map((w) => {
          const locked = paired[w] != null
          const active = selectedWire === w
          return (
            <button
              key={w}
              type="button"
              disabled={locked}
              onClick={() => setSelectedWire(locked ? null : w)}
              className={`min-h-[48px] min-w-[52px] rounded-xl border-2 px-4 py-3 text-lg font-bold ${
                locked
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                  : active
                    ? 'border-cyan-400 bg-cyan-950/50 text-cyan-100'
                    : 'border-slate-600 bg-slate-900 text-slate-200'
              }`}
            >
              {w}
            </button>
          )
        })}
      </div>
      <p className="text-center text-xs text-slate-500">Tap a wire, then a numbered port.</p>
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((p) => {
          const taken = Object.values(paired).includes(p)
          return (
            <button
              key={p}
              type="button"
              disabled={taken}
              onClick={() => pickPort(p)}
              className={`min-h-[52px] rounded-xl border text-lg font-bold ${
                taken
                  ? 'cursor-default border-slate-800 bg-slate-900 text-slate-600'
                  : 'border-fuchsia-500/50 bg-slate-900 text-fuchsia-100 hover:bg-slate-800'
              }`}
            >
              {p + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
