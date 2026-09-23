import type { WeatherCondition } from '@/types/weather'

/**
 * WMO weather-code → condition mapping (shared by icons, charts, alerts).
 * Reference: https://open-meteo.com/en/docs (weathercode table).
 */
export function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code === 51 || code === 53 || code === 55) return 'drizzle'
  if (code === 56 || code === 57) return 'drizzle'
  if (
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 66 ||
    code === 67 ||
    code === 80 ||
    code === 81 ||
    code === 82
  )
    return 'rain'
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86)
    return 'snow'
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm'
  return 'unknown'
}

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: 'Clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  thunderstorm: 'Thunderstorm',
  snow: 'Snow',
  unknown: 'Unknown',
}

/** Human-readable condition label for a WMO code. */
export function wmoToLabel(code: number): string {
  return CONDITION_LABELS[wmoToCondition(code)]
}
