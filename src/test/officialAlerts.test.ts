import { describe, expect, it } from 'vitest'
import {
  fetchOfficialAlerts,
  rainfallAdvisoryToSeverity,
  tcwsToSeverity,
} from '@/services/alerts/officialAlerts'

describe('PAGASA adapter (stub)', () => {
  it('maps wind signals to severity without inventing data', () => {
    expect(tcwsToSeverity(1)).toBe('watch')
    expect(tcwsToSeverity(2)).toBe('watch')
    expect(tcwsToSeverity(3)).toBe('warning')
    expect(tcwsToSeverity(5)).toBe('warning')
  })

  it('maps rainfall advisory colors to severity', () => {
    expect(rainfallAdvisoryToSeverity('yellow')).toBe('advisory')
    expect(rainfallAdvisoryToSeverity('orange')).toBe('watch')
    expect(rainfallAdvisoryToSeverity('red')).toBe('warning')
  })

  it('returns no alerts until a real feed is wired', async () => {
    await expect(fetchOfficialAlerts(14.5995, 120.9842)).resolves.toEqual(
      [],
    )
  })
})
