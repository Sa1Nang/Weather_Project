import { describe, expect, it } from 'vitest'
import { queryKeys, PHILIPPINES_CENTER } from '@/constants/defaults'
import { DEFAULT_LOCATION } from '@/store/useAppStore'

describe('phase 1 scaffold', () => {
  it('defaults to Manila, Philippines', () => {
    expect(DEFAULT_LOCATION.name).toBe('Manila')
    expect(DEFAULT_LOCATION.country).toBe('Philippines')
  })

  it('builds stable weather query keys', () => {
    expect(queryKeys.weather(14.59951, 120.98419)).toEqual(
      queryKeys.weather(14.5995, 120.9842),
    )
  })

  it('centers the map on the Philippines', () => {
    expect(PHILIPPINES_CENTER.latitude).toBeCloseTo(12.88, 1)
  })
})
