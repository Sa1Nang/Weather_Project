import type {
  PressureUnit,
  TemperatureUnit,
  WindUnit,
} from '@/store/useAppStore'

/**
 * Unit conversion helpers. Canonical app units are metric
 * (°C, km/h, hPa) — conversion happens at render time only,
 * so caches and models stay provider-consistent.
 */

/** WHO UV severity bands — essential context under Philippine sun. */
export function uvIndexLabel(uv: number): string {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Extreme'
}

export function toTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
}

export function temperatureLabel(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C'
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  return `${Math.round(toTemperature(celsius, unit))}${temperatureLabel(unit)}`
}

export function toWindSpeed(kmh: number, unit: WindUnit): number {
  switch (unit) {
    case 'mph':
      return kmh * 0.621371
    case 'ms':
      return kmh / 3.6
    case 'knots':
      return kmh * 0.539957
    case 'kmh':
    default:
      return kmh
  }
}

export function windSpeedLabel(unit: WindUnit): string {
  switch (unit) {
    case 'mph':
      return 'mph'
    case 'ms':
      return 'm/s'
    case 'knots':
      return 'kt'
    case 'kmh':
    default:
      return 'km/h'
  }
}

export function formatWindSpeed(kmh: number, unit: WindUnit): string {
  return `${Math.round(toWindSpeed(kmh, unit))} ${windSpeedLabel(unit)}`
}

export function toPressure(hpa: number, unit: PressureUnit): number {
  return unit === 'inHg' ? hpa * 0.02953 : hpa
}

export function pressureLabel(unit: PressureUnit): string {
  return unit === 'inHg' ? 'inHg' : 'hPa'
}

export function formatPressure(hpa: number, unit: PressureUnit): string {
  const value = toPressure(hpa, unit)
  return unit === 'inHg'
    ? `${value.toFixed(2)} inHg`
    : `${Math.round(value)} hPa`
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
] as const

/** 0–360° → 16-point compass abbreviation. */
export function windDirectionLabel(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.round(normalized / 22.5) % 16
  return COMPASS_POINTS[index] ?? 'N'
}
