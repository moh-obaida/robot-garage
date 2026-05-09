import { useState } from 'react'
import { COLORS } from '../data/colors'
import { Panel } from '../components/Panel'
import { RobotFigure } from '../components/RobotFigure'
import { useGameStore } from '../store/useGameStore'

export function Colors() {
  const unlocked = useGameStore((s) => s.unlockedColors)
  const paint = useGameStore((s) => s.paintColorId)
  const completed = useGameStore((s) => s.completedMissions)
  const tryBuy = useGameStore((s) => s.tryUnlockColorWithScrap)
  const equip = useGameStore((s) => s.equipColor)
  const [msg, setMsg] = useState<string | null>(null)

  const previewId = paint

  const act = (colorId: string, mode: 'buy' | 'equip') => {
    if (mode === 'buy') {
      const r = tryBuy(colorId)
      setMsg(r.ok ? 'Finish unlocked.' : r.message ?? 'Cannot unlock.')
    } else {
      const r = equip(colorId)
      setMsg(r.ok ? 'Paint applied.' : r.message ?? 'Cannot equip.')
    }
    window.setTimeout(() => setMsg(null), 2400)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="Preview" subtitle="Live plate reaction." className="lg:col-span-1">
        <RobotFigure colorId={previewId} size="md" />
        <p className="mt-4 text-center text-sm text-slate-400">Current: {previewId}</p>
      </Panel>
      <Panel title="Finish lab" subtitle="Unlock with scrap or missions." className="lg:col-span-2">
        {msg ? (
          <p className="mb-4 rounded-lg border border-violet-500/35 bg-violet-950/30 px-3 py-2 text-sm text-violet-100">
            {msg}
          </p>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {COLORS.map((c) => {
            const has = unlocked.includes(c.id)
            const needsMission = c.requiresMissionId
              ? completed.includes(c.requiresMissionId)
              : true
            const canBuy = !has && c.scrapCost > 0 && needsMission

            return (
              <li
                key={c.id}
                className="flex flex-col rounded-xl border border-slate-700/80 bg-slate-950/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 shrink-0 rounded-lg border border-white/10 shadow-inner"
                    style={{ backgroundColor: c.hex, boxShadow: `0 0 18px ${c.hex}55` }}
                  />
                  <div>
                    <p className="font-semibold text-slate-100">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.starter ? 'Starter' : null}
                      {c.scrapCost > 0 ? ` · ${c.scrapCost} scrap` : null}
                      {c.requiresMissionId ? ` · needs op: ${c.requiresMissionId}` : null}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {has ? (
                    <>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">
                        Unlocked
                      </span>
                      <button
                        type="button"
                        onClick={() => act(c.id, 'equip')}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 hover:bg-white"
                      >
                        Equip
                      </button>
                    </>
                  ) : canBuy ? (
                    <button
                      type="button"
                      onClick={() => act(c.id, 'buy')}
                      className="rounded-lg bg-fuchsia-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-fuchsia-400"
                    >
                      Unlock
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {c.scrapCost <= 0 && c.requiresMissionId
                        ? 'Complete linked mission.'
                        : 'Locked'}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
