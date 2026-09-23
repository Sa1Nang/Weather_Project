import { Moon, Sunrise, Sunset } from 'lucide-react'
import { Card } from '@/components/common/Card'
import type { DayPoint } from '@/types/weather'
import { formatDayLength, formatTimeOfDay } from '@/utils/format'

interface SunCardProps {
  today?: DayPoint
}

/** Origin category tile: neutral surface, ink text carries identity. */
export function SunCard({ today }: SunCardProps) {
  const dayLength = formatDayLength(today?.sunrise ?? null, today?.sunset ?? null)

  return (
    <Card
      labelledBy="sun-heading"
      variant="tile"
      className="border border-white/40 bg-[var(--surface)]/80 text-[var(--ink)] dark:border-white/10"
    >
      <h2
        id="sun-heading"
        className="mono-label flex items-center gap-2 text-[var(--ink-muted)]"
      >
        <Moon aria-hidden="true" className="h-4 w-4" /> Sun
      </h2>
      <p className="font-display mt-2 text-[38px] leading-[0.9]">Daylight</p>
      <dl className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            <Sunrise aria-hidden="true" className="h-4 w-4" />
            Sunrise
          </dt>
          <dd className="text-lg font-medium">
            {formatTimeOfDay(today?.sunrise ?? null)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            <Sunset aria-hidden="true" className="h-4 w-4" />
            Sunset
          </dt>
          <dd className="text-lg font-medium">
            {formatTimeOfDay(today?.sunset ?? null)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--mist)] pt-3">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            Day length
          </dt>
          <dd className="font-medium">{dayLength ?? 'Unavailable'}</dd>
        </div>
      </dl>
    </Card>
  )
}
