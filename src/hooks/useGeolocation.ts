import { useCallback, useState } from 'react'

export type GeolocationStatus =
  | 'idle'
  | 'pending'
  | 'unsupported'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error'

export interface GeoCoordinates {
  latitude: number
  longitude: number
}

interface UseGeolocationResult {
  status: GeolocationStatus
  coords: GeoCoordinates | null
  message: string | null
  request: () => void
  reset: () => void
}

const MESSAGES: Record<GeolocationStatus, string | null> = {
  idle: null,
  pending: 'Locating you…',
  unsupported: 'Your browser does not support geolocation.',
  denied: 'Location permission was denied. Enable it in your browser settings or search instead.',
  unavailable: 'Your location is currently unavailable. Try searching instead.',
  timeout: 'Locating timed out. Please try again or search instead.',
  error: 'Could not determine your location. Please try again.',
}

/**
 * Browser geolocation wrapper with explicit failure states.
 * Precise coordinates stay in memory only — persistence happens
 * solely when the user saves a favorite.
 */
export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<GeoCoordinates | null>(null)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setStatus('idle')
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus('denied')
            break
          case error.POSITION_UNAVAILABLE:
            setStatus('unavailable')
            break
          case error.TIMEOUT:
            setStatus('timeout')
            break
          default:
            setStatus('error')
        }
      },
      { timeout: 10_000, maximumAge: 60_000 },
    )
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setCoords(null)
  }, [])

  return { status, coords, message: MESSAGES[status], request, reset }
}
