import { useCallback, useEffect, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

const PADS = 4;
const ROUNDS_WIN = 5;
const MAX_ERRORS = 3;

type Mode = 'idle' | 'show' | 'input' | 'won' | 'lost';

export function MemoryLightsGame({ onFinish }: Props) {
  const [mode, setMode] = useState<Mode>('idle');
  const [round, setRound] = useState(1);
  const [errors, setErrors] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [hint, setHint] = useState(
    'Watch the cyan pads flash, then tap the same order. Pattern grows each round.',
  );

  const sequenceRef = useRef<number[]>([]);
  const inputIndexRef = useRef(0);
  const finishedRef = useRef(false);
  const modeRef = useRef<Mode>('idle');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const playSequence = useCallback((seq: number[]) => {
    clearTimers();
    setMode('show');
    setLit(null);
    let t = 0;
    for (let i = 0; i < seq.length; i++) {
      const pad = seq[i];
      timersRef.current.push(
        window.setTimeout(() => setLit(pad), t),
      );
      t += 420;
      timersRef.current.push(
        window.setTimeout(() => setLit(null), t),
      );
      t += 180;
    }
    timersRef.current.push(
      window.setTimeout(() => {
        if (modeRef.current === 'show') {
          setMode('input');
          setHint('Your turn — replay the pattern.');
        }
      }, t + 80),
    );
  }, []);

  const startGame = useCallback(() => {
    clearTimers();
    finishedRef.current = false;
    sequenceRef.current = [Math.floor(Math.random() * PADS)];
    inputIndexRef.current = 0;
    setRound(1);
    setErrors(0);
    setHint('Memorize the flash order.');
    playSequence(sequenceRef.current);
  }, [playSequence]);

  const fail = useCallback(() => {
    clearTimers();
    setMode('lost');
    setLit(null);
    setHint(
      'Pattern slipped — three misses max. Slow down and say the order out loud.',
    );
    safeFinish({ won: false });
  }, [safeFinish]);

  const onPadTap = (pad: number) => {
    if (mode !== 'input') return;
    const seq = sequenceRef.current;
    const i = inputIndexRef.current;
    if (seq[i] !== pad) {
      const nextErr = errors + 1;
      setErrors(nextErr);
      if (nextErr >= MAX_ERRORS) {
        fail();
        return;
      }
      setHint(`Miss — pad ${pad + 1} was not next. ${MAX_ERRORS - nextErr} tries left.`);
      inputIndexRef.current = 0;
      playSequence(seq);
      return;
    }
    inputIndexRef.current = i + 1;
    if (inputIndexRef.current >= seq.length) {
      if (round >= ROUNDS_WIN) {
        clearTimers();
        setMode('won');
        setLit(null);
        const score = 600 + (MAX_ERRORS - errors) * 80 + (ROUNDS_WIN - round + 1) * 20;
        setHint(`Board synced! Score ${score}.`);
        safeFinish({ won: true, scoreIfWin: score });
        return;
      }
      const nextRound = round + 1;
      setRound(nextRound);
      sequenceRef.current = [...seq, Math.floor(Math.random() * PADS)];
      inputIndexRef.current = 0;
      setHint(`Round ${nextRound} — one more step in the chain.`);
      playSequence(sequenceRef.current);
    }
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--rg-muted)' }}>
        Round <strong>{round}</strong> / {ROUNDS_WIN} · Errors{' '}
        <strong>{errors}</strong> / {MAX_ERRORS}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
          gap: '0.65rem',
          maxWidth: 320,
        }}
      >
        {Array.from({ length: PADS }, (_, pad) => (
          <button
            key={pad}
            type="button"
            className="rg-btn rg-btn-ghost"
            style={{
              minHeight: 72,
              fontWeight: 800,
              fontSize: '1.1rem',
              borderWidth: 2,
              boxShadow:
                lit === pad ? '0 0 22px var(--rg-cyan)' : 'none',
              borderColor: lit === pad ? 'var(--rg-cyan)' : 'var(--rg-panel-border)',
              opacity: mode === 'show' && lit !== pad ? 0.55 : 1,
            }}
            disabled={mode === 'show' || mode === 'won' || mode === 'lost' || mode === 'idle'}
            onClick={() => onPadTap(pad)}
          >
            Pad {pad + 1}
          </button>
        ))}
      </div>
      <div className="rg-vehicle-actions" style={{ marginTop: '0.75rem' }}>
        {mode === 'idle' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={startGame}>
            Start pattern
          </button>
        )}
        {(mode === 'won' || mode === 'lost') && (
          <button type="button" className="rg-btn rg-btn-success" onClick={startGame}>
            Again
          </button>
        )}
      </div>
    </div>
  );
}
