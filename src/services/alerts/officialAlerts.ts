import type {
  AlertSeverity,
  OfficialAlert,
  OfficialAlertProvider,
} from '@/types/alerts'

/**
 * Official warnings service — the integration seam for government feeds.
 *
 * PAGASA INTEGRATION GUIDE (when a reliable machine-readable source exists):
 * 1. Implement `OfficialAlertProvider` against the source (e.g. PAGASA
 *    tropical cyclone bulletins / severe weather bulletins feed).
 * 2. Map Tropical Cyclone Wind Signals to severity with `tcwsToSeverity`
 *    below (Signal 1–2 → watch, 3 → warning, 4–5 → warning, highest
 *    priority). Map rainfall advisories (yellow/orange/red) likewise.
 * 3. Always populate `source: 'PAGASA'`, `issuedAt`, and `expiresAt` from
 *    the bulletin — never synthesize them.
 * 4. Swap `activeProvider` to the real adapter. The UI needs no changes:
 *    official cards render automatically with source attribution.
 * 5. Until then this module returns [] and the UI states that clearly.
 */

/** Tropical Cyclone Wind Signal number → alert severity. */
export function tcwsToSeverity(signal: 1 | 2 | 3 | 4 | 5): AlertSeverity {
  if (signal >= 3) return 'warning'
  return 'watch'
}

/** PAGASA rainfall advisory color → alert severity. */
export function rainfallAdvisoryToSeverity(
  color: 'yellow' | 'orange' | 'red',
): AlertSeverity {
  if (color === 'red') return 'warning'
  if (color === 'orange') return 'watch'
  return 'advisory'
}

/**
 * Placeholder adapter: no reliable machine-readable PAGASA feed is wired
 * yet, so it resolves []. It exists so the call-site, types, and UI are
 * already shaped for the real feed.
 */
export const pagasaProvider: OfficialAlertProvider = {
  sourceName: 'PAGASA (integration planned)',
  async fetchOfficialAlerts(): Promise<OfficialAlert[]> {
    return []
  },
}

/** Active provider used by the UI. Swap here when PAGASA is wired. */
export const activeOfficialProvider: OfficialAlertProvider = pagasaProvider

export type { OfficialAlert }

export function fetchOfficialAlerts(
  latitude: number,
  longitude: number,
): Promise<OfficialAlert[]> {
  return activeOfficialProvider.fetchOfficialAlerts(latitude, longitude)
}
