import { ConditionIcon } from '@/components/weather/ConditionIcon'
import { useAppStore } from '@/store/useAppStore'
import type { HourPoint } from '@/types/weather'
import { formatHour } from '@/utils/format'
import { formatTemperature, formatWindSpeed } from '@/utils/units'
import { cn } from '@/utils/cn'

interface HourCardProps {
  hour: HourPoint
  isNow?: boolean
}

/** Compact hourly row: time, icon, temp, rain %, precip, wind. */
export function HourCard({ hour, isNow }: HourCardProps) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const windUnit = useAppStore((s) => s.windUnit)
  const rain = hour.rainProbabilityPct

  return (
    <div
      className={cn(
        'flex w-full snap-start items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors duration-200 ease-out',
        isNow
          ? 'border-2 border-[var(--ink)]'
          : 'border-white/40 bg-[var(--surface)]/80 backdrop-blur-xl dark:border-white/10',
      )}
    >
      <p
        className={cn(
          'w-12 shrink-0 font-mono text-[10px] uppercase tracking-widest',
          isNow ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-muted)]',
        )}
      >
        {isNow ? 'Now' : formatHour(hour.time)}
      </p>
      <ConditionIcon
        condition={hour.condition}
        weatherCode={hour.weatherCode}
        isDay={hour.isDay}
        className="h-6 w-6 shrink-0"
      />
      <p className="shrink-0 text-sm font-bold">
        {formatTemperature(hour.temperatureC, temperatureUnit)}
      </p>
      <p
        className={cn(
          'shrink-0 text-xs',
          rain !== null && rain >= 50
            ? 'font-bold text-[var(--ink)]'
            : 'text-[var(--ink-muted)]',
        )}
        aria-label={
          rain === null ? 'Rain probability unavailable' : `Rain probability ${rain} percent`
        }
      >
        {rain === null ? '—' : `${rain}%`}
      </p>
      <p className="ml-auto shrink-0 text-xs text-[var(--ink-muted)]">
        {hour.precipitationMm > 0 ? `${hour.precipitationMm.toFixed(1)} mm` : 'Dry'}
        {' · '}
        {formatWindSpeed(hour.windSpeedKmh, windUnit)}
      </p>
    </div>
  )
}

