import { describe, expect, it } from 'vitest'
import { wmoToCondition, wmoToLabel } from '@/utils/wmo'

describe('wmo mapping', () => {
  it.each([
    [0, 'clear'],
    [1, 'partly-cloudy'],
    [3, 'cloudy'],
    [45, 'fog'],
    [51, 'drizzle'],
    [61, 'rain'],
    [95, 'thunderstorm'],
    [71, 'snow'],
  ])('maps code %i to %s', (code, expected) => {
    expect(wmoToCondition(code)).toBe(expected)
  })

  it('falls back to unknown for unrecognized codes', () => {
    expect(wmoToCondition(999)).toBe('unknown')
    expect(wmoToLabel(999)).toBe('Unknown')
  })

  it('labels thunderstorm for tropical alert paths', () => {
    expect(wmoToLabel(95)).toBe('Thunderstorm')
  })
})
