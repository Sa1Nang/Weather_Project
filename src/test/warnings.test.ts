import { describe, expect, it } from 'vitest'
import type { CurrentWeather, HourPoint, WeatherBundle } from '@/types/weather'
import { deriveWarnings } from '@/utils/warnings'

function hourAt(iso: string, overrides: Partial<HourPoint> = {}): HourPoint {
  return {
    time: iso,
    temperatureC: 30,
    feelsLikeC: 33,
    rainProbabilityPct: 10,
    precipitationMm: 0,
    weatherCode: 1,
    condition: 'partly-cloudy',
    isDay: true,
    humidityPct: 70,
    windSpeedKmh: 10,
    uvIndex: 5,
    ...overrides,
  }
}

function calmCurrent(overrides: Partial<CurrentWeather> = {}): CurrentWeather {
  return {
    observedAt: '2026-09-22T13:00',
    temperatureC: 30,
    feelsLikeC: 33,
    humidityPct: 70,
    rainProbabilityPct: 10,
    precipitationMm: 0,
    weatherCode: 1,
    condition: 'partly-cloudy',
    isDay: true,
    cloudCoverPct: 20,
    pressureHpa: 1010,
    windSpeedKmh: 10,
    windDirectionDeg: 90,
    windGustsKmh: 15,
    uvIndex: 5,
    visibilityM: 20000,
    ...overrides,
  }
}

function bundleWith(
  current: CurrentWeather,
  hourly: HourPoint[],
): WeatherBundle {
  return {
    latitude: 14.5995,
    longitude: 120.9842,
    timezone: 'Asia/Manila',
    updatedAt: '2026-09-22T13:00:00Z',
    current,
    hourly,
    daily: [],
  }
}

const calmHours = [
  hourAt('2026-09-22T13:00'),
  hourAt('2026-09-22T14:00'),
]

describe('deriveWarnings', () => {
  it('returns no warnings for calm weather', () => {
    expect(deriveWarnings(bundleWith(calmCurrent(), calmHours))).toEqual([])
  })

  it('warns on observed thunderstorms', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent({ weatherCode: 95, condition: 'thunderstorm' }), calmHours),
    )
    expect(warnings.map((w) => w.category)).toContain('thunderstorm')
    expect(warnings[0]?.severity).toBe('warning')
    expect(warnings.every((w) => w.kind === 'derived')).toBe(true)
  })

  it('detects thunderstorms arriving later in the window', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent(), [
        ...calmHours,
        hourAt('2026-09-22T18:00', { weatherCode: 96 }),
      ]),
    )
    expect(warnings.map((w) => w.category)).toContain('thunderstorm')
  })

  it('watches heavy rain at the probability boundary', () => {
    const atBoundary = deriveWarnings(
      bundleWith(
        calmCurrent({ rainProbabilityPct: 70 }),
        calmHours,
      ),
    )
    expect(atBoundary.map((w) => w.category)).toContain('heavy-rain')
    expect(
      atBoundary.find((w) => w.category === 'heavy-rain')?.severity,
    ).toBe('watch')

    const justBelow = deriveWarnings(
      bundleWith(calmCurrent({ rainProbabilityPct: 69 }), calmHours),
    )
    expect(justBelow.map((w) => w.category)).not.toContain('heavy-rain')
  })

  it('escalates extreme rainfall totals to warning', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent(), [
        hourAt('2026-09-22T13:00', { precipitationMm: 30, rainProbabilityPct: 60 }),
        hourAt('2026-09-22T14:00', { precipitationMm: 25, rainProbabilityPct: 60 }),
      ]),
    )
    expect(
      warnings.find((w) => w.category === 'heavy-rain')?.severity,
    ).toBe('warning')
  })

  it('watches strong gusts at 61 km/h', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent({ windGustsKmh: 61 }), calmHours),
    )
    expect(warnings.map((w) => w.category)).toContain('strong-wind')
  })

  it('warns on dangerous feels-like heat (42°C)', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent({ feelsLikeC: 42 }), calmHours),
    )
    const heat = warnings.find((w) => w.category === 'extreme-heat')
    expect(heat?.severity).toBe('warning')
    expect(heat?.detail).toMatch(/42°C/)
  })

  it('advises on very high UV', () => {
    const warnings = deriveWarnings(
      bundleWith(calmCurrent({ uvIndex: 8 }), calmHours),
    )
    expect(
      warnings.find((w) => w.category === 'high-uv')?.severity,
    ).toBe('advisory')
  })

  it('never fabricates flooding or typhoon warnings', () => {
    const stormy = deriveWarnings(
      bundleWith(
        calmCurrent({ weatherCode: 95, condition: 'thunderstorm', rainProbabilityPct: 95 }),
        [hourAt('2026-09-22T13:00', { precipitationMm: 60, rainProbabilityPct: 100 })],
      ),
    )
    const categories = stormy.map((w) => w.category)
    expect(categories).not.toContain('flooding')
    expect(categories).not.toContain('typhoon')
  })
})
