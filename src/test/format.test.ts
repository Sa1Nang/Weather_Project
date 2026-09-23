import { describe, expect, it } from 'vitest'
import {
  formatDayLength,
  formatDayLong,
  formatDayShort,
  formatHour,
  formatObservedAt,
  formatTimeOfDay,
  formatVisibility,
} from '@/utils/format'

describe('time formatting', () => {
  it('formats hourly stamps', () => {
    expect(formatHour('2026-09-22T13:00')).toBe('1:00 PM')
  })

  it('formats daily stamps', () => {
    expect(formatDayShort('2026-09-22')).toBe('Tue')
    expect(formatDayLong('2026-09-22')).toBe('Tue, Sep 22')
  })

  it('formats sunrise/sunset and observation times', () => {
    expect(formatTimeOfDay('2026-09-22T05:45')).toBe('5:45 AM')
    expect(formatObservedAt('2026-09-22T13:30')).toBe('Sep 22, 1:30 PM')
  })

  it('computes day length from sun times', () => {
    expect(formatDayLength('2026-09-22T05:45', '2026-09-22T17:50')).toBe(
      '12h 05m',
    )
  })

  it('returns fallbacks for missing/invalid times', () => {
    expect(formatDayLength(null, null)).toBeNull()
    expect(formatTimeOfDay(null)).toBe('Unavailable')
    expect(formatHour('not-a-date')).toBe('—')
  })
})

describe('visibility formatting', () => {
  it('formats kilometres and metres', () => {
    expect(formatVisibility(20000)).toBe('20 km')
    expect(formatVisibility(1600)).toBe('1.6 km')
    expect(formatVisibility(800)).toBe('800 m')
  })

  it('falls back for missing data', () => {
    expect(formatVisibility(null)).toBe('Unavailable')
  })
})
