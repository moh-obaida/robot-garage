import { MINIGAME_ORDER } from '../data/minigameMeta';
import { SAVE_VERSION } from '../store/gameStore';

export type SaveValidationReport =
  | { ok: true; message: string }
  | { ok: false; issues: string[] };

const SAVE_KEY = 'robot-garage-save';

export function readRawRobotGarageSave(): string | null {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

/**
 * Best-effort structural check of persisted Zustand JSON without running migrations.
 */
export function validateRobotGaragePersistedJson(raw: string | null): SaveValidationReport {
  if (raw === null || raw === '') {
    return { ok: true, message: 'No save on this device yet — fresh garage.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, issues: ['Save file is not valid JSON.'] };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, issues: ['Save root must be an object.'] };
  }

  const root = parsed as Record<string, unknown>;
  const state = root.state;
  if (!state || typeof state !== 'object') {
    return { ok: false, issues: ['Missing persisted state object.'] };
  }

  const s = state as Record<string, unknown>;
  const issues: string[] = [];

  if (typeof s.scrap !== 'number' || !Number.isFinite(s.scrap)) {
    issues.push('scrap must be a finite number.');
  }
  if (typeof s.xp !== 'number' || !Number.isFinite(s.xp)) {
    issues.push('xp must be a finite number.');
  }

  const mg = s.minigames;
  if (!mg || typeof mg !== 'object') {
    issues.push('minigames must be an object.');
  } else {
    for (const id of MINIGAME_ORDER) {
      const row = (mg as Record<string, unknown>)[id];
      if (!row || typeof row !== 'object') {
        issues.push(`minigames.${id} missing or invalid.`);
      }
    }
  }

  const version = root.version;
  if (typeof version !== 'number' || !Number.isFinite(version)) {
    issues.push('persist version missing.');
  } else if (version > SAVE_VERSION) {
    issues.push(
      `Save version ${version} is newer than this app (${SAVE_VERSION}). Update the app to load it.`,
    );
  }

  if (issues.length) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    message: `Save looks structurally sound (persist v${version ?? '?'}).`,
  };
}
