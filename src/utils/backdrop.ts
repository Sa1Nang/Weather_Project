import type { WeatherCondition } from '@/types/weather'

/**
 * Backdrop bucket driving the page background.
 * Full day/night split + a `warm-night` variant (clear night with high
 * feels-like temp) so the canvas reflects both weather AND time.
 */
export type WeatherBackdrop =
  | 'clear-day'
  | 'clear-night'
  | 'warm-night'
  | 'partly-day'
  | 'partly-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'fog-day'
  | 'fog-night'
  | 'wet-day'
  | 'wet-night'
  | 'storm-day'
  | 'storm-night'
  | 'neutral'

/** Feels-like threshold (°C) for a clear night to count as "warm". */
export const WARM_NIGHT_FEELS_LIKE_C = 20

/**
 * Curated high-quality photo per bucket (remote Unsplash CDN).
 * Day photos are the original verified set; night photos are dark-sky
 * counterparts. `neutral` has no photo — gradient fallback.
 * Params keep files ~200-400KB: 1920w, auto format, q80.
 */
export const BACKDROP_PHOTOS: Record<Exclude<WeatherBackdrop, 'neutral'>, string> = {
  // Sunlit mountain lake (clear day)
  'clear-day':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80',
  // Starry night sky (clear night)
  'clear-night':
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80',
  // Starry mountains (warm night — balmy clear evening)
  'warm-night':
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
  // Sun breaking through clouds (partly day)
  'partly-day':
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1920&q=80',
  // Sunset field under breaking clouds (partly night / dusk)
  'partly-night':
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80',
  // Gray cloud deck (cloudy day)
  'cloudy-day':
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
  // City under night clouds (cloudy night)
  'cloudy-night':
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80',
  // Misty hills at sunrise (fog day)
  'fog-day':
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  // Foggy forest road at dusk (fog night)
  'fog-night':
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1920&q=80',
  // Rainy city street (wet day: drizzle / rain / snow)
  'wet-day':
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80',
  // Rain on window at night (wet night — your "rainy night")
  'wet-night':
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
  // Lightning over the sea (storm day)
  'storm-day':
    'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80',
  // Dark storm clouds at night (storm night)
  'storm-night':
    'https://images.unsplash.com/photo-1431440869543-efaf3388c585?auto=format&fit=crop&w=1920&q=80',
}

/** Photo URL for a bucket, or null when the bucket has no photo. */
export function getBackdropPhoto(bucket: WeatherBackdrop): string | null {
  if (bucket === 'neutral') return null
  return BACKDROP_PHOTOS[bucket] ?? null
}

export interface BackdropOptions {
  /** Feels-like °C — drives the `warm-night` variant. */
  feelsLikeC?: number | null
  /** Today's sunrise/sunset ISO (location-local, from daily[0]). */
  sunrise?: string | null
  sunset?: string | null
  /** Clock time for the day/night check — pass a ticking `useNow()` value. */
  now?: Date | string | number
}

function toMs(value: Date | string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  const ms = value instanceof Date ? value.getTime() : Date.parse(String(value))
  return Number.isNaN(ms) ? null : ms
}

/**
 * Resolves night from the live clock when sun times exist, else falls back
 * to the API `isDay` flag. This lets the backdrop flip day→night between
 * refetches (timer tick) while staying correct when sun times are missing.
 * Exported for unit testing.
 */
export function isNightTime(
  isDayFallback: boolean,
  sunrise?: string | null,
  sunset?: string | null,
  now?: Date | string | number,
): boolean {
  const rise = toMs(sunrise)
  const set = toMs(sunset)
  const current = toMs(now ?? new Date())
  if (rise !== null && set !== null && current !== null) {
    return current < rise || current >= set
  }
  return !isDayFallback
}

/**
 * Condition + time → backdrop bucket.
 * Wet groups drizzle/rain/snow; unknown falls back to neutral.
 * Clear nights with feels-like ≥ 20°C become `warm-night`.
 */
export function getWeatherBackdrop(
  condition: WeatherCondition,
  isDay: boolean,
  opts: BackdropOptions = {},
): WeatherBackdrop {
  const night = isNightTime(isDay, opts.sunrise, opts.sunset, opts.now)

  if (
    !night ||
    opts.feelsLikeC === null ||
    opts.feelsLikeC === undefined ||
    !Number.isFinite(opts.feelsLikeC)
  ) {
    // Day path — or night without a usable feels-like reading.
    if (night && condition === 'clear') return 'clear-night'
  } else if (night && condition === 'clear' && opts.feelsLikeC >= WARM_NIGHT_FEELS_LIKE_C) {
    return 'warm-night'
  } else if (night && condition === 'clear') {
    return 'clear-night'
  }

  switch (condition) {
    case 'clear':
      return night ? 'clear-night' : 'clear-day'
    case 'partly-cloudy':
      return night ? 'partly-night' : 'partly-day'
    case 'cloudy':
      return night ? 'cloudy-night' : 'cloudy-day'
    case 'fog':
      return night ? 'fog-night' : 'fog-day'
    case 'drizzle':
    case 'rain':
    case 'snow':
      return night ? 'wet-night' : 'wet-day'
    case 'thunderstorm':
      return night ? 'storm-night' : 'storm-day'
    case 'unknown':
    default:
      return 'neutral'
  }
}
