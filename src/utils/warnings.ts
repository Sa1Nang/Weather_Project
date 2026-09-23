import type { AlertSeverity, DerivedWarning, WarningCategory } from '@/types/alerts'
import type { WeatherBundle } from '@/types/weather'

/**
 * Condition-based warning engine (pure, unit-tested).
 * Thresholds tuned for tropical/PH weather. Output is ALWAYS
 * `DerivedWarning` — the UI must label it as guidance, never as
 * an official government warning.
 */

const THRESHOLDS = {
  heavyRainProbabilityPct: 70,
  heavyRain24hMm: 20,
  strongWindGustKmh: 61,
  extremeHeatFeelsLikeC: 42,
  highUvIndex: 8,
} as const

interface WarningSpec {
  category: WarningCategory
  severity: AlertSeverity
  headline: string
  detail: string
  validFrom: string | null
  validUntil: string | null
}

function makeWarning(spec: WarningSpec, index: number): DerivedWarning {
  return {
    kind: 'derived',
    id: `derived:${spec.category}:${index}`,
    category: spec.category,
    severity: spec.severity,
    headline: spec.headline,
    detail: spec.detail,
    validFrom: spec.validFrom,
    validUntil: spec.validUntil,
  }
}

function hoursAhead(bundle: WeatherBundle, count: number) {
  const now = Date.parse(bundle.current.observedAt)
  return bundle.hourly.filter((h) => Date.parse(h.time) >= now).slice(0, count)
}

/** Derives warnings from a normalized weather bundle (next 24h window). */
export function deriveWarnings(bundle: WeatherBundle): DerivedWarning[] {
  const warnings: DerivedWarning[] = []
  const upcoming = hoursAhead(bundle, 24)
  const { current } = bundle

  // Thunderstorm: observed now or forecast within 24h.
  // Provider-agnostic: normalized bundles always set condition, and WMO
  // codes are preserved via mapping (WeatherAPI thunderstorm codes → 95).
  const stormHour = [current, ...upcoming].find(
    (h) => h.condition === 'thunderstorm' || [95, 96, 99].includes(h.weatherCode),
  )
  if (stormHour) {
    warnings.push(
      makeWarning(
        {
          category: 'thunderstorm',
          severity: 'warning',
          headline: 'Thunderstorms expected',
          detail:
            'Thunderstorm conditions are present in the forecast. Seek shelter indoors during lightning and avoid open water and high ground.',
          validFrom: current.observedAt,
          validUntil: upcoming[upcoming.length - 1]?.time ?? null,
        },
        warnings.length,
      ),
    )
  }

  // Heavy rain: high probability or significant 24h accumulation.
  const peakProb = Math.max(
    current.rainProbabilityPct ?? 0,
    ...upcoming.map((h) => h.rainProbabilityPct ?? 0),
  )
  const totalMm = upcoming.reduce((sum, h) => sum + h.precipitationMm, 0)
  if (
    peakProb >= THRESHOLDS.heavyRainProbabilityPct ||
    totalMm >= THRESHOLDS.heavyRain24hMm
  ) {
    warnings.push(
      makeWarning(
        {
          category: 'heavy-rain',
          severity: peakProb >= 90 || totalMm >= 50 ? 'warning' : 'watch',
          headline: 'Heavy rain likely',
          detail: `Peak rain probability ${peakProb}% with about ${totalMm.toFixed(1)} mm expected over the next 24 hours. Expect reduced visibility and possible localized flooding in low-lying areas.`,
          validFrom: current.observedAt,
          validUntil: upcoming[upcoming.length - 1]?.time ?? null,
        },
        warnings.length,
      ),
    )
  }

  // Strong wind: gusts at or above 61 km/h (tropical-depression-adjacent).
  const peakGust = Math.max(
    current.windGustsKmh ?? 0,
    ...upcoming.map((h) => h.windSpeedKmh),
  )
  if (peakGust >= THRESHOLDS.strongWindGustKmh) {
    warnings.push(
      makeWarning(
        {
          category: 'strong-wind',
          severity: 'watch',
          headline: 'Strong winds expected',
          detail: `Wind speeds up to ${Math.round(peakGust)} km/h are forecast. Secure loose outdoor items and take care when travelling.`,
          validFrom: current.observedAt,
          validUntil: upcoming[upcoming.length - 1]?.time ?? null,
        },
        warnings.length,
      ),
    )
  }

  // Extreme heat: feels-like at or above 42°C (PAGASA danger category).
  const peakFeels = Math.max(
    current.feelsLikeC,
    ...upcoming.map((h) => h.feelsLikeC ?? Number.NEGATIVE_INFINITY),
  )
  if (peakFeels >= THRESHOLDS.extremeHeatFeelsLikeC) {
    warnings.push(
      makeWarning(
        {
          category: 'extreme-heat',
          severity: 'warning',
          headline: 'Dangerous heat',
          detail: `Feels-like temperature reaching ${Math.round(peakFeels)}°C. Stay hydrated, avoid midday outdoor activity, and check on vulnerable people.`,
          validFrom: current.observedAt,
          validUntil: upcoming[upcoming.length - 1]?.time ?? null,
        },
        warnings.length,
      ),
    )
  }

  // High UV: index 8+.
  const peakUv = Math.max(
    current.uvIndex ?? 0,
    ...upcoming.map((h) => h.uvIndex ?? 0),
  )
  if (peakUv >= THRESHOLDS.highUvIndex) {
    warnings.push(
      makeWarning(
        {
          category: 'high-uv',
          severity: 'advisory',
          headline: 'Very high UV',
          detail: `UV index peaking at ${peakUv.toFixed(0)}. Use sun protection between late morning and mid-afternoon.`,
          validFrom: current.observedAt,
          validUntil: upcoming[upcoming.length - 1]?.time ?? null,
        },
        warnings.length,
      ),
    )
  }

  // NOTE: flooding and typhoon categories exist in the type system and UI,
  // but no warning is synthesized for them here — there is no reliable
  // signal in the current data, and fabricating one would violate the
  // never-present-derived-as-official rule. They activate via the official
  // feed adapter (or a future verified signal) only.

  return warnings
}
