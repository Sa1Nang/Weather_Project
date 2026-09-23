/**
 * Shared constants (Phase 1 shell).
 * API query keys, thresholds, and WMO mappings expand in Phase 2+.
 */

/** Default map viewport centered on the Philippines. */
export const PHILIPPINES_CENTER = {
  latitude: 12.8797,
  longitude: 121.774,
  zoom: 6,
} as const

/** TanStack Query key factory (server state). */
export const queryKeys = {
  weather: (lat: number, lon: number) =>
    ['weather', Number(lat.toFixed(4)), Number(lon.toFixed(4))] as const,
  geocodeSearch: (query: string) => ['geocode', query.trim()] as const,
} as const
