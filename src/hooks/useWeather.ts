import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/defaults'
import { getWeatherBundle } from '@/services/weather/weatherService'

function isValidCoord(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}

/** Guards queries against non-finite or out-of-range coordinates. */
function isValidLatLon(latitude: number, longitude: number): boolean {
  return isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180)
}

/**
 * Single cached weather bundle per rounded coordinate.
 * Slice hooks below share this cache — no duplicate requests.
 */
export function useWeatherBundle(latitude: number, longitude: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude, longitude),
    queryFn: ({ signal }) => getWeatherBundle(latitude, longitude, { signal }),
    enabled: isValidLatLon(latitude, longitude),
    staleTime: 10 * 60 * 1000,
  })
}

/** Current conditions slice (re-renders only when it changes). */
export function useCurrentWeather(latitude: number, longitude: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude, longitude),
    queryFn: ({ signal }) => getWeatherBundle(latitude, longitude, { signal }),
    enabled: isValidLatLon(latitude, longitude),
    staleTime: 10 * 60 * 1000,
    select: (bundle) => bundle.current,
  })
}

/** Hourly forecast slice. */
export function useHourlyForecast(latitude: number, longitude: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude, longitude),
    queryFn: ({ signal }) => getWeatherBundle(latitude, longitude, { signal }),
    enabled: isValidLatLon(latitude, longitude),
    staleTime: 10 * 60 * 1000,
    select: (bundle) => bundle.hourly,
  })
}

/** 7-day forecast slice. */
export function useDailyForecast(latitude: number, longitude: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude, longitude),
    queryFn: ({ signal }) => getWeatherBundle(latitude, longitude, { signal }),
    enabled: isValidLatLon(latitude, longitude),
    staleTime: 10 * 60 * 1000,
    select: (bundle) => bundle.daily,
  })
}
