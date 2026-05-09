import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeInterval } from '../../hooks/useSafeInterval';
import { garageKartConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

interface Obstacle {
  id: number;
  lane: number;
  y: number;
}

type Phase = 'instructions' | 'running' | 'won' | 'lost';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

export function GarageKartGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [renderTick, setRenderTick] = useState(0);
  const [playerLane, setPlayerLane] = useState(1);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const dodgedRef = useRef(0);
  const playerLaneRef = useRef(1);
  const tickCountRef = useRef(0);
  const nextIdRef = useRef(0);
  const finishedRef = useRef(false);
  const phaseRef = useRef<Phase>('instructions');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);

  const bump = useCallback(() => setRenderTick((t) => t + 1), []);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const resetRun = useCallback(() => {
    finishedRef.current = false;
    tickCountRef.current = 0;
    nextIdRef.current = 0;
    obstaclesRef.current = [];
    dodgedRef.current = 0;
    setPlayerLane(1);
    playerLaneRef.current = 1;
    setPhase('running');
    bump();
  }, [bump]);

  useSafeInterval(
    () => {
      if (finishedRef.current) return;
      if (phaseRef.current !== 'running') return;

      const cfg = garageKartConfig;
      tickCountRef.current += 1;
      const player = playerLaneRef.current;
      let lost = false;
      let nextDodged = dodgedRef.current;
      const updated: Obstacle[] = [];

      for (const o of obstaclesRef.current) {
        const y = o.y + cfg.obstacleSpeed;
        if (
          y >= cfg.collisionBand.min &&
          y <= cfg.collisionBand.max &&
          o.lane === player
        ) {
          lost = true;
          break;
        }
        if (y > 100) {
          nextDodged += 1;
        } else {
          updated.push({ ...o, y });
        }
      }

      if (lost) {
        setPhase('lost');
        safeFinish({ won: false });
        bump();
        return;
      }

      let spawn = updated;
      if (tickCountRef.current % cfg.spawnEveryTicks === 0) {
        const lane = Math.floor(Math.random() * cfg.lanes);
        spawn = [...spawn, { id: nextIdRef.current++, lane, y: 0 }];
      }

      obstaclesRef.current = spawn;
      dodgedRef.current = nextDodged;

      if (nextDodged >= cfg.dodgesToWin) {
        setPhase('won');
        safeFinish({
          won: true,
          scoreIfWin: 100 + nextDodged * 5,
        });
      }

      bump();
    },
    phase === 'running' ? garageKartConfig.tickMs : null,
  );

  const obstacles = obstaclesRef.current;
  const dodged = dodgedRef.current;

  const laneButton = (lane: number, label: string) => (
    <button
      type="button"
      className={`rg-btn ${playerLane === lane ? 'rg-btn-primary' : 'rg-btn-ghost'}`}
      disabled={phase !== 'running'}
      onClick={() => setPlayerLane(lane)}
    >
      {label}
    </button>
  );

  return (
    <div className="rg-vehicle-game" data-sync={renderTick}>
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          'Dodge rolling scrap: pick a lane before barrels reach your bumper row.'}
        {phase === 'running' &&
          `Clear ${garageKartConfig.dodgesToWin} hazards · cleared ${dodged}`}
        {phase === 'won' && 'Pit crew waves you in — clean run.'}
        {phase === 'lost' && 'Crunch! Wrong lane — try a tighter line next lap.'}
      </p>

      <div className="rg-kart-track" aria-hidden>
        {Array.from({ length: garageKartConfig.lanes }, (_, lane) => (
          <div key={lane} className="rg-kart-lane">
            {obstacles
              .filter((o) => o.lane === lane)
              .map((o) => (
                <div
                  key={o.id}
                  className="rg-kart-obstacle"
                  style={{ top: `${o.y}%` }}
                />
              ))}
            {playerLane === lane && phase === 'running' && (
              <div className="rg-kart-player" />
            )}
          </div>
        ))}
      </div>

      <div className="rg-vehicle-controls">
        {laneButton(0, 'Lane L')}
        {laneButton(1, 'Lane M')}
        {laneButton(2, 'Lane R')}
      </div>

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={resetRun}>
            Roll out
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
