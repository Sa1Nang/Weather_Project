/**
 * Alert models. Two strictly separated kinds:
 *
 * - `OfficialAlert`: issued by a meteorological authority (e.g. PAGASA).
 *   Only ever created from an official feed adapter — never synthesized.
 * - `DerivedWarning`: computed locally from forecast thresholds. Always
 *   rendered with a "guidance, not an official warning" label.
 */

/** Escalating severity; ordering value for banner selection. */
export type AlertSeverity = 'advisory' | 'watch' | 'warning'

export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  advisory: 1,
  watch: 2,
  warning: 3,
}

export type WarningCategory =
  | 'thunderstorm'
  | 'heavy-rain'
  | 'strong-wind'
  | 'extreme-heat'
  | 'high-uv'
  | 'flooding'
  | 'typhoon'

export interface DerivedWarning {
  kind: 'derived'
  id: string
  category: WarningCategory
  severity: AlertSeverity
  headline: string
  detail: string
  /** ISO-8601 local window the warning applies to (null when open-ended). */
  validFrom: string | null
  validUntil: string | null
}

export interface OfficialAlert {
  kind: 'official'
  id: string
  severity: AlertSeverity
  headline: string
  description: string
  source: string
  issuedAt: string
  expiresAt: string | null
  url?: string
}

export type WeatherAlert = DerivedWarning | OfficialAlert

/* ---------------- Official feed architecture ---------------- */

/**
 * Adapter interface for official warning feeds. The PAGASA adapter below
 * is the integration point: implement `fetchOfficialAlerts` against a
 * reliable official source when one becomes available and the section
 * lights up with zero UI changes.
 */
export interface OfficialAlertProvider {
  readonly sourceName: string
  fetchOfficialAlerts(
    latitude: number,
    longitude: number,
  ): Promise<OfficialAlert[]>
}
