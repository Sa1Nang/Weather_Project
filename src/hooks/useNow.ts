import { useEffect, useState } from 'react'

/** Ticking clock — re-renders every `intervalMs` so time-based UI (e.g. backdrop day→night) updates without a refetch. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
