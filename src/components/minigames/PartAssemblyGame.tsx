import { useMemo, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';

const PART_LABELS = ['Core', 'Arm', 'Joint', 'Plate'] as const;

export function PartAssemblyGame(props: {
  onComplete: (r: MinigameResultInput) => void;
  onExit: () => void;
}) {
  const order = useMemo(() => {
    const idx = [0, 1, 2, 3];
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j]!, idx[i]!];
    }
    return idx;
  }, []);

  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const pick = (i: number) => {
    if (msg) return;
    if (i !== order[step]) {
      setMsg('Wrong torque sequence — strip alert!');
      props.onComplete({ won: false });
      return;
    }
    const next = step + 1;
    if (next >= order.length) {
      props.onComplete({ won: true, scoreIfWin: 125 });
    } else {
      setStep(next);
    }
  };

  return (
    <div className="rg-panel rg-minigame-screen">
      <h2 className="rg-panel-title">Part Assembly</h2>
      <p className="rg-minigame-help">
        Bolt the stack in the printed order. Step {step + 1} of {order.length}.
      </p>
      <div className="rg-assembly-order">
        {order.map((pi, idx) => (
          <span key={`${pi}-${idx}`} className={idx < step ? ' done' : idx === step ? ' current' : ''}>
            {PART_LABELS[pi]}
          </span>
        ))}
      </div>
      <div className="rg-diff-row">
        {PART_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className="rg-btn rg-btn-primary"
            disabled={!!msg}
            onClick={() => pick(i)}
          >
            {label}
          </button>
        ))}
      </div>
      {msg && <div className="rg-feedback error">{msg}</div>}
      <button type="button" className="rg-btn rg-btn-ghost rg-exit" onClick={props.onExit}>
        Back
      </button>
    </div>
  );
}
