import { useCallback, useRef, useState } from 'react';
import { vehicleUpgradeConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

type Phase = 'instructions' | 'bolting' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

const PARTS = [
  { id: 0, label: 'Tires', emoji: '◯' },
  { id: 1, label: 'Shocks', emoji: '┊' },
  { id: 2, label: 'Torque hub', emoji: '◆' },
] as const;

function shuffledSteps(): number[] {
  const arr = [0, 1, 2];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function VehicleUpgradeGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [order, setOrder] = useState<number[]>([]);
  const [step, setStep] = useState(0);
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
    setOrder(shuffledSteps());
    setStep(0);
    setPhase('bolting');
  }, []);

  const pick = (partId: number) => {
    if (phase !== 'bolting') return;
    const want = order[step];
    if (partId !== want) {
      setPhase('lost');
      safeFinish({ won: false });
      return;
    }
    const next = step + 1;
    if (next >= vehicleUpgradeConfig.steps) {
      setPhase('won');
      safeFinish({
        won: true,
        scoreIfWin: 125 + next * 15,
      });
      return;
    }
    setStep(next);
  };

  const labels = order.map((id) => PARTS[id]!.label).join(' → ');

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          'Bolt the shop spec: match the printed stack — tires, shocks, hub — in that exact order.'}
        {phase === 'bolting' && (
          <>
            Spec: <strong>{labels}</strong> · step {step + 1}/{vehicleUpgradeConfig.steps}
          </>
        )}
        {phase === 'won' && 'Torque sequence tight — upgrade logged.'}
        {phase === 'lost' && 'Wrong fastener — follow the spec strip left to right.'}
      </p>

      <div className="rg-upgrade-parts">
        {PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="rg-btn rg-upgrade-part"
            disabled={phase !== 'bolting'}
            onClick={() => pick(p.id)}
          >
            <span className="rg-upgrade-emoji" aria-hidden>
              {p.emoji}
            </span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Print spec
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
