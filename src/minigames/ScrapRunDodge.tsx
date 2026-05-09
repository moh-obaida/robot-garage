import { useEffect, useRef, useState } from 'react'

const W = 280
const H = 160
const PLAYER_W = 36
const FALL = 2.4

type Obs = { x: number; y: number; w: number; h: number }

export function ScrapRunDodge({
  onFinish,
}: {
  onFinish: (r: { score: number; survived: boolean }) => void
}) {
  const [display, setDisplay] = useState({ score: 0, px: W / 2 - PLAYER_W / 2, obs: [] as Obs[] })
  const state = useRef({
    px: W / 2 - PLAYER_W / 2,
    obs: [] as Obs[],
    score: 0,
    tick: 0,
    dead: false,
    won: false,
  })
  const raf = useRef<number>(0)
  const finishRef = useRef(onFinish)

  useEffect(() => {
    finishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    const s = state.current
    s.px = W / 2 - PLAYER_W / 2
    s.obs = []
    s.score = 0
    s.tick = 0
    s.dead = false
    s.won = false
    setDisplay({ score: 0, px: s.px, obs: [] })

    const step = () => {
      if (s.dead || s.won) return
      s.tick += 1
      s.score += 1

      s.obs = s.obs
        .map((o) => ({ ...o, y: o.y + FALL }))
        .filter((o) => o.y < H + 24)

      if (s.tick % 48 === 0) {
        const w = 26 + Math.random() * 26
        s.obs.push({ x: 6 + Math.random() * (W - w - 12), y: -18, w, h: 14 })
      }

      const py = H - 34
      for (const o of s.obs) {
        if (s.px < o.x + o.w && s.px + PLAYER_W > o.x && py < o.y + o.h && py + 26 > o.y) {
          s.dead = true
          finishRef.current({ score: s.score, survived: false })
          return
        }
      }

      if (s.tick >= 2800) {
        s.won = true
        finishRef.current({ score: s.score + 200, survived: true })
        return
      }

      if (s.tick % 4 === 0) {
        setDisplay({ score: s.score, px: s.px, obs: [...s.obs] })
      }

      raf.current = requestAnimationFrame(step)
    }

    raf.current = requestAnimationFrame(step)
    return () => {
      s.dead = true
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  const move = (dir: -1 | 1) => {
    const s = state.current
    if (s.dead || s.won) return
    s.px = Math.max(8, Math.min(W - PLAYER_W - 8, s.px + dir * 24))
    setDisplay((d) => ({ ...d, px: s.px }))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="mx-auto max-w-[300px] space-y-3">
      <p className="text-center text-sm text-cyan-100">Dodge falling scrap. Survive or hit a high score.</p>
      <p className="text-center text-xs text-slate-500">Score {display.score}</p>
      <div
        className="relative mx-auto overflow-hidden rounded-xl border border-slate-600 bg-slate-900"
        style={{ width: W, height: H }}
      >
        {display.obs.map((o, i) => (
          <div
            key={`${i}-${Math.round(o.y)}`}
            className="absolute rounded bg-amber-600/90 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            style={{ left: o.x, top: o.y, width: o.w, height: o.h }}
          />
        ))}
        <div
          className="absolute rounded-lg border border-cyan-400 bg-cyan-500/40"
          style={{ left: display.px, top: H - 36, width: PLAYER_W, height: 28 }}
        />
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-cyan-100"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          className="rounded-xl bg-slate-800 px-6 py-3 font-bold text-cyan-100"
        >
          ▶
        </button>
      </div>
    </div>
  )
}
