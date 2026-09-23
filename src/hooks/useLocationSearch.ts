import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/defaults'
import { useDebounce } from '@/hooks/useDebounce'
import { searchLocations } from '@/services/geocoding/geocodingService'

/**
 * Debounced worldwide location search.
 * No request fires until the debounced query reaches 2+ characters,
 * keeping search traffic minimal while typing.
 */
export function useLocationSearch(query: string, debounceMs = 350) {
  const debounced = useDebounce(query, debounceMs)
  const trimmed = debounced.trim()

  const search = useQuery({
    queryKey: queryKeys.geocodeSearch(trimmed),
    queryFn: ({ signal }) => searchLocations(trimmed, { signal }),
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...search,
    debouncedQuery: trimmed,
    isQueryTooShort: trimmed.length < 2,
  }
}
