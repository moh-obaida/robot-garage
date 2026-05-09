import { useCallback, useEffect, useRef, useState } from 'react';
import {
  allLaunchStepsComplete,
  LAUNCH_COMPLETION_SCRAP,
  LAUNCH_COMPLETION_XP,
  LAUNCH_STEP_META,
  LAUNCH_STEP_ORDER,
  type LaunchStepId,
} from '../data/launchReadiness';
import { useSafeInterval } from '../hooks/useSafeInterval';
import { useGameStore } from '../store/gameStore';

type SnapDifficulty = 'easy' | 'standard' | 'challenge';

function snapTolerance(d: SnapDifficulty): number {
  if (d === 'easy') return 14;
  if (d === 'standard') return 8;
  return 3;
}

function randomTarget(d: SnapDifficulty): number {
  if (d === 'easy') return 50;
  if (d === 'standard')
    return 40 + Math.floor(Math.random() * 21); // 40–60
  return 47 + Math.floor(Math.random() * 7); // 47–53
}

export function LaunchReadinessPanel() {
  const stepCompletion = useGameStore((s) => s.launchReadiness.stepCompletion);
  const bonusClaimed = useGameStore((s) => s.launchReadiness.completionBonusClaimed);
  const comfort = useGameStore((s) => s.comfort);
  const completeLaunchStep = useGameStore((s) => s.completeLaunchStep);
  const claimLaunchReadinessBonus = useGameStore((s) => s.claimLaunchReadinessBonus);
  const setComfort = useGameStore((s) => s.setComfort);

  const [hint, setHint] = useState<string | null>(null);

  const done = useCallback(
    (id: LaunchStepId, okMessage?: string) => {
      completeLaunchStep(id);
      setHint(okMessage ?? null);
    },
    [completeLaunchStep],
  );

  const stepDone = useCallback(
    (id: LaunchStepId) => stepCompletion[id] === true,
    [stepCompletion],
  );
  const demoOutlineDone = useGameStore(
    (s) => s.launchReadiness.stepCompletion['demo-outline'] === true,
  );
  const completeCount = LAUNCH_STEP_ORDER.filter((id) => stepDone(id)).length;
  const allDone = allLaunchStepsComplete(stepCompletion);

  /* QA needle */
  const [qaRunning, setQaRunning] = useState(false);
  const qaStart = useRef(0);
  const [qaNeedle, setQaNeedle] = useState(50);

  useSafeInterval(
    () => {
      if (!qaRunning) return;
      const t = (performance.now() - qaStart.current) / 1000;
      setQaNeedle(50 + Math.sin(t * 2.6) * 38);
    },
    qaRunning ? 45 : null,
  );

  /* Perf sprint */
  const perfHeat = useRef(100);
  const perfTaps = useRef(0);
  const [perfActive, setPerfActive] = useState(false);
  const [perfTick, setPerfTick] = useState(0);
  const bumpPerf = useCallback(() => setPerfTick((x) => x + 1), []);

  useSafeInterval(
    () => {
      if (!perfActive) return;
      perfHeat.current -= 2.2;
      if (perfHeat.current <= 0) {
        setPerfActive(false);
        setHint('Heat stacked up — vent faster next run.');
      }
      bumpPerf();
    },
    perfActive ? 90 : null,
  );

  const startPerf = () => {
    perfHeat.current = 100;
    perfTaps.current = 0;
    setPerfActive(true);
    setHint(null);
    bumpPerf();
  };

  const ventTap = () => {
    if (!perfActive || stepDone('perf-sprint')) return;
    perfTaps.current += 1;
    perfHeat.current = Math.min(100, perfHeat.current + 9);
    if (perfTaps.current >= 6 && perfHeat.current > 0) {
      setPerfActive(false);
      done('perf-sprint', 'Thermal curve flattened — nice work.');
    }
    bumpPerf();
  };

  /* Responsive snap */
  const [snapDiff, setSnapDiff] = useState<SnapDifficulty>('standard');
  const snapTarget = useRef(50);
  const [snapSlider, setSnapSlider] = useState(50);

  useEffect(() => {
    snapTarget.current = randomTarget('standard');
    setHint('Standard shop spec.');
  }, []);

  const resetSnap = (d: SnapDifficulty) => {
    setSnapDiff(d);
    snapTarget.current = randomTarget(d);
    setSnapSlider(50);
    setHint(
      d === 'challenge'
        ? 'Tight tolerance — nudge carefully.'
        : d === 'easy'
          ? 'Forgiving lane — good warm-up.'
          : 'Standard shop spec.',
    );
  };

  const trySnap = () => {
    if (stepDone('responsive-snap')) return;
    const tol = snapTolerance(snapDiff);
    if (Math.abs(snapSlider - snapTarget.current) <= tol) {
      done(
        'responsive-snap',
        'Crate sits true. Alignment logged.',
      );
    } else {
      setHint(
        `Off by ${Math.abs(snapSlider - snapTarget.current)}. Tip: match the ghost mark (${snapTarget.current}) within ±${tol}.`,
      );
    }
  };

  /* Demo checklist */
  const [demo, setDemo] = useState({ hook: false, loop: false, call: false });
  useEffect(() => {
    if (!demo.hook || !demo.loop || !demo.call) return;
    if (demoOutlineDone) return;
    completeLaunchStep('demo-outline');
    setHint('Demo beats locked in.');
  }, [demo.hook, demo.loop, demo.call, demoOutlineDone, completeLaunchStep]);

  /* Bug sweep */
  const [bugs, setBugs] = useState({ a: false, b: false, c: false });
  const bugHit = (k: 'a' | 'b' | 'c') => {
    if (useGameStore.getState().launchReadiness.stepCompletion['bug-sweep']) return;
    setBugs((prev) => {
      const next = { ...prev, [k]: true };
      if (next.a && next.b && next.c) {
        queueMicrotask(() => {
          useGameStore.getState().completeLaunchStep('bug-sweep');
          setHint('Harness is clean — glitches contained.');
        });
      }
      return next;
    });
  };

  const [releaseOk, setReleaseOk] = useState(false);

  return (
    <section className="rg-panel rg-launch-panel" aria-labelledby="launch-readiness-title">
      <h2 id="launch-readiness-title" className="rg-panel-title">
        Launch readiness
      </h2>
      <p style={{ marginTop: 0, color: 'var(--rg-muted)', fontSize: '0.95rem' }}>
        Run the bay through eight quick checks — QA, performance, comfort, layout, recovery,
        demo notes, bug sweep, and sign-off. Finish all to claim a one-time launch bonus.
      </p>

      <div className="rg-launch-progress" aria-label="Launch checklist progress">
        <div className="rg-progress-bar">
          <span style={{ width: `${(completeCount / LAUNCH_STEP_ORDER.length) * 100}%` }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.35rem 0 0' }}>
          {completeCount} / {LAUNCH_STEP_ORDER.length} checks complete
          {bonusClaimed ? ' · Bonus banked' : ''}
        </p>
      </div>

      {hint ? (
        <div className="rg-feedback info rg-launch-hint" aria-live="polite">
          {hint}
        </div>
      ) : null}

      <div className="rg-launch-steps">
        {LAUNCH_STEP_ORDER.map((id) => {
          const meta = LAUNCH_STEP_META[id];
          const ok = stepDone(id);
          return (
            <article
              key={id}
              className={`rg-launch-step${ok ? ' done' : ''}`}
              aria-label={`${meta.title}${ok ? ', complete' : ', incomplete'}`}
            >
              <header className="rg-launch-step-head">
                <h3>{meta.title}</h3>
                {ok ? (
                  <span className="rg-badge rg-badge-done">Done</span>
                ) : (
                  <span className="rg-badge rg-badge-locked">Open</span>
                )}
              </header>
              <p className="rg-launch-blurb">{meta.blurb}</p>

              {id === 'qa-signal' && !ok ? (
                <div className="rg-launch-interactive">
                  <div className="rg-scope" aria-hidden>
                    <div
                      className="rg-scope-zone"
                      style={{ left: '42%', width: '16%' }}
                    />
                    <div
                      className="rg-scope-needle"
                      style={{ left: `${qaNeedle}%` }}
                    />
                  </div>
                  <div className="rg-launch-actions">
                    {!qaRunning ? (
                      <button
                        type="button"
                        className="rg-btn rg-btn-ghost"
                        onClick={() => {
                          qaStart.current = performance.now();
                          setQaRunning(true);
                          setHint('Catch the needle in the cyan window, then stamp.');
                        }}
                      >
                        Start scope
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rg-btn rg-btn-primary"
                        onClick={() => {
                          if (qaNeedle >= 42 && qaNeedle <= 58) {
                            setQaRunning(false);
                            done('qa-signal', 'Signal locked — QA green.');
                          } else {
                            setHint('Almost — wait until the needle sits in the cyan band.');
                          }
                        }}
                      >
                        Stamp reading
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {id === 'perf-sprint' && !ok ? (
                <div className="rg-launch-interactive">
                  <div
                    className="rg-progress-bar"
                    aria-label="Heat"
                    data-repaint={perfTick}
                  >
                    <span
                      style={{
                        width: `${Math.max(0, perfHeat.current)}%`,
                        background:
                          perfHeat.current < 35
                            ? 'linear-gradient(90deg, var(--rg-red), var(--rg-yellow))'
                            : undefined,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.35rem 0' }}>
                    Vent heat: tap <strong>Vent</strong> six times before the bar empties.
                  </p>
                  <div className="rg-launch-actions">
                    <button
                      type="button"
                      className="rg-btn rg-btn-ghost"
                      onClick={startPerf}
                    >
                      Start sprint
                    </button>
                    <button
                      type="button"
                      className="rg-btn rg-btn-primary"
                      onClick={ventTap}
                      disabled={!perfActive}
                    >
                      Vent
                    </button>
                  </div>
                </div>
              ) : null}

              {id === 'a11y-comfort' && !ok ? (
                <div className="rg-launch-interactive">
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={comfort.reducedMotion}
                      onChange={(e) => {
                        setComfort({ reducedMotion: e.target.checked });
                        done('a11y-comfort', 'Comfort prefs saved for this browser.');
                      }}
                    />
                    <span>Reduce motion (less flashing / movement)</span>
                  </label>
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={comfort.highContrast}
                      onChange={(e) => {
                        setComfort({ highContrast: e.target.checked });
                        done('a11y-comfort', 'Comfort prefs saved for this browser.');
                      }}
                    />
                    <span>High-contrast bay (stronger text and borders)</span>
                  </label>
                </div>
              ) : null}

              {id === 'responsive-snap' && !ok ? (
                <div className="rg-launch-interactive">
                  <div className="rg-snap-modes" role="group" aria-label="Alignment difficulty">
                    {(['easy', 'standard', 'challenge'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`rg-btn rg-btn-ghost${snapDiff === d ? ' rg-snap-active' : ''}`}
                        onClick={() => resetSnap(d)}
                      >
                        {d === 'easy' ? 'Easy' : d === 'standard' ? 'Standard' : 'Challenge'}
                      </button>
                    ))}
                  </div>
                  <label className="rg-snap-slider-label">
                    Lift position ({snapSlider})
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={snapSlider}
                      onChange={(e) => setSnapSlider(Number(e.target.value))}
                    />
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--rg-muted)', margin: '0.25rem 0' }}>
                    Target mark: <strong>{snapTarget.current}</strong> (±{snapTolerance(snapDiff)})
                  </p>
                  <button type="button" className="rg-btn rg-btn-success" onClick={trySnap}>
                    Lock alignment
                  </button>
                </div>
              ) : null}

              {id === 'error-playbook' && !ok ? (
                <div className="rg-launch-interactive">
                  <p style={{ fontSize: '0.88rem', margin: '0 0 0.5rem' }}>
                    If the UI faults: use <strong>Reset progress</strong> only when you mean it;
                    otherwise reload the page — saves stay in local storage. The error screen
                    offers a reload path if React hits a boundary.
                  </p>
                  <button
                    type="button"
                    className="rg-btn rg-btn-ghost"
                    onClick={() =>
                      done('error-playbook', 'Recovery path understood.')
                    }
                  >
                    Log playbook read
                  </button>
                </div>
              ) : null}

              {id === 'demo-outline' && !ok ? (
                <div className="rg-launch-interactive">
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={demo.hook}
                      onChange={(e) =>
                        setDemo((d) => ({ ...d, hook: e.target.checked }))
                      }
                    />
                    <span>Open with the fantasy: one-robot garage, tangible jobs.</span>
                  </label>
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={demo.loop}
                      onChange={(e) =>
                        setDemo((d) => ({ ...d, loop: e.target.checked }))
                      }
                    />
                    <span>Show training → workshop → evolution loop.</span>
                  </label>
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={demo.call}
                      onChange={(e) =>
                        setDemo((d) => ({ ...d, call: e.target.checked }))
                      }
                    />
                    <span>Close with save-in-browser and reset safety.</span>
                  </label>
                </div>
              ) : null}

              {id === 'bug-sweep' && !ok ? (
                <div className="rg-launch-interactive rg-bug-grid">
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`rg-btn rg-bug-spark${bugs[k] ? ' stamped' : ''}`}
                      disabled={bugs[k]}
                      onClick={() => bugHit(k)}
                    >
                      {bugs[k] ? 'Stamped' : `Glitch ${k.toUpperCase()}`}
                    </button>
                  ))}
                </div>
              ) : null}

              {id === 'release-signoff' && !ok ? (
                <div className="rg-launch-interactive">
                  <label className="rg-comfort-toggle">
                    <input
                      type="checkbox"
                      checked={releaseOk}
                      onChange={(e) => setReleaseOk(e.target.checked)}
                    />
                    <span>Bay looks demo-ready on this device.</span>
                  </label>
                  <button
                    type="button"
                    className="rg-btn rg-btn-success"
                    disabled={!releaseOk}
                    onClick={() =>
                      done('release-signoff', 'Sign-off recorded.')
                    }
                  >
                    Sign release
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="rg-launch-footer">
        {allDone && !bonusClaimed ? (
          <button
            type="button"
            className="rg-btn rg-btn-primary"
            onClick={() => {
              claimLaunchReadinessBonus();
              setHint(
                `Launch bonus claimed: +${LAUNCH_COMPLETION_SCRAP} scrap, +${LAUNCH_COMPLETION_XP} XP.`,
              );
            }}
          >
            Claim launch bonus (+{LAUNCH_COMPLETION_SCRAP} scrap · +{LAUNCH_COMPLETION_XP} XP)
          </button>
        ) : null}
        {bonusClaimed ? (
          <p style={{ margin: 0, color: 'var(--rg-green)', fontSize: '0.9rem' }}>
            Launch bonus already claimed — replay checks anytime for practice.
          </p>
        ) : null}
      </div>
    </section>
  );
}
