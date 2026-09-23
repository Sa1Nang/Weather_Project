import { describe, expect, it } from 'vitest'
import {
  summarize,
  toHumidityRows,
  toRainRows,
  toTempRows,
  toWindRows,
} from '@/components/charts/chartData'
import type { HourPoint } from '@/types/weather'

const hours: HourPoint[] = [
  {
    time: '2026-09-22T12:00',
    temperatureC: 29,
    feelsLikeC: 34,
    rainProbabilityPct: 40,
    precipitationMm: 0.2,
    weatherCode: 3,
    condition: 'cloudy',
    isDay: true,
    humidityPct: 78,
    windSpeedKmh: 8,
    uvIndex: 5,
  },
  {
    time: '2026-09-22T13:00',
    temperatureC: 29.3,
    feelsLikeC: null,
    rainProbabilityPct: null,
    precipitationMm: 0.6,
    weatherCode: 95,
    condition: 'thunderstorm',
    isDay: true,
    humidityPct: null,
    windSpeedKmh: 9.4,
    uvIndex: null,
  },
]

describe('chart mappers', () => {
  it('maps temp rows with hour labels', () => {
    const rows = toTempRows(hours)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ label: '12:00 PM', tempC: 29 })
    expect(rows[1]?.feelsLikeC).toBeNull()
  })

  it('keeps missing rain/humidity as null gaps', () => {
    expect(toRainRows(hours)[1]?.rainPct).toBeNull()
    expect(toHumidityRows(hours)[1]?.humidityPct).toBeNull()
  })

  it('maps wind rows canonically', () => {
    expect(toWindRows(hours)[0]).toMatchObject({ windKmh: 8 })
  })
})

describe('summarize', () => {
  it('computes min/max/avg ignoring nulls', () => {
    expect(summarize([1, null, 3])).toEqual({ min: 1, max: 3, avg: 2 })
  })

  it('returns nulls for empty series', () => {
    expect(summarize([null, null])).toEqual({ min: null, max: null, avg: null })
  })
})
