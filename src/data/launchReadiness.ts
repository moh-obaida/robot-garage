/** Phase 10 — Launch Readiness: QA, polish, and presentation as player-facing bay tasks. */

export const LAUNCH_STEP_ORDER = [
  'qa-signal',
  'perf-sprint',
  'a11y-comfort',
  'responsive-snap',
  'error-playbook',
  'demo-outline',
  'bug-sweep',
  'release-signoff',
] as const;

export type LaunchStepId = (typeof LAUNCH_STEP_ORDER)[number];

export interface LaunchStepMeta {
  id: LaunchStepId;
  title: string;
  blurb: string;
}

export const LAUNCH_STEP_META: Record<LaunchStepId, LaunchStepMeta> = {
  'qa-signal': {
    id: 'qa-signal',
    title: 'Signal calibration',
    blurb: 'Ping the bench scope when the needle kisses the cyan band — classic QA pass.',
  },
  'perf-sprint': {
    id: 'perf-sprint',
    title: 'Thermal vent sprint',
    blurb: 'Bleed heat fast enough to prove the drivetrain can handle a spike load.',
  },
  'a11y-comfort': {
    id: 'a11y-comfort',
    title: 'Comfort controls',
    blurb: 'Tune the bay for your eyes and motion — players deserve a readable garage.',
  },
  'responsive-snap': {
    id: 'responsive-snap',
    title: 'Chassis alignment',
    blurb: 'Line the crate on the lift — easy, standard, or tight tolerance.',
  },
  'error-playbook': {
    id: 'error-playbook',
    title: 'Fault playbook',
    blurb: 'Know how we recover when something shorts — no panic, just reboot the console.',
  },
  'demo-outline': {
    id: 'demo-outline',
    title: 'Demo talking points',
    blurb: 'Tick the beats you will hit when you show the build — keeps presentations tight.',
  },
  'bug-sweep': {
    id: 'bug-sweep',
    title: 'Glitch sweep',
    blurb: 'Stamp three stray sparks before they crawl into the wiring harness.',
  },
  'release-signoff': {
    id: 'release-signoff',
    title: 'Release sign-off',
    blurb: 'Final eyes-on: confirm the bay is ready to open the doors.',
  },
};

export const LAUNCH_COMPLETION_SCRAP = 120;
export const LAUNCH_COMPLETION_XP = 60;

export function allLaunchStepsComplete(
  stepCompletion: Partial<Record<LaunchStepId, boolean>>,
): boolean {
  return LAUNCH_STEP_ORDER.every((id) => stepCompletion[id] === true);
}
