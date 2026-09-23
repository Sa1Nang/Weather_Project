import { format, parseISO } from 'date-fns'

/**
 * Local-time formatting helpers. Open-Meteo returns ISO-8601 wall-clock
 * times in the location's timezone (`timezone=auto`), so plain parsing
 * (no TZ shifting) displays the location's local time correctly.
 */

function safeDate(value: string | null): Date | null {
  if (!value) return null
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** "1:30 PM" for hourly points. */
export function formatHour(value: string): string {
  const date = safeDate(value)
  return date ? format(date, 'h:mm a') : '—'
}

/** "Mon" for daily points. */
export function formatDayShort(value: string): string {
  const date = safeDate(value)
  return date ? format(date, 'EEE') : '—'
}

/** "Mon, Sep 22" for daily card subtitles. */
export function formatDayLong(value: string): string {
  const date = safeDate(value)
  return date ? format(date, 'EEE, MMM d') : '—'
}

/** "5:45 AM" for sunrise/sunset. */
export function formatTimeOfDay(value: string | null): string {
  const date = safeDate(value)
  return date ? format(date, 'h:mm a') : 'Unavailable'
}

/** "12h 05m" day length, or null when sun times are missing. */
export function formatDayLength(
  sunrise: string | null,
  sunset: string | null,
): string | null {
  const rise = safeDate(sunrise)
  const set = safeDate(sunset)
  if (!rise || !set) return null
  const minutes = Math.max(0, Math.round((set.getTime() - rise.getTime()) / 60000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}h ${String(rest).padStart(2, '0')}m`
}

/** "Sep 22, 1:30 PM" for observation / last-updated stamps. */
export function formatObservedAt(value: string): string {
  const date = safeDate(value)
  return date ? format(date, 'MMM d, h:mm a') : '—'
}

/** Visibility: "10 km" / "800 m" / "Unavailable". */
export function formatVisibility(metres: number | null): string {
  if (metres === null || !Number.isFinite(metres)) return 'Unavailable'
  if (metres >= 1000) return `${(metres / 1000).toFixed(metres >= 10000 ? 0 : 1)} km`
  return `${Math.round(metres)} m`
}
