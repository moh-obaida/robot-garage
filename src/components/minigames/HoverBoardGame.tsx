import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeInterval } from '../../hooks/useSafeInterval';
import { hoverBoardConfig } from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';

type Tier = keyof typeof hoverBoardConfig.band;
type Phase = 'pick' | 'riding' | 'won';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

export function HoverBoardGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [tier, setTier] = useState<Tier>('standard');
  const [renderTick, setRenderTick] = useState(0);

  const rideRef = useRef({ pos: 0, stable: 0 });
  const tierRef = useRef<Tier>('standard');
  const bandRef = useRef<number>(hoverBoardConfig.band.standard);
  const phaseRef = useRef<Phase>('pick');
  const finishedRef = useRef(false);

  const bump = useCallback(() => setRenderTick((t) => t + 1), []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const startRide = useCallback(
    (t: Tier) => {
      finishedRef.current = false;
      tierRef.current = t;
      bandRef.current = hoverBoardConfig.band[t];
      rideRef.current = { pos: 0, stable: 0 };
      setTier(t);
      setPhase('riding');
      bump();
    },
    [bump],
  );

  useSafeInterval(
    () => {
      if (phaseRef.current !== 'riding') return;

      const cfg = hoverBoardConfig;
      const r = rideRef.current;
      const drift = (Math.random() - 0.5) * 2 * cfg.driftStrength;
      r.pos = Math.max(-1, Math.min(1, r.pos + drift));

      if (Math.abs(r.pos) <= bandRef.current) {
        r.stable += 1;
        if (r.stable >= cfg.stableTicksToWin) {
          phaseRef.current = 'won';
          setPhase('won');
          const bonus =
            tierRef.current === 'challenge'
              ? 40
              : tierRef.current === 'standard'
                ? 20
                : 10;
          safeFinish({
            won: true,
            scoreIfWin: 100 + bonus + r.stable * 3,
          });
        }
      } else {
        r.stable = 0;
      }

      bump();
    },
    phase === 'riding' ? hoverBoardConfig.tickMs : null,
  );

  const nudge = (dir: -1 | 1) => {
    if (phaseRef.current !== 'riding') return;
    const r = rideRef.current;
    r.pos = Math.max(
      -1,
      Math.min(1, r.pos + dir * hoverBoardConfig.nudge),
    );
    bump();
  };

  const { pos, stable } = rideRef.current;
  const band = hoverBoardConfig.band[tier];

  return (
    <div className="rg-vehicle-game" data-sync={renderTick}>
      <p className="rg-vehicle-hint">
        {phase === 'pick' &&
          'Choose deck tuning: wider band is forgiving, challenge pays bigger scores.'}
        {phase === 'riding' && (
          <>
            Stay in cyan · stable ticks {stable}/{hoverBoardConfig.stableTicksToWin}{' '}
            ·{' '}
            {tier === 'easy'
              ? 'Training deck'
              : tier === 'standard'
                ? 'Street tune'
                : 'Pro deck'}
          </>
        )}
        {phase === 'won' && 'Gyros locked — smooth ride.'}
      </p>

      {phase === 'pick' && (
        <div className="rg-hover-tier">
          <button
            type="button"
            className="rg-btn rg-btn-success"
            onClick={() => startRide('easy')}
          >
            Easy · wide band
          </button>
          <button
            type="button"
            className="rg-btn rg-btn-primary"
            onClick={() => startRide('standard')}
          >
            Standard
          </button>
          <button
            type="button"
            className="rg-btn rg-btn-ghost"
            onClick={() => startRide('challenge')}
          >
            Challenge · tight band
          </button>
        </div>
      )}

      {phase === 'riding' && (
        <>
          <div className="rg-hover-meter" aria-hidden>
            <div className="rg-hover-band" style={{ width: `${band * 100}%` }} />
            <div className="rg-hover-dot" style={{ left: `${50 + pos * 40}%` }} />
          </div>
          <p className="rg-vehicle-tip">
            Tip: tap early — drift stacks fast on the pro deck.
          </p>
          <div className="rg-vehicle-controls">
            <button
              type="button"
              className="rg-btn rg-btn-ghost"
              onClick={() => nudge(-1)}
            >
              Nudge ←
            </button>
            <button
              type="button"
              className="rg-btn rg-btn-ghost"
              onClick={() => nudge(1)}
            >
              Nudge →
            </button>
          </div>
        </>
      )}

      <div className="rg-vehicle-actions">
        {phase === 'won' && (
          <button
            type="button"
            className="rg-btn rg-btn-success"
            onClick={() => setPhase('pick')}
          >
            Again
          </button>
        )}
      </div>
    </div>
  );
}
