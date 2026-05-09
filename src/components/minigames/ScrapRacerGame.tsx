import { useCallback, useEffect, useRef, useState } from 'react';
import {
  JUNKYARD_DRILL,
  type JunkyardDrillDifficulty,
} from '../../data/phase6Vehicle';
import type { MinigameResultInput } from '../../store/gameStore';
import { useGameStore } from '../../store/gameStore';

type Cue = 'left' | 'up' | 'right';
type Phase = 'instructions' | 'racing' | 'won' | 'lost';

function randomCue(): Cue {
  const opts: Cue[] = ['left', 'up', 'right'];
  return opts[Math.floor(Math.random() * opts.length)]!;
}

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

export function ScrapRacerGame({ onFinish }: Props) {
  const junkCleared = useGameStore((s) => s.minigames.junkyard.completedOnce);
  const [difficulty, setDifficulty] = useState<JunkyardDrillDifficulty>('standard');
  const cfg = JUNKYARD_DRILL[difficulty];
  const [phase, setPhase] = useState<Phase>('instructions');
  const [round, setRound] = useState(0);
  const [cue, setCue] = useState<Cue>('left');
  const [deadline, setDeadline] = useState<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    setPhase('instructions');
    setRound(0);
    setDeadline(null);
    finishedRef.current = false;
  }, [difficulty]);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const startRace = useCallback(() => {
    finishedRef.current = false;
    setRound(0);
    const c = randomCue();
    setCue(c);
    setDeadline(Date.now() + cfg.cueMs);
    setPhase('racing');
  }, [cfg.cueMs]);

  useEffect(() => {
    if (phase !== 'racing' || deadline === null) return;
    const id = window.setTimeout(() => {
      setPhase('lost');
      safeFinish({ won: false });
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(id);
  }, [phase, deadline, safeFinish]);

  const onCue = (picked: Cue) => {
    if (phase !== 'racing') return;
    if (picked !== cue) {
      setPhase('lost');
      safeFinish({ won: false });
      return;
    }
    const nextRound = round + 1;
    if (nextRound >= cfg.rounds) {
      setPhase('won');
      safeFinish({
        won: true,
        scoreIfWin: 120 + nextRound * 12 + (difficulty === 'challenge' ? 120 : 0),
      });
      return;
    }
    setRound(nextRound);
    const c = randomCue();
    setCue(c);
    setDeadline(Date.now() + cfg.cueMs);
  };

  const cueLabel =
    cue === 'left' ? '← Left haul' : cue === 'right' ? 'Right haul →' : '↑ Lift';

  return (
    <div className="rg-vehicle-game">
      {phase === 'instructions' ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {(['easy', 'standard', 'challenge'] as const).map((d) => {
            const locked = d === 'challenge' && !junkCleared;
            return (
              <button
                key={d}
                type="button"
                className="rg-btn rg-btn-ghost"
                disabled={locked}
                style={{
                  borderColor: difficulty === d ? 'var(--rg-yellow)' : undefined,
                  opacity: locked ? 0.5 : difficulty === d ? 1 : 0.85,
                }}
                onClick={() => setDifficulty(d)}
              >
                {d}
                {locked ? ' (clear once)' : ''}
              </button>
            );
          })}
        </div>
      ) : null}
      <p style={{ fontSize: '0.82rem', color: 'var(--rg-muted)', margin: '0 0 0.5rem' }}>
        {JUNKYARD_DRILL[difficulty].label}
      </p>
      <p className="rg-vehicle-hint">
        {phase === 'instructions' &&
          `Hit the matching shift before the light times out — ${cfg.rounds} pulls.`}
        {phase === 'racing' && (
          <>
            Round {round + 1}/{cfg.rounds}: <strong>{cueLabel}</strong>
          </>
        )}
        {phase === 'won' && 'Transmission synced — you are clear.'}
        {phase === 'lost' && (
          <>
            Missed shift — feather the clutch and retry. {cfg.loseTip}
          </>
        )}
      </p>

      <div className="rg-vehicle-controls rg-scrap-grid">
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'racing'}
          onClick={() => onCue('left')}
        >
          ←
        </button>
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'racing'}
          onClick={() => onCue('up')}
        >
          ↑
        </button>
        <button
          type="button"
          className="rg-btn rg-btn-ghost"
          disabled={phase !== 'racing'}
          onClick={() => onCue('right')}
        >
          →
        </button>
      </div>

      <div className="rg-vehicle-actions">
        {phase === 'instructions' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={startRace}>
            Stage lights
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
