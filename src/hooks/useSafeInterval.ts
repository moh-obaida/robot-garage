import { useEffect, useRef } from 'react';

/** Interval cleared on unmount or when delay becomes null. */
export function useSafeInterval(callback: () => void, delayMs: number | null) {
  const cb = useRef(callback);
  cb.current = callback;
  useEffect(() => {
    if (delayMs === null) return;
    const id = window.setInterval(() => cb.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
