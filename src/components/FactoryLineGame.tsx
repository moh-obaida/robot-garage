import { useEffect, useRef, useState } from 'react';

const STAMPS_NEEDED = 3;
const BAND = { left: 0.36, width: 0.28 };

export function FactoryLineGame({
  disabled,
  onSuccessRun,
}: {
  disabled: boolean;
  onSuccessRun: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [marker, setMarker] = useState(0);
  const dirRef = useRef(1);
  const [stamps, setStamps] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const speed = 0.024;
    let raf = 0;
    const tick = () => {
      setMarker((m) => {
        let n = m + speed * dirRef.current;
        if (n >= 1) {
          n = 1;
          dirRef.current = -1;
        } else if (n <= 0) {
          n = 0;
          dirRef.current = 1;
        }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const resetLine = () => {
    finishedRef.current = false;
    setRunning(false);
    setMarker(0);
    dirRef.current = 1;
    setStamps(0);
    setFeedback(null);
  };

  const startLine = () => {
    if (disabled) return;
    finishedRef.current = false;
    setStamps(0);
    setMarker(0);
    dirRef.current = 1;
    setFeedback('Stamp when the ram sits in the green slot — three clean hits.');
    setRunning(true);
  };

  const stamp = () => {
    if (!running || finishedRef.current || disabled) return;
    const left = BAND.left;
    const right = left + BAND.width;
    if (marker >= left && marker <= right) {
      const next = stamps + 1;
      setStamps(next);
      if (next >= STAMPS_NEEDED) {
        finishedRef.current = true;
        setRunning(false);
        setFeedback('Line certifies — payout queued.');
        onSuccessRun();
      } else {
        setFeedback(`Solid hit ${next}/${STAMPS_NEEDED} — keep the rhythm.`);
      }
    } else {
      setRunning(false);
      setStamps(0);
      setFeedback('Off-center stamp — reset the line and pace the ram.');
    }
  };

  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: 'var(--rg-muted)' }}>
        Run the hydraulic stamp press. Three clean hits pays scrap and XP. First successful
        batch of the save pays a fatter bonus (once only).
      </p>
      {feedback ? (
        <div className="rg-feedback info" style={{ marginBottom: '0.75rem' }}>
          {feedback}
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          height: 52,
          borderRadius: 8,
          background: '#21262d',
          border: '2px solid var(--rg-panel-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${BAND.left * 100}%`,
            width: `${BAND.width * 100}%`,
            top: 4,
            bottom: 4,
            background: 'var(--rg-green-dim)',
            border: '1px solid var(--rg-green)',
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${marker * 100}% - 5px)`,
            top: 6,
            width: 10,
            height: 40,
            background: 'var(--rg-yellow)',
            borderRadius: 2,
            boxShadow: '0 0 10px rgba(240,193,75,0.55)',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem' }}>
        {!running ? (
          <button
            type="button"
            className="rg-btn rg-btn-primary"
            disabled={disabled}
            onClick={startLine}
          >
            Start press run
          </button>
        ) : (
          <button type="button" className="rg-btn rg-btn-success" onClick={stamp}>
            Stamp
          </button>
        )}
        <button type="button" className="rg-btn rg-btn-ghost" onClick={resetLine}>
          Reset
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.5rem 0 0' }}>
        Hits this run: {stamps} / {STAMPS_NEEDED}
      </p>
    </div>
  );
}
