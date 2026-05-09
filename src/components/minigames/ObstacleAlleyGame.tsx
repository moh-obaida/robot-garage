import { useCallback, useEffect, useRef, useState } from 'react';
import { obstacleAlleyConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

type Hazard = 'low' | 'high';
type Phase = 'instructions' | 'dodging' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

function randomHazard(): Hazard {
  return Math.random() < 0.5 ? 'low' : 'high';
}

export function ObstacleAlleyGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [round, setRound] = useState(0);
  const [hazard, setHazard] = useState<Hazard>('low');
  const [deadline, setDeadline] = useState<number | null>(null);
  const finishedRef = useRef(false);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const start = useCallback(() => {
    finishedRef.current = false;
    setRound(0);
    const h = randomHazard();
    setHazard(h);
    setDeadline(Date.now() + obstacleAlleyConfig.reactMs);
    setPhase('dodging');
  }, []);

  useEffect(() => {
    if (phase !== 'dodging' || deadline === null) return;
    const id = window.setTimeout(() => {
      setPhase('lost');
      safeFinish({ won: false });
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(id);
  }, [phase, deadline, safeFinish]);

  const react = (move: 'duck' | 'jump') => {
    if (phase !== 'dodging') return;
    const need = hazard === 'low' ? 'duck' : 'jump';
    if (move !== need) {
      setPhase('lost');
      safeFinish({ won: false });
      return;
    }
    const next = round + 1;
    if (next >= obstacleAlleyConfig.rounds) {
      setPhase('won');
      safeFinish({
        won: true,
        scoreIfWin: 115 + next * 12,
      });
      return;
    }
    setRound(next);
    setHazard(randomHazard());
    setDeadline(Date.now() + obstacleAlleyConfig.reactMs);
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          'Low sweep? Duck. High girder? Jump. Six clean reactions.'}
        {phase === 'dodging' && (
          <>
            Gate {round + 1}/{obstacleAlleyConfig.rounds}:{' '}
            <strong>{hazard === 'low' ? 'Low bar — duck!' : 'High beam — jump!'}</strong>
          </>
        )}
        {phase === 'won' && 'Clean line — chassis clears the alley.'}
        {phase === 'lost' && 'Tagged a beam — read the hazard height earlier.'}
      </p>

      <div className="rg-vehicle-controls rg-alley-controls">
        <button
          type="button"
          className="rg-btn rg-btn-primary"
          disabled={phase !== 'dodging'}
          onClick={() => react('duck')}
        >
          Duck
        </button>
        <button
          type="button"
          className="rg-btn rg-btn-success"
          disabled={phase !== 'dodging'}
          onClick={() => react('jump')}
        >
          Jump
        </button>
      </div>

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Enter alley
          </button>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <button
            type="button"
            className="rg-btn rg-btn-success"
            onClick={() => setPhase('instructions')}
          >
            Again
          </button>
        )}
      </div>
    </div>
  );
}
