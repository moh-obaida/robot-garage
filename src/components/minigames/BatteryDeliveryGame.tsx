import { useCallback, useRef, useState } from 'react';
import { batteryDeliveryConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

type Phase = 'instructions' | 'delivering' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

const DEPOT_LABELS = ['Bay A', 'Bay B', 'Bay C'] as const;

export function BatteryDeliveryGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [step, setStep] = useState(0);
  const targetsRef = useRef<number[]>([]);
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
    const t: number[] = [];
    for (let i = 0; i < batteryDeliveryConfig.stops; i += 1) {
      t.push(Math.floor(Math.random() * batteryDeliveryConfig.depotCount));
    }
    targetsRef.current = t;
    setStep(0);
    setPhase('delivering');
  }, []);

  const pick = (depot: number) => {
    if (phase !== 'delivering') return;
    const want = targetsRef.current[step];
    if (depot !== want) {
      setPhase('lost');
      safeFinish({ won: false });
      return;
    }
    const next = step + 1;
    if (next >= batteryDeliveryConfig.stops) {
      setPhase('won');
      safeFinish({
        won: true,
        scoreIfWin: 110 + next * 15,
      });
      return;
    }
    setStep(next);
  };

  const currentTarget = targetsRef.current[step];

  return (
    <div className="rg-vehicle-game rg-battery-game">
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          'Three live cells need the right bay — wrong dock shorts the line.'}
        {phase === 'delivering' && (
          <>
            Drop {step + 1}/{batteryDeliveryConfig.stops}:{' '}
            <strong className="rg-battery-target">
              {DEPOT_LABELS[currentTarget ?? 0]}
            </strong>
          </>
        )}
        {phase === 'won' && 'Batteries seated — motors happy.'}
        {phase === 'lost' && 'Sparks! Route to the glowing bay next time.'}
      </p>

      <div className="rg-battery-depots">
        {DEPOT_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rg-btn rg-battery-depot${phase === 'delivering' && currentTarget === i ? ' rg-battery-depot-hot' : ''}`}
            disabled={phase !== 'delivering'}
            onClick={() => pick(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rg-battery-progress" aria-hidden>
        <div className="rg-progress-bar">
          <span
            style={{
              width: `${((step + (phase === 'won' ? 1 : 0)) / batteryDeliveryConfig.stops) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Load truck
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
