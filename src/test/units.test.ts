import { describe, expect, it } from 'vitest'
import {
  formatPressure,
  formatTemperature,
  formatWindSpeed,
  toPressure,
  toTemperature,
  toWindSpeed,
  uvIndexLabel,
  windDirectionLabel,
} from '@/utils/units'

describe('temperature units', () => {
  it('converts freezing and body-relevant points', () => {
    expect(toTemperature(0, 'fahrenheit')).toBe(32)
    expect(toTemperature(100, 'fahrenheit')).toBe(212)
    expect(toTemperature(29.3, 'celsius')).toBe(29.3)
  })

  it('formats with unit labels', () => {
    expect(formatTemperature(29.3, 'celsius')).toBe('29°C')
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F')
  })
})

describe('wind units', () => {
  it('converts km/h to mph, m/s, and knots', () => {
    expect(toWindSpeed(36, 'ms')).toBeCloseTo(10, 5)
    expect(toWindSpeed(100, 'mph')).toBeCloseTo(62.14, 2)
    expect(toWindSpeed(100, 'knots')).toBeCloseTo(54.0, 1)
    expect(toWindSpeed(18, 'kmh')).toBe(18)
  })

  it('formats with unit labels', () => {
    expect(formatWindSpeed(18, 'kmh')).toBe('18 km/h')
    expect(formatWindSpeed(36, 'ms')).toBe('10 m/s')
  })

  it('maps degrees to compass abbreviations', () => {
    expect(windDirectionLabel(0)).toBe('N')
    expect(windDirectionLabel(45)).toBe('NE')
    expect(windDirectionLabel(257)).toBe('WSW')
    expect(windDirectionLabel(360)).toBe('N')
  })
})

describe('pressure units', () => {
  it('converts hPa to inHg', () => {
    expect(toPressure(1013, 'hpa')).toBe(1013)
    expect(toPressure(1013, 'inHg')).toBeCloseTo(29.91, 2)
  })

  it('formats with appropriate precision', () => {
    expect(formatPressure(1009.5, 'hpa')).toBe('1010 hPa')
    expect(formatPressure(1009.5, 'inHg')).toBe('29.81 inHg')
  })
})

describe('uv index bands', () => {
  it('labels WHO severity bands at boundaries', () => {
    expect(uvIndexLabel(0)).toBe('Low')
    expect(uvIndexLabel(2.9)).toBe('Low')
    expect(uvIndexLabel(3)).toBe('Moderate')
    expect(uvIndexLabel(5.9)).toBe('Moderate')
    expect(uvIndexLabel(6)).toBe('High')
    expect(uvIndexLabel(7.9)).toBe('High')
    expect(uvIndexLabel(8)).toBe('Very high')
    expect(uvIndexLabel(10.9)).toBe('Very high')
    expect(uvIndexLabel(11)).toBe('Extreme')
  })
})
