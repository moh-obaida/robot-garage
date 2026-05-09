import { useGameStore } from './store/useGameStore'
import type { ViewId } from './types/game'
import { GameShell } from './components/GameShell'
import { Dashboard } from './views/Dashboard'
import { Garage } from './views/Garage'
import { Upgrades } from './views/Upgrades'
import { Missions } from './views/Missions'
import { Colors } from './views/Colors'
import { Arena } from './views/Arena'

export default function App() {
  const view = useGameStore((s) => s.lastView)
  const setView = useGameStore((s) => s.setView)
  const scrap = useGameStore((s) => s.scrap)
  const wins = useGameStore((s) => s.arenaWins)
  const losses = useGameStore((s) => s.arenaLosses)
  const reset = useGameStore((s) => s.resetProgress)

  const go = (v: ViewId) => setView(v)

  return (
    <GameShell
      active={view}
      onNav={go}
      scrap={scrap}
      arenaWins={wins}
      arenaLosses={losses}
      onReset={reset}
    >
      {view === 'dashboard' ? <Dashboard onGo={go} /> : null}
      {view === 'garage' ? <Garage /> : null}
      {view === 'upgrades' ? <Upgrades /> : null}
      {view === 'missions' ? <Missions /> : null}
      {view === 'colors' ? <Colors /> : null}
      {view === 'arena' ? <Arena /> : null}
    </GameShell>
  )
}
