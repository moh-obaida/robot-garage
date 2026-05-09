import { Outlet } from 'react-router-dom'
import { GameShell } from './components/GameShell'
import { useGameStore } from './store/useGameStore'

export function AppLayout() {
  const scrap = useGameStore((s) => s.scrap)
  const wins = useGameStore((s) => s.arenaWins)
  const losses = useGameStore((s) => s.arenaLosses)
  const reset = useGameStore((s) => s.resetProgress)

  return (
    <GameShell scrap={scrap} arenaWins={wins} arenaLosses={losses} onReset={reset}>
      <Outlet />
    </GameShell>
  )
}
