/**
 * Shared location model used across search, favorites, store, and map.
 * Coordinates use Open-Meteo's WGS84 decimal degrees.
 */
export interface MapLocation {
  /** Stable id: `geo:<provider-id>` for search hits, `reverse:<rounded>` for GPS. */
  id: string
  name: string
  country: string
  region?: string
  latitude: number
  longitude: number
}

/** Raw provider-agnostic geocoding hit before id assignment. */
export interface GeocodingResult {
  providerId: string
  name: string
  country: string
  region?: string
  latitude: number
  longitude: number
}
