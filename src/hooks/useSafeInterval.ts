import { useEffect, useRef } from 'react'

/** Like setInterval, but clears on unmount and when delay is null. */
export function useSafeInterval(callback: () => void, delay: number | null) {
  const cbRef = useRef(callback)

  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => cbRef.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
