import { useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { HourCard } from '@/components/forecast/HourCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HourPoint } from '@/types/weather'

interface HourlyStripProps {
  hours: HourPoint[]
  count?: number
}

/**
 * Return the next `count` hourly entries at/after now.
 * Pure — unit-tested against fixtures.
 */
export function selectUpcomingHours(
  hours: HourPoint[],
  count = 24,
  nowMs = Date.now(),
): HourPoint[] {
  const start = hours.findIndex(
    (h) => Date.parse(h.time) >= nowMs - 30 * 60 * 1000,
  )
  if (start === -1) return hours.slice(0, count)
  return hours.slice(start, start + count)
}

/** Vertically scrollable hourly forecast (scroll-snap + arrow buttons). */
export function HourlyStrip({ hours, count = 24 }: HourlyStripProps) {
  const upcoming = selectUpcomingHours(hours, count)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  function scrollBy(direction: 1 | -1) {
    trackRef.current?.scrollBy({
      top: direction * 320,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="relative">
      <div className="mb-2 hidden justify-end gap-1 sm:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll hourly forecast up"
          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--mist)] hover:bg-[var(--surface-muted)] "
        >
          <ChevronUp aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll hourly forecast down"
          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--mist)] hover:bg-[var(--surface-muted)] "
        >
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={trackRef}
        role="region"
        aria-label="Hourly forecast, scroll vertically for more hours"
        tabIndex={0}
        className="flex max-h-[480px] snap-y snap-mandatory flex-col gap-2 overflow-y-auto pb-2 pr-1"
      >
        {upcoming.map((hour, index) => (
          <HourCard key={hour.time} hour={hour} isNow={index === 0} />
        ))}
      </div>
    </div>
  )
}


