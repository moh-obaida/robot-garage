import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BayDashboard } from './views/BayDashboard';
import { HonorsScreen } from './views/HonorsScreen';
import { ProgressScreen } from './views/ProgressScreen';
import { PitLeagueScreen } from './views/PitLeagueScreen';
import { TrainingScreen } from './views/TrainingScreen';
import { WorkshopScreen } from './views/WorkshopScreen';
import { WorldScreen } from './views/WorldScreen';
import { useGameStore } from './store/gameStore';
import { robotLevelFromXp } from './store/gameTypes';
import { evolutionLabel } from './data/evolution';

type Tab =
  | 'bay'
  | 'training'
  | 'pit'
  | 'workshop'
  | 'world'
  | 'progress'
  | 'honors';

export function App() {
  const [tab, setTab] = useState<Tab>('bay');
  const scrap = useGameStore((s) => s.scrap);
  const xp = useGameStore((s) => s.xp);
  const rankedWins = useGameStore((s) => s.rankedWins);
  const evolutionTier = useGameStore((s) => s.evolutionTier);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const reducedMotion = useGameStore((s) => s.comfort.reducedMotion);
  const highContrast = useGameStore((s) => s.comfort.highContrast);

  const level = robotLevelFromXp(xp);

  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle('rg-reduced-motion', reducedMotion);
    r.classList.toggle('rg-high-contrast', highContrast);
  }, [reducedMotion, highContrast]);

  const confirmReset = () => {
    if (
      window.confirm(
        'Reset all garage progress in this browser? This clears scrap, XP, missions, trophies, world progress, launch readiness, and comfort toggles. This cannot be undone.',
      )
    ) {
      resetProgress();
      setTab('bay');
    }
  };

  return (
    <ErrorBoundary>
      <div className="rg-app">
        <header className="rg-header">
          <div className="rg-logo">ROBOT GARAGE</div>
          <nav className="rg-nav" aria-label="Main">
            {(
              [
                ['bay', 'Bay'],
                ['training', 'Training'],
                ['pit', 'Pit league'],
                ['workshop', 'Workshop'],
                ['world', 'World'],
                ['progress', 'Progress'],
                ['honors', 'Honors'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`rg-nav-btn${tab === id ? ' active' : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="rg-stats">
            <span>
              Scrap <strong>{scrap}</strong>
            </span>
            <span>
              Pilot <strong>Lv.{level}</strong>
            </span>
            <span title={evolutionLabel(evolutionTier)}>
              Frame <strong>{evolutionLabel(evolutionTier)}</strong>
            </span>
            <span>
              Pit wins <strong>{rankedWins}</strong>
            </span>
            <button
              type="button"
              className="rg-btn rg-btn-ghost rg-reset-btn"
              onClick={confirmReset}
            >
              Reset progress
            </button>
          </div>
        </header>
        <main className="rg-main">
          {tab === 'bay' ? (
            <BayDashboard
              onGoTraining={() => setTab('training')}
              onGoPit={() => setTab('pit')}
              onGoWorkshop={() => setTab('workshop')}
              onGoProgress={() => setTab('progress')}
              onGoHonors={() => setTab('honors')}
              onGoWorld={() => setTab('world')}
            />
          ) : null}
          {tab === 'training' ? <TrainingScreen /> : null}
          {tab === 'pit' ? <PitLeagueScreen /> : null}
          {tab === 'workshop' ? <WorkshopScreen /> : null}
          {tab === 'world' ? <WorldScreen /> : null}
          {tab === 'progress' ? <ProgressScreen /> : null}
          {tab === 'honors' ? <HonorsScreen /> : null}
        </main>
      </div>
    </ErrorBoundary>
  );
}
