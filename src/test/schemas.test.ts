import { describe, expect, it } from 'vitest'
import { openMeteoForecastSchema } from '@/lib/schemas'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

describe('openMeteoForecastSchema', () => {
  it('accepts a well-formed forecast payload', () => {
    expect(openMeteoForecastSchema.safeParse(openMeteoFixture).success).toBe(
      true,
    )
  })

  it('rejects payloads missing required blocks', () => {
    expect(
      openMeteoForecastSchema.safeParse({ latitude: 1, longitude: 2 })
        .success,
    ).toBe(false)
  })

  it('rejects wrong-typed fields', () => {
    const bad = {
      ...(openMeteoFixture as Record<string, unknown>),
      timezone: 42,
    }
    expect(openMeteoForecastSchema.safeParse(bad).success).toBe(false)
  })

  it('tolerates missing optional provider fields', () => {
    const sparse = structuredClone(openMeteoFixture) as Record<string, unknown>
    const current = sparse.current as Record<string, unknown>
    delete current.cloud_cover
    delete current.wind_gusts_10m
    expect(openMeteoForecastSchema.safeParse(sparse).success).toBe(true)
  })
})
