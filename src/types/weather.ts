/**
 * Normalized, provider-agnostic weather models.
 *
 * UI components consume ONLY these types — never raw API payloads.
 * Canonical units: °C, km/h, hPa, mm, % and ISO-8601 local timestamps
 * (Open-Meteo returns local time when `timezone=auto`).
 * Any field a provider cannot supply stays `null` ("Unavailable" in UI).
 */

/** WMO weather-code groups shared with icons and alerts. */
export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'unknown'

export interface CurrentWeather {
  observedAt: string
  temperatureC: number
  feelsLikeC: number
  humidityPct: number
  /** Nearest-hour rain probability (Open-Meteo has no `current` field). */
  rainProbabilityPct: number | null
  precipitationMm: number
  weatherCode: number
  condition: WeatherCondition
  isDay: boolean
  cloudCoverPct: number | null
  /** Sea-level pressure preferred; falls back to station pressure. */
  pressureHpa: number | null
  windSpeedKmh: number
  windDirectionDeg: number
  windGustsKmh: number | null
  /** Nearest-hour UV (Open-Meteo has no `current` UV field). */
  uvIndex: number | null
  /** Nearest-hour visibility in metres. */
  visibilityM: number | null
}

export interface HourPoint {
  time: string
  temperatureC: number
  feelsLikeC: number | null
  rainProbabilityPct: number | null
  precipitationMm: number
  weatherCode: number
  condition: WeatherCondition
  isDay: boolean
  humidityPct: number | null
  windSpeedKmh: number
  uvIndex: number | null
}

export interface DayPoint {
  date: string
  weatherCode: number
  condition: WeatherCondition
  tempMaxC: number
  tempMinC: number
  rainProbabilityMaxPct: number | null
  precipitationSumMm: number
  sunrise: string | null
  sunset: string | null
  uvIndexMax: number | null
  windSpeedMaxKmh: number | null
  windGustsMaxKmh: number | null
  windDirectionDominantDeg: number | null
}

export interface WeatherBundle {
  latitude: number
  longitude: number
  timezone: string
  updatedAt: string
  current: CurrentWeather
  hourly: HourPoint[]
  daily: DayPoint[]
}
