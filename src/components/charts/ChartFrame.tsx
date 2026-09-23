import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartFrameProps {
  /** Accessible name for the chart image. */
  label: string
  /** Plain-language summary (min/max/avg in user units) for screen readers. */
  summary: string
  children: ReactNode
}

/**
 * Shared Recharts frame: fixed heights for ResponsiveContainer,
 * image role with label, and a visually-hidden data summary so
 * the chart's story survives without sight.
 */
export function ChartFrame({ label, summary, children }: ChartFrameProps) {
  return (
    <div role="img" aria-label={label}>
      <p className="sr-only">{summary}</p>
      <div className="h-64 w-full sm:h-72" aria-hidden="true" inert>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Minimal structural type for custom Recharts tooltips (v2 + v3 safe). */
export interface ChartTooltipEntry {
  active?: boolean
  label?: string | number
  payload?: Array<{
    name?: string
    value?: number | string | null
    color?: string
    dataKey?: string | number
  }>
}

/** Shared tooltip shell: hour label + colored value rows with units. */
export function ChartTooltip({
  active,
  label,
  payload,
}: ChartTooltipEntry) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-[var(--mist)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? 'currentColor' }}
          />
          {entry.name}:{' '}
          <strong>
            {entry.value === null || entry.value === undefined
              ? 'Unavailable'
              : entry.value}
          </strong>
        </p>
      ))}
    </div>
  )
}

