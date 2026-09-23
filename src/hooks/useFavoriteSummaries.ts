import { useQueries } from '@tanstack/react-query'
import { queryKeys } from '@/constants/defaults'
import { getWeatherBundle } from '@/services/weather/weatherService'
import { useAppStore } from '@/store/useAppStore'
import type { MapLocation } from '@/types/location'
import type { WeatherCondition } from '@/types/weather'
import { wmoToCondition } from '@/utils/wmo'

export interface FavoriteSummary {
  location: MapLocation
  /** Live temp/condition when cached fetch succeeds; null while loading/failing. */
  temperatureC: number | null
  weatherCode: number | null
  condition: WeatherCondition | null
  isDay: boolean | null
  isPending: boolean
  isError: boolean
}

/**
 * Live weather summaries for saved favorites.
 * Each favorite reuses the same cached bundle query as the dashboard,
 * so selecting a favorite afterward is a cache hit — never a refetch.
 * One favorite's failure never affects the others.
 */
export function useFavoriteSummaries(): FavoriteSummary[] {
  const favorites = useAppStore((s) => s.favorites)

  const results = useQueries({
    queries: favorites.map((location) => ({
      queryKey: queryKeys.weather(location.latitude, location.longitude),
      queryFn: ({ signal }: { signal: AbortSignal | undefined }) =>
        getWeatherBundle(location.latitude, location.longitude, { signal }),
      staleTime: 10 * 60 * 1000,
    })),
  })

  return favorites.map((location, index) => {
    const result = results[index]
    const current = result?.data?.current
    return {
      location,
      temperatureC: current?.temperatureC ?? null,
      weatherCode: current?.weatherCode ?? null,
      condition: current ? wmoToCondition(current.weatherCode) : null,
      isDay: current?.isDay ?? null,
      isPending: result?.isPending ?? false,
      isError: result?.isError ?? false,
    }
  })
}
