import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeInterval } from '../../hooks/useSafeInterval';
import { magnetTruckConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

interface ScrapPiece {
  id: number;
  x: number;
  y: number;
}

type Phase = 'instructions' | 'hauling' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

export function MagnetTruckGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [renderTick, setRenderTick] = useState(0);
  const [truckX, setTruckX] = useState(50);

  const piecesRef = useRef<ScrapPiece[]>([]);
  const catchCountRef = useRef(0);
  const spawnedRef = useRef(0);
  const nextIdRef = useRef(0);
  const tickCountRef = useRef(0);
  const truckXRef = useRef(50);
  const phaseRef = useRef<Phase>('instructions');
  const finishedRef = useRef(false);

  const bump = useCallback(() => setRenderTick((t) => t + 1), []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    truckXRef.current = truckX;
  }, [truckX]);

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
    piecesRef.current = [];
    catchCountRef.current = 0;
    spawnedRef.current = 0;
    nextIdRef.current = 0;
    tickCountRef.current = 0;
    setTruckX(50);
    truckXRef.current = 50;
    setPhase('hauling');
    bump();
  }, [bump]);

  useSafeInterval(
    () => {
      if (finishedRef.current) return;
      if (phaseRef.current !== 'hauling') return;

      const cfg = magnetTruckConfig;
      tickCountRef.current += 1;
      const tx = truckXRef.current;
      const half = cfg.magnetWidth / 2;
      const remaining: ScrapPiece[] = [];

      for (const p of piecesRef.current) {
        const y = p.y + cfg.fallSpeed;
        if (y >= cfg.fieldHeight) {
          if (Math.abs(p.x - tx) <= half) {
            catchCountRef.current += 1;
            if (catchCountRef.current >= cfg.catchesToWin) {
              setPhase('won');
              safeFinish({
                won: true,
                scoreIfWin: 100 + catchCountRef.current * 8,
              });
              bump();
              return;
            }
          }
        } else {
          remaining.push({ ...p, y });
        }
      }

      piecesRef.current = remaining;

      if (
        spawnedRef.current < cfg.totalDrops &&
        tickCountRef.current % 4 === 0
      ) {
        spawnedRef.current += 1;
        const x = 12 + Math.random() * 76;
        piecesRef.current.push({
          id: nextIdRef.current++,
          x,
          y: 0,
        });
      }

      if (
        spawnedRef.current >= cfg.totalDrops &&
        piecesRef.current.length === 0
      ) {
        if (catchCountRef.current < cfg.catchesToWin) {
          setPhase('lost');
          safeFinish({ won: false });
        }
        bump();
        return;
      }

      bump();
    },
    phase === 'hauling' ? magnetTruckConfig.tickMs : null,
  );

  const pieces = piecesRef.current;
  const caughtDisplay = catchCountRef.current;
  const spawnedDisplay = spawnedRef.current;

  return (
    <div className="rg-vehicle-game" data-sync={renderTick}>
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          `Catch ${magnetTruckConfig.catchesToWin} loads with the boom — scrap falls across the yard.`}
        {phase === 'hauling' && (
          <>
            Caught {caughtDisplay}/{magnetTruckConfig.catchesToWin} · drops left{' '}
            {Math.max(0, magnetTruckConfig.totalDrops - spawnedDisplay)}
          </>
        )}
        {phase === 'won' && 'Magnet full — hauler rolling.'}
        {phase === 'lost' && 'Yard cleared early — line the boom under the fall path.'}
      </p>

      <div className="rg-magnet-field" aria-hidden>
        {pieces.map((p) => (
          <div
            key={p.id}
            className="rg-magnet-scrap"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        <div
          className="rg-magnet-boom"
          style={{
            left: `${truckX}%`,
            width: `${magnetTruckConfig.magnetWidth}%`,
          }}
        />
      </div>

      <input
        type="range"
        className="rg-magnet-slider"
        min={8}
        max={92}
        value={truckX}
        disabled={phase !== 'hauling'}
        onChange={(e) => setTruckX(Number(e.target.value))}
        aria-label="Magnet position"
      />

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={start}>
            Lower boom
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
