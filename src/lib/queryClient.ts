import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client for all server state
 * (current weather, forecast, geocoding).
 *
 * - staleTime 10 min / gcTime 30 min: weather changes slowly; avoids
 *   refetching the same data repeatedly (performance requirement).
 * - refetchOnWindowFocus false: prevents surprise refetch storms.
 * - retry 2: tolerates transient network blips without hammering the API.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})
