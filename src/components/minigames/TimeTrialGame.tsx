import { useCallback, useEffect, useRef, useState } from 'react';
import { timeTrialConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

type Phase = 'instructions' | 'memorize' | 'race' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

function shuffledOrder(len: number): number[] {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function TimeTrialGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [order, setOrder] = useState<number[]>([]);
  const [flashIdx, setFlashIdx] = useState(0);
  const [step, setStep] = useState(0);
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

  const beginMemorize = useCallback(() => {
    finishedRef.current = false;
    const o = shuffledOrder(timeTrialConfig.checkpoints);
    setOrder(o);
    setFlashIdx(0);
    setStep(0);
    setPhase('memorize');
  }, []);

  useEffect(() => {
    if (phase !== 'memorize' || order.length === 0) return;
    if (flashIdx >= order.length) {
      setPhase('race');
      setDeadline(Date.now() + timeTrialConfig.totalMs);
      return;
    }
    const id = window.setTimeout(() => {
      setFlashIdx((i) => i + 1);
    }, timeTrialConfig.memorizeMs);
    return () => window.clearTimeout(id);
  }, [phase, flashIdx, order]);

  useEffect(() => {
    if (phase !== 'race' || deadline === null) return;
    const id = window.setTimeout(() => {
      setPhase('lost');
      safeFinish({ won: false });
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(id);
  }, [phase, deadline, safeFinish]);

  const tapGate = (idx: number) => {
    if (phase !== 'race') return;
    const want = order[step];
    if (idx !== want) {
      setPhase('lost');
      safeFinish({ won: false });
      return;
    }
    const next = step + 1;
    if (next >= order.length) {
      const msLeft = deadline ? Math.max(0, deadline - Date.now()) : 0;
      setPhase('won');
      safeFinish({
        won: true,
        scoreIfWin: 130 + Math.floor(msLeft / 100),
      });
      return;
    }
    setStep(next);
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          'Memorize the neon gate order, then punch it back before the timer drains.'}
        {phase === 'memorize' && (
          <>
            Memorizing…{' '}
            {flashIdx < order.length ? (
              <strong>Gate {order[flashIdx]! + 1}</strong>
            ) : (
              'Go!'
            )}
          </>
        )}
        {phase === 'race' && (
          <>
            Race: hit gate {step + 1}/{order.length}
          </>
        )}
        {phase === 'won' && 'Checkered — telemetry logged.'}
        {phase === 'lost' && 'Out of time or wrong gate — replay the flash rhythm.'}
      </p>

      {(phase === 'race' || phase === 'memorize') && order.length > 0 && (
        <div className="rg-time-gates">
          {order.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`rg-btn rg-time-gate${phase === 'memorize' && flashIdx < order.length && order[flashIdx] === i ? ' rg-time-gate-flash' : ''}`}
              disabled={phase !== 'race'}
              onClick={() => tapGate(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={beginMemorize}>
            Arm timer
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
