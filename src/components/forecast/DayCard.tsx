import { useId } from 'react'
import { ChevronDown, Droplets, Sun, Wind } from 'lucide-react'
import { ConditionIcon } from '@/components/weather/ConditionIcon'
import { useAppStore } from '@/store/useAppStore'
import type { DayPoint } from '@/types/weather'
import { formatDayLong, formatDayShort, formatTimeOfDay } from '@/utils/format'
import { formatTemperature, formatWindSpeed, windDirectionLabel } from '@/utils/units'
import { wmoToLabel } from '@/utils/wmo'
import { cn } from '@/utils/cn'

interface DayCardProps {
  day: DayPoint
  expanded: boolean
  onToggle: () => void
  /** Week-wide max high, for the proportional temp-range bar. */
  weekMax: number
  /** Week-wide min low, for the proportional temp-range bar. */
  weekMin: number
}

/**
 * Scannable daily row with inline expandable details.
 * Temp-range bar is proportional across the week for quick comparison.
 */
export function DayCard({ day, expanded, onToggle, weekMax, weekMin }: DayCardProps) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const windUnit = useAppStore((s) => s.windUnit)
  const rain = day.rainProbabilityMaxPct
  const span = Math.max(1, weekMax - weekMin)
  const leftPct = ((day.tempMinC - weekMin) / span) * 100
  const widthPct = Math.max(4, ((day.tempMaxC - day.tempMinC) / span) * 100)
  const buttonId = useId()
  const panelId = useId()

  return (
    <li className="overflow-hidden rounded-2xl border border-white/40 bg-[var(--surface)]/80 shadow-sm backdrop-blur-xl dark:border-white/10">
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${formatDayLong(day.date)}, ${wmoToLabel(day.weatherCode)}, high ${formatTemperature(day.tempMaxC, temperatureUnit)}, low ${formatTemperature(day.tempMinC, temperatureUnit)}${rain !== null ? `, rain probability ${rain} percent` : ''}`}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--surface-muted)] sm:gap-4 sm:px-5"
      >
        <span className="w-14 shrink-0 sm:w-20">
          <span className="block font-mono text-[11px] uppercase tracking-widest">{formatDayShort(day.date)}</span>
          <span className="block text-xs text-[var(--ink-muted)]">
            {formatDayLong(day.date).split(', ')[1]}
          </span>
        </span>
        <ConditionIcon
          condition={day.condition}
          weatherCode={day.weatherCode}
          isDay
          decorative
          className="h-7 w-7 shrink-0"
        />
        <span className="hidden w-24 shrink-0 truncate text-xs text-[var(--ink-muted)] sm:block">
          {wmoToLabel(day.weatherCode)}
        </span>
        <span
          aria-hidden="true"
          className="relative mx-1 hidden h-1.5 min-w-16 flex-1 rounded-full bg-[var(--mist)] md:block"
        >
          <span
            className="absolute h-full rounded-full bg-[var(--ink)]"
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          />
        </span>
        <span className="ml-auto flex shrink-0 items-baseline gap-2 text-sm">
          <span className="font-bold">
            {formatTemperature(day.tempMaxC, temperatureUnit)}
          </span>
          <span className="text-[var(--ink-muted)]">
            {formatTemperature(day.tempMinC, temperatureUnit)}
          </span>
        </span>
        <span
          className={cn(
            'flex w-12 shrink-0 items-center justify-end gap-0.5 text-xs',
            rain !== null && rain >= 50
              ? 'font-bold text-[var(--ink)]'
              : 'text-[var(--ink-muted)]',
          )}
        >
          <Droplets aria-hidden="true" className="h-4 w-4" />
          {rain === null ? '—' : `${rain}%`}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
        >
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-[var(--mist)] bg-[var(--surface-muted)] px-4 py-4 text-sm sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-[var(--ink-muted)]">Precipitation</dt>
            <dd className="font-semibold">
              {day.precipitationSumMm.toFixed(1)} mm
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              <Wind aria-hidden="true" className="h-4 w-4" /> Wind max
            </dt>
            <dd className="font-semibold">
              {day.windSpeedMaxKmh === null
                ? 'Unavailable'
                : `${formatWindSpeed(day.windSpeedMaxKmh, windUnit)}${day.windDirectionDominantDeg !== null ? ` ${windDirectionLabel(day.windDirectionDominantDeg)}` : ''}`}
            </dd>
            {day.windGustsMaxKmh !== null && (
              <dd className="text-xs text-[var(--ink-muted)]">
                Gusts {formatWindSpeed(day.windGustsMaxKmh, windUnit)}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs text-[var(--ink-muted)]">UV index max</dt>
            <dd className="font-semibold">
              {day.uvIndexMax === null ? 'Unavailable' : day.uvIndexMax.toFixed(1)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              <Sun aria-hidden="true" className="h-4 w-4" /> Sun
            </dt>
            <dd className="font-semibold">{formatTimeOfDay(day.sunrise)}</dd>
            <dd className="text-xs text-[var(--ink-muted)]">
              ↓ {formatTimeOfDay(day.sunset)}
            </dd>
          </div>
        </dl>
        </div>
      )}
    </li>
  )
}


