import { apiConfig } from '@/lib/config'
import { ApiError, fetchJson } from '@/lib/http'
import {
  openMeteoGeocodingSchema,
  reverseGeocodeSchema,
} from '@/lib/schemas'
import type { GeocodingResult, MapLocation } from '@/types/location'

interface ServiceOptions {
  signal?: AbortSignal
}

type LocationIqAddress = {
  city?: string | null
  town?: string | null
  village?: string | null
  hamlet?: string | null
  suburb?: string | null
  county?: string | null
  state?: string | null
  country?: string | null
}

function requireKey(): string {
  // Read live env so tests can stub the key; falls back to cached config.
  const live = (import.meta.env['VITE_LOCATIONIQ_API_KEY'] as string | undefined)?.trim()
  const key = live && live.length > 0 ? live : apiConfig.locationIqApiKey
  if (!key) {
    throw new ApiError(
      'network',
      'Location search is not configured. Add VITE_LOCATIONIQ_API_KEY to .env.',
    )
  }
  return key
}

function pickName(address: LocationIqAddress | null | undefined, displayName: string | null | undefined): string {
  const city =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.hamlet ??
    address?.suburb ??
    address?.county
  if (city) return city
  const first = displayName?.split(',')[0]?.trim()
  return first && first.length > 0 ? first : 'Current location'
}

function toMapLocation(hit: GeocodingResult): MapLocation {
  return {
    id: `geo:${hit.providerId}`,
    name: hit.name,
    country: hit.country,
    region: hit.region,
    latitude: hit.latitude,
    longitude: hit.longitude,
  }
}

/**
 * Worldwide location search (LocationIQ /search).
 * Returns [] for short/empty queries without touching the network.
 * Quota-safe by design: debounced upstream, min 2 chars, limit 8,
 * 5-min React Query cache — no extra counters (free plan: 5k/day).
 */
export async function searchLocations(
  query: string,
  options: ServiceOptions = {},
): Promise<MapLocation[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []
  const key = requireKey()

  const params = new URLSearchParams({
    key,
    q: trimmed,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    dedupe: '1',
    'accept-language': 'en',
  })
  let raw: unknown
  try {
    raw = await fetchJson<unknown>(
      `${apiConfig.geocodingBaseUrl}?${params.toString()}`,
      { signal: options.signal },
    )
  } catch (error) {
    // LocationIQ returns 404 when nothing matches — treat as empty.
    if (error instanceof ApiError && error.kind === 'http' && error.status === 404) {
      return []
    }
    throw error
  }
  const parsed = openMeteoGeocodingSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiError(
      'parse',
      'Location search returned an unexpected response. Please try again.',
    )
  }

  const seen = new Set<string>()
  const locations: MapLocation[] = []
  for (const hit of parsed.data) {
    const id = String(hit.place_id)
    if (seen.has(id)) continue
    seen.add(id)
    locations.push(
      toMapLocation({
        providerId: id,
        name: pickName(hit.address, hit.display_name),
        country: hit.address?.country ?? 'Unknown',
        region: hit.address?.state ?? hit.address?.county ?? undefined,
        latitude: hit.lat,
        longitude: hit.lon,
      }),
    )
  }
  return locations
}

/**
 * Reverse-geocodes GPS coordinates into a display location
 * (LocationIQ /reverse). Precise coordinates are never
 * persisted here — callers decide what to store.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  options: ServiceOptions = {},
): Promise<MapLocation> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError('network', 'Invalid location coordinates.')
  }
  const key = requireKey()
  const params = new URLSearchParams({
    key,
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'en',
  })
  const raw = await fetchJson<unknown>(
    `${apiConfig.reverseGeocodeUrl}?${params.toString()}`,
    { signal: options.signal },
  )
  const parsed = reverseGeocodeSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiError(
      'parse',
      'Could not determine your location name. Please try again.',
    )
  }
  const data = parsed.data
  return {
    id: `reverse:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    name: pickName(data.address, data.display_name),
    country: data.address?.country ?? 'Unknown',
    region: data.address?.state ?? data.address?.county ?? undefined,
    latitude,
    longitude,
  }
}
