import { STORAGE_V1, STORAGE_V2, tryParseStorage } from './saveMigration'

/** Run before React mounts so Zustand persist can read v2. */
export function migrateV1ToV2Save() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(STORAGE_V2)) return
  const raw = localStorage.getItem(STORAGE_V1)
  if (!raw) return
  const snap = tryParseStorage(raw)
  if (!snap) return
  try {
    localStorage.setItem(STORAGE_V2, JSON.stringify({ state: snap, version: 2 }))
  } catch {
    /* ignore */
  }
}
