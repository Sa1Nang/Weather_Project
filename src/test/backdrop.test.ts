import { describe, expect, it } from 'vitest'
import {
  getBackdropPhoto,
  getWeatherBackdrop,
  isNightTime,
} from '@/utils/backdrop'

const RISE = '2026-09-22T06:00'
const SET = '2026-09-22T18:00'
const NOON = new Date('2026-09-22T12:00')
const MIDNIGHT = new Date('2026-09-22T23:00')

describe('time + weather backdrop', () => {
  it('splits every condition into day/night via isDay fallback', () => {
    expect(getWeatherBackdrop('partly-cloudy', true)).toBe('partly-day')
    expect(getWeatherBackdrop('partly-cloudy', false)).toBe('partly-night')
    expect(getWeatherBackdrop('cloudy', true)).toBe('cloudy-day')
    expect(getWeatherBackdrop('cloudy', false)).toBe('cloudy-night')
    expect(getWeatherBackdrop('fog', true)).toBe('fog-day')
    expect(getWeatherBackdrop('fog', false)).toBe('fog-night')
    expect(getWeatherBackdrop('rain', true)).toBe('wet-day')
    expect(getWeatherBackdrop('rain', false)).toBe('wet-night')
    expect(getWeatherBackdrop('snow', false)).toBe('wet-night')
    expect(getWeatherBackdrop('thunderstorm', true)).toBe('storm-day')
    expect(getWeatherBackdrop('thunderstorm', false)).toBe('storm-night')
  })

  it('maps rainy night and warm night examples', () => {
    expect(getWeatherBackdrop('rain', false)).toBe('wet-night')
    expect(getWeatherBackdrop('clear', false, { feelsLikeC: 25 })).toBe('warm-night')
    expect(getWeatherBackdrop('clear', false, { feelsLikeC: 19.9 })).toBe('clear-night')
  })

  it('overrides stale isDay with sunrise/sunset + ticking clock', () => {
    // API still says day, but clock is past sunset → night.
    expect(
      getWeatherBackdrop('rain', true, { sunrise: RISE, sunset: SET, now: MIDNIGHT }),
    ).toBe('wet-night')
    // API says night, but clock is noon → day.
    expect(
      getWeatherBackdrop('cloudy', false, { sunrise: RISE, sunset: SET, now: NOON }),
    ).toBe('cloudy-day')
  })

  it('isNightTime falls back to isDay when sun times are missing', () => {
    expect(isNightTime(true)).toBe(false)
    expect(isNightTime(false)).toBe(true)
    expect(isNightTime(true, null, null, MIDNIGHT)).toBe(false)
  })

  it('falls back to neutral and null photo for unknown', () => {
    expect(getWeatherBackdrop('unknown', true)).toBe('neutral')
    expect(getBackdropPhoto('neutral')).toBeNull()
    expect(getBackdropPhoto('wet-night')).toContain('images.unsplash.com')
    expect(getBackdropPhoto('warm-night')).toContain('images.unsplash.com')
  })
})
