import { useCallback, useEffect, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { reverseGeocode } from '@/services/geocoding/geocodingService'
import type { MapLocation } from '@/types/location'

interface GeoButtonProps {
  onLocated: (location: MapLocation) => void
}

/**
 * "Use my location" button: permission → coordinates →
 * reverse-geocode → weather. Precise coords stay in memory only.
 */
export function GeoButton({ onLocated }: GeoButtonProps) {
  const { status, coords, message, request, reset } = useGeolocation()
  const [namingFailed, setNamingFailed] = useState(false)
  const [lastCoords, setLastCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const resolveName = useCallback(
    async (latitude: number, longitude: number) => {
      setNamingFailed(false)
      try {
        const location = await reverseGeocode(latitude, longitude)
        onLocated(location)
      } catch {
        // GPS coords are valid — show weather under a generic label,
        // but say so instead of failing silently.
        setNamingFailed(true)
        setLastCoords({ latitude, longitude })
        onLocated({
          id: `reverse:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
          name: 'Current location',
          country: 'Unknown',
          latitude,
          longitude,
        })
      }
    },
    [onLocated],
  )

  useEffect(() => {
    if (!coords) return
    void resolveName(coords.latitude, coords.longitude)
    reset()
  }, [coords, resolveName, reset])

  const busy = status === 'pending'

  return (
    <div className="flex flex-col items-stretch">
      <button
        type="button"
        onClick={request}
        disabled={busy}
        aria-label="Use my current location"
        aria-busy={busy}
        title="Use my current location"
        className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--mist)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:cursor-wait disabled:opacity-60 "
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin aria-hidden="true" className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">My location</span>
        {busy && <span className="sr-only">Locating you…</span>}
      </button>
      {status !== 'idle' && status !== 'pending' && message && (
        <p role="alert" className="mt-1 max-w-56 text-xs text-red-600 dark:text-red-300">
          {message}
        </p>
      )}
      {namingFailed && lastCoords && (
        <p role="alert" className="mt-1 max-w-56 text-xs text-[var(--ink-muted)]">
          Area name unavailable — showing coordinates.{' '}
          <button
            type="button"
            onClick={() => void resolveName(lastCoords.latitude, lastCoords.longitude)}
            className="font-semibold underline underline-offset-2"
          >
            Retry naming
          </button>
        </p>
      )}
    </div>
  )
}


