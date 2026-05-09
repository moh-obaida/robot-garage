import { useEffect, useRef, useState } from 'react'

const GRID = 12
const CELL = 22

type Pt = { x: number; y: number }

function randFood(body: Pt[]): Pt {
  for (let i = 0; i < 400; i++) {
    const x = Math.floor(Math.random() * GRID)
    const y = Math.floor(Math.random() * GRID)
    if (!body.some((p) => p.x === x && p.y === y)) return { x, y }
  }
  return { x: 0, y: 0 }
}

export function CircuitSnake({
  onFinish,
}: {
  onFinish: (r: { score: number; ate: number }) => void
}) {
  const [render, setRender] = useState({ snake: [] as Pt[], food: { x: 8, y: 4 }, ate: 0 })
  const snakeRef = useRef<Pt[]>([
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ])
  const foodRef = useRef<Pt>({ x: 8, y: 4 })
  const dirRef = useRef({ x: 1, y: 0 })
  const ateRef = useRef(0)
  const ended = useRef(false)
  const finishRef = useRef(onFinish)

  useEffect(() => {
    finishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    snakeRef.current = [
      { x: 4, y: 6 },
      { x: 3, y: 6 },
    ]
    foodRef.current = { x: 8, y: 4 }
    dirRef.current = { x: 1, y: 0 }
    ateRef.current = 0
    ended.current = false
    setRender({ snake: [...snakeRef.current], food: { ...foodRef.current }, ate: 0 })

    const id = window.setInterval(() => {
      if (ended.current) return
      const prev = snakeRef.current
      const head = prev[0]
      const nx = head.x + dirRef.current.x
      const ny = head.y + dirRef.current.y
      if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
        ended.current = true
        window.clearInterval(id)
        finishRef.current({ score: ateRef.current * 50, ate: ateRef.current })
        return
      }
      if (prev.some((p) => p.x === nx && p.y === ny)) {
        ended.current = true
        window.clearInterval(id)
        finishRef.current({ score: ateRef.current * 50, ate: ateRef.current })
        return
      }
      const nh = { x: nx, y: ny }
      const food = foodRef.current
      const grow = nh.x === food.x && nh.y === food.y
      let nextBody: Pt[]
      if (grow) {
        ateRef.current += 1
        nextBody = [nh, ...prev]
        foodRef.current = randFood(nextBody)
      } else {
        nextBody = [nh, ...prev.slice(0, -1)]
      }
      snakeRef.current = nextBody
      setRender({ snake: [...nextBody], food: { ...foodRef.current }, ate: ateRef.current })
      if (ateRef.current >= 5) {
        ended.current = true
        window.clearInterval(id)
        finishRef.current({ score: ateRef.current * 50 + 100, ate: ateRef.current })
      }
    }, 145)

    return () => {
      ended.current = true
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current
      if (e.key === 'ArrowUp' && d.y !== 1) dirRef.current = { x: 0, y: -1 }
      if (e.key === 'ArrowDown' && d.y !== -1) dirRef.current = { x: 0, y: 1 }
      if (e.key === 'ArrowLeft' && d.x !== 1) dirRef.current = { x: -1, y: 0 }
      if (e.key === 'ArrowRight' && d.x !== -1) dirRef.current = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const px = GRID * CELL

  return (
    <div className="mx-auto max-w-fit space-y-3">
      <p className="text-center text-sm text-cyan-100">Eat 5 energy cells. Arrows steer.</p>
      <p className="text-center text-xs text-slate-500">Cells {render.ate} / 5</p>
      <div
        className="relative rounded-xl border border-cyan-500/30 bg-slate-950"
        style={{ width: px, height: px }}
      >
        {render.snake.map((s, i) => (
          <div
            key={`${i}-${s.x}-${s.y}`}
            className={`absolute rounded-sm ${i === 0 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-cyan-700/80'}`}
            style={{
              left: s.x * CELL + 2,
              top: s.y * CELL + 2,
              width: CELL - 4,
              height: CELL - 4,
            }}
          />
        ))}
        <div
          className="absolute rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]"
          style={{
            left: render.food.x * CELL + 4,
            top: render.food.y * CELL + 4,
            width: CELL - 8,
            height: CELL - 8,
          }}
        />
      </div>
    </div>
  )
}
