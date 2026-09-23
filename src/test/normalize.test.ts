import { describe, expect, it } from 'vitest'
import { openMeteoForecastSchema } from '@/lib/schemas'
import { normalizeForecast } from '@/services/weather/normalize'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

function bundle() {
  const parsed = openMeteoForecastSchema.safeParse(openMeteoFixture)
  if (!parsed.success) throw new Error('fixture failed validation')
  return normalizeForecast(parsed.data)
}

describe('normalizeForecast', () => {
  it('maps current conditions with thunderstorm code 95', () => {
    const { current } = bundle()
    expect(current.temperatureC).toBe(29.3)
    expect(current.feelsLikeC).toBe(35.0)
    expect(current.condition).toBe('thunderstorm')
    expect(current.isDay).toBe(true)
    expect(current.pressureHpa).toBe(1009.5)
  })

  it('fills current gaps from the nearest hourly entry', () => {
    const { current } = bundle()
    // 13:00 entry is nearest to 13:30 observation time.
    expect(current.rainProbabilityPct).toBe(80)
    expect(current.uvIndex).toBe(6.5)
    expect(current.visibilityM).toBe(16000)
  })

  it('normalizes every hourly point with conditions', () => {
    const { hourly } = bundle()
    expect(hourly).toHaveLength(3)
    expect(hourly[1]?.condition).toBe('thunderstorm')
    expect(hourly[2]?.condition).toBe('partly-cloudy')
    expect(hourly[0]?.rainProbabilityPct).toBe(40)
  })

  it('normalizes daily points with sun times and precipitation', () => {
    const { daily } = bundle()
    expect(daily).toHaveLength(2)
    expect(daily[0]?.tempMaxC).toBe(31.0)
    expect(daily[0]?.tempMinC).toBe(25.0)
    expect(daily[0]?.rainProbabilityMaxPct).toBe(80)
    expect(daily[0]?.sunrise).toBe('2026-09-22T05:45')
    expect(daily[1]?.condition).toBe('rain')
  })
})
