import { useCallback, useEffect, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'ready' | 'playing' | 'won' | 'lost';

const NEED = 6;
const BETWEEN_MS = 720;
const WINDOW_MS = 320;
const MAX_MISS = 3;

export function RhythmRepairGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [armed, setArmed] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hint, setHint] = useState(
    'When the ring flashes bright, tap Stamp sync inside the short window — six hits calibrate the line.',
  );

  const timersRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>('ready');
  const finishedRef = useRef(false);
  const hitsRef = useRef(0);
  const missRef = useRef(0);
  const armedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    armedRef.current = armed;
  }, [armed]);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const lose = useCallback(
    (msg: string) => {
      clearTimers();
      setArmed(false);
      setPhase('lost');
      setHint(msg);
      safeFinish({ won: false });
    },
    [safeFinish],
  );

  const win = useCallback(() => {
    clearTimers();
    setArmed(false);
    setPhase('won');
    const score = 720 + (MAX_MISS - missRef.current) * 75;
    setHint(`Line synced! Score ${score}.`);
    safeFinish({ won: true, scoreIfWin: score });
  }, [safeFinish]);

  const scheduleArm = useCallback(
    (delayMs: number) => {
      const id = window.setTimeout(() => {
        if (phaseRef.current !== 'playing' || finishedRef.current) return;
        setArmed(true);
        const closeId = window.setTimeout(() => {
          if (phaseRef.current !== 'playing' || finishedRef.current) return;
          if (!armedRef.current) return;
          setArmed(false);
          missRef.current += 1;
          setMisses(missRef.current);
          setHint(`Missed window — ${MAX_MISS - missRef.current} chances left.`);
          if (missRef.current >= MAX_MISS) {
            lose('Too many late stamps — watch for the bright ring.');
            return;
          }
          scheduleArm(BETWEEN_MS);
        }, WINDOW_MS);
        timersRef.current.push(closeId);
      }, delayMs);
      timersRef.current.push(id);
    },
    [lose],
  );

  const start = () => {
    clearTimers();
    finishedRef.current = false;
    hitsRef.current = 0;
    missRef.current = 0;
    setHits(0);
    setMisses(0);
    setArmed(false);
    setPhase('playing');
    setHint('Wait for the flash, then tap immediately.');
    scheduleArm(BETWEEN_MS);
  };

  const stamp = () => {
    if (phase !== 'playing' || finishedRef.current) return;
    if (!armedRef.current) {
      missRef.current += 1;
      setMisses(missRef.current);
      setHint(`Early tap — ${MAX_MISS - missRef.current} chances left.`);
      if (missRef.current >= MAX_MISS) {
        lose('Stamp only when the ring pulses.');
        return;
      }
      scheduleArm(BETWEEN_MS);
      return;
    }
    clearTimers();
    setArmed(false);
    hitsRef.current += 1;
    setHits(hitsRef.current);
    if (hitsRef.current >= NEED) {
      win();
      return;
    }
    scheduleArm(BETWEEN_MS);
  };

  const pulse = armed;

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--rg-muted)' }}>
        Hits <strong>{hits}</strong> / {NEED} · Misses <strong>{misses}</strong> / {MAX_MISS}
      </p>
      <div
        style={{
          width: 120,
          height: 120,
          margin: '0 auto 0.75rem',
          borderRadius: '50%',
          border: `${pulse ? 14 : 5}px solid var(--rg-cyan)`,
          boxShadow: pulse
            ? '0 0 32px rgba(88,212,255,0.75)'
            : '0 0 12px rgba(88,212,255,0.25)',
          transition: 'border-width 80ms ease, box-shadow 80ms ease',
        }}
      />
      <button
        type="button"
        className="rg-btn rg-btn-primary"
        style={{ width: '100%', maxWidth: 280 }}
        disabled={phase !== 'playing'}
        onClick={stamp}
      >
        Stamp sync
      </button>
      <div className="rg-vehicle-actions">
        {phase === 'ready' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Start calibration
          </button>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <button type="button" className="rg-btn rg-btn-success" onClick={start}>
            Again
          </button>
        )}
      </div>
    </div>
  );
}
