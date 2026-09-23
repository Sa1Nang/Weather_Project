/**
 * Central API configuration.
 *
 * Weather comes from WeatherAPI.com (`forecast.json`, needs a key).
 * Location search + reverse-geocode go through LocationIQ (needs a key).
 * Keys live ONLY in `.env` (gitignored) as VITE_WEATHERAPI_KEY /
 * VITE_LOCATIONIQ_API_KEY — never hardcode them. Frontend keys are public
 * by nature, so restrict by HTTP referrer + daily cap in dashboards.
 */
export interface ApiConfig {
  weatherApiBaseUrl: string
  /** WeatherAPI.com key (VITE_WEATHERAPI_KEY). Empty = not configured. */
  weatherApiKey: string
  openMeteoBaseUrl: string
  geocodingBaseUrl: string
  reverseGeocodeUrl: string
  /** LocationIQ public key (VITE_LOCATIONIQ_API_KEY). Empty = not configured. */
  locationIqApiKey: string
  /** Per-request timeout so slow networks fail fast with a clear error. */
  requestTimeoutMs: number
}

function readEnv(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined
  return value && value.trim().length > 0 ? value : fallback
}

export const apiConfig: ApiConfig = {
  weatherApiBaseUrl: readEnv(
    'VITE_WEATHERAPI_BASE_URL',
    'https://api.weatherapi.com/v1/forecast.json',
  ),
  weatherApiKey: readEnv('VITE_WEATHERAPI_KEY', ''),
  openMeteoBaseUrl: readEnv(
    'VITE_OPEN_METEO_BASE_URL',
    'https://api.open-meteo.com/v1/forecast',
  ),
  geocodingBaseUrl: readEnv(
    'VITE_GEOCODING_BASE_URL',
    'https://us1.locationiq.com/v1/search',
  ),
  reverseGeocodeUrl: readEnv(
    'VITE_REVERSE_GEOCODE_URL',
    'https://us1.locationiq.com/v1/reverse',
  ),
  locationIqApiKey: readEnv('VITE_LOCATIONIQ_API_KEY', ''),
  requestTimeoutMs: 12_000,
}
