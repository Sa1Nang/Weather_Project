import type { HourPoint } from '@/types/weather'
import { formatHour } from '@/utils/format'

/**
 * Pure mappers: normalized hourly points → Recharts-ready rows.
 * Missing provider values stay `null` so Recharts renders gaps
 * instead of fabricated zeros. Unit conversion happens in the
 * panes (user units), keeping these rows canonical metric.
 */

export interface TempRow {
  label: string
  tempC: number
  feelsLikeC: number | null
}

export interface RainRow {
  label: string
  rainPct: number | null
  precipMm: number
}

export interface HumidityRow {
  label: string
  humidityPct: number | null
}

export interface WindRow {
  label: string
  windKmh: number
}

export function toTempRows(hours: HourPoint[]): TempRow[] {
  return hours.map((h) => ({
    label: formatHour(h.time),
    tempC: h.temperatureC,
    feelsLikeC: h.feelsLikeC,
  }))
}

export function toRainRows(hours: HourPoint[]): RainRow[] {
  return hours.map((h) => ({
    label: formatHour(h.time),
    rainPct: h.rainProbabilityPct,
    precipMm: h.precipitationMm,
  }))
}

export function toHumidityRows(hours: HourPoint[]): HumidityRow[] {
  return hours.map((h) => ({
    label: formatHour(h.time),
    humidityPct: h.humidityPct,
  }))
}

export function toWindRows(hours: HourPoint[]): WindRow[] {
  return hours.map((h) => ({
    label: formatHour(h.time),
    windKmh: h.windSpeedKmh,
  }))
}

export interface SeriesSummary {
  min: number | null
  max: number | null
  avg: number | null
}

/** Min/max/avg over non-null values; nulls when the series is empty. */
export function summarize(values: Array<number | null>): SeriesSummary {
  const present = values.filter((v): v is number => v !== null)
  if (present.length === 0) return { min: null, max: null, avg: null }
  const min = Math.min(...present)
  const max = Math.max(...present)
  const avg = present.reduce((a, b) => a + b, 0) / present.length
  return { min, max, avg }
}
