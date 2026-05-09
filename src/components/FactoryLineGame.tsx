import { useEffect, useRef, useState } from 'react'

const STAMPS_NEEDED = 3
const BAND = { left: 0.36, width: 0.28 }

export function FactoryLineGame({
  disabled,
  onSuccessRun,
}: {
  disabled: boolean
  onSuccessRun: () => void
}) {
  const [running, setRunning] = useState(false)
  const [marker, setMarker] = useState(0)
  const dirRef = useRef(1)
  const [stamps, setStamps] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const speed = 0.024
    let raf = 0
    const tick = () => {
      setMarker((m) => {
        let n = m + speed * dirRef.current
        if (n >= 1) {
          n = 1
          dirRef.current = -1
        } else if (n <= 0) {
          n = 0
          dirRef.current = 1
        }
        return n
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  const resetLine = () => {
    finishedRef.current = false
    setRunning(false)
    setMarker(0)
    dirRef.current = 1
    setStamps(0)
    setFeedback(null)
  }

  const startLine = () => {
    if (disabled) return
    finishedRef.current = false
    setStamps(0)
    setMarker(0)
    dirRef.current = 1
    setFeedback('Stamp when the ram sits in the green slot — three clean hits.')
    setRunning(true)
  }

  const stamp = () => {
    if (!running || finishedRef.current || disabled) return
    const left = BAND.left
    const right = left + BAND.width
    if (marker >= left && marker <= right) {
      const next = stamps + 1
      setStamps(next)
      if (next >= STAMPS_NEEDED) {
        finishedRef.current = true
        setRunning(false)
        setFeedback('Line certifies — payout queued.')
        onSuccessRun()
      } else {
        setFeedback(`Solid hit ${next}/${STAMPS_NEEDED} — keep the rhythm.`)
      }
    } else {
      setRunning(false)
      setStamps(0)
      setFeedback('Off-center stamp — reset the line and pace the ram.')
    }
  }

  return (
    <div>
      <p className="text-sm text-slate-400">
        Run the hydraulic stamp press. First successful batch pays extra once per save; later runs pay
        a smaller stipend.
      </p>
      {feedback ? (
        <p className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-sm text-cyan-100">
          {feedback}
        </p>
      ) : null}
      <div
        className="relative mt-4 h-[52px] overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-900"
        role="presentation"
      >
        <div
          className="absolute bottom-1 top-1 rounded border border-emerald-500/60 bg-emerald-900/40"
          style={{ left: `${BAND.left * 100}%`, width: `${BAND.width * 100}%` }}
        />
        <div
          className="absolute bottom-1 top-1 w-2.5 rounded-sm bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
          style={{ left: `calc(${marker * 100}% - 5px)` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!running ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startLine}
            className="min-h-[44px] rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
          >
            Start press run
          </button>
        ) : (
          <button
            type="button"
            onClick={stamp}
            className="min-h-[44px] rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            Stamp
          </button>
        )}
        <button
          type="button"
          onClick={resetLine}
          className="min-h-[44px] rounded-xl border border-slate-600 px-4 text-sm font-bold text-slate-200 hover:bg-slate-900"
        >
          Reset
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Hits this run: {stamps} / {STAMPS_NEEDED}
      </p>
    </div>
  )
}
