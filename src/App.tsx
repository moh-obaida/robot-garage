import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Outlet, useLocation } from 'react-router-dom'
import { ACHIEVEMENTS } from './data/achievements'
import { GameShell } from './components/GameShell'
import { rankFromTrophies, useGameStore, xpProgress } from './store/useGameStore'

export function AppLayout() {
  const location = useLocation()
  const recordVisit = useGameStore((s) => s.recordVisit)
  const reducedMotion = useGameStore((s) => s.comfort.reducedMotion)
  const highContrast = useGameStore((s) => s.comfort.highContrast)

  useEffect(() => {
    recordVisit(location.pathname)
  }, [location.pathname, recordVisit])

  useEffect(() => {
    const r = document.documentElement
    r.classList.toggle('rg-reduced-motion', reducedMotion)
    r.classList.toggle('rg-high-contrast', highContrast)
  }, [reducedMotion, highContrast])

  const header = useGameStore(
    useShallow((s) => ({
      scrap: s.scrap,
      xp: s.xp,
      level: s.level,
      trophies: s.trophies,
      arenaWins: s.arenaWins,
      arenaLosses: s.arenaLosses,
      achievementUnlocks: s.achievementUnlocks,
      levelUpToast: s.levelUpToast,
    })),
  )
  const reset = useGameStore((s) => s.resetProgress)
  const setLevelUpToast = useGameStore((s) => s.setLevelUpToast)

  const prog = xpProgress(header.xp)

  return (
    <GameShell
      scrap={header.scrap}
      level={header.level}
      xpPct={prog.pct}
      xpLabel={
        header.level >= 6 ? 'MAX' : `${prog.current} / ${prog.next} to next`
      }
      trophies={header.trophies}
      pvpRank={rankFromTrophies(header.trophies)}
      arenaWins={header.arenaWins}
      arenaLosses={header.arenaLosses}
      achievementCount={header.achievementUnlocks.length}
      achievementTotal={ACHIEVEMENTS.length}
      levelUpToast={header.levelUpToast}
      onDismissToast={() => setLevelUpToast(null)}
      onReset={reset}
    >
      <Outlet />
    </GameShell>
  )
}
