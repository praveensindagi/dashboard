import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardData } from '../types'
import { buildDashboardData, type DataSource, type RawCollections } from '../firebase/buildDashboardData'

/**
 * Subscribes to the data source and derives the dashboard from it.
 * `now` ticks every minute, so a booking moves from Upcoming to Completed on its own once its date passes.
 */
export function useDashboardData(source: DataSource) {
  const sourceRef = useRef(source)
  sourceRef.current = source

  const [raw, setRaw] = useState<RawCollections | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setRaw(null)
    setError(null)
    return sourceRef.current.subscribe(
      (next) => {
        setRaw(next)
        setError(null)
      },
      (e) => setError(e),
    )
  }, [attempt])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const data = useMemo<DashboardData | null>(() => (raw ? buildDashboardData(raw, now) : null), [raw, now])

  useEffect(() => {
    if (raw) void sourceRef.current.sync?.(raw, now)
  }, [raw, now])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { data, loading: !raw && !error, error, retry, now }
}
