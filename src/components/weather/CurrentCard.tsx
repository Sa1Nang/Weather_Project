import { Droplets, Star } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { ConditionIcon } from '@/components/weather/ConditionIcon'
import { useAppStore } from '@/store/useAppStore'
import type { MapLocation } from '@/types/location'
import type { CurrentWeather, DayPoint } from '@/types/weather'
import { formatObservedAt } from '@/utils/format'
import { formatTemperature } from '@/utils/units'
import { wmoToLabel } from '@/utils/wmo'

interface CurrentCardProps {
  location: MapLocation
  current: CurrentWeather
  today?: DayPoint
}

/**
 * Origin hero tile: neutral surface, whisper serif temp,
 * mono annotations. Temperature is the largest type on the page.
 */
export function CurrentCard({ location, current, today }: CurrentCardProps) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const isFavorite = favorites.some((f) => f.id === location.id)

  return (
    <Card
      labelledBy="current-weather-heading"
      variant="tile"
      className="origin-reveal h-full border border-white/40 bg-[var(--surface)]/80 text-[var(--ink)] dark:border-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-[var(--ink-muted)]">
            {[location.region, location.country].filter(Boolean).join(' · ')}
          </p>
          <h1
            id="current-weather-heading"
            className="font-display mt-2 text-[38px] leading-[0.9]"
          >
            {location.name}
          </h1>
          <p className="mono-label mt-2 text-[var(--ink-muted)]">
            Observed {formatObservedAt(current.observedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(location)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${location.name} from favorites`
              : `Save ${location.name} to favorites`
          }
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[var(--mist)] bg-[var(--surface-muted)] transition-colors duration-200 ease-out hover:bg-[var(--steel-hover)]"
        >
          <Star
            aria-hidden="true"
            className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[var(--ink-muted)]'}`}
          />
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-8">
        <ConditionIcon
          condition={current.condition}
          weatherCode={current.weatherCode}
          isDay={current.isDay}
          className="h-20 w-20 text-[var(--ink)]"
        />
        <div>
          <p
            aria-label={`Current temperature ${formatTemperature(current.temperatureC, temperatureUnit)}`}
            className="font-display text-[80px] leading-[0.9] sm:text-[96px]"
          >
            {formatTemperature(current.temperatureC, temperatureUnit)}
          </p>
          <p className="mt-2 text-lg font-light">
            <em>{wmoToLabel(current.weatherCode)}</em>
          </p>
        </div>
        <dl className="grid w-full grid-cols-1 gap-y-2 font-mono text-xs uppercase tracking-widest text-[var(--ink-muted)] sm:ml-auto sm:w-auto">
          <div className="flex justify-between gap-8">
            <dt>Feels like</dt>
            <dd className="font-medium text-[var(--ink)]">
              {formatTemperature(current.feelsLikeC, temperatureUnit)}
            </dd>
          </div>
          {today && (
            <>
              <div className="flex justify-between gap-8">
                <dt>High</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {formatTemperature(today.tempMaxC, temperatureUnit)}
                </dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt>Low</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {formatTemperature(today.tempMinC, temperatureUnit)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--mist)] pt-4 text-sm">
        <p className="flex items-center gap-1.5">
          <Droplets aria-hidden="true" className="h-4 w-4" />
          <span>
            Rain probability{' '}
            <strong>
              {current.rainProbabilityPct === null
                ? 'Unavailable'
                : `${current.rainProbabilityPct}%`}
            </strong>
          </span>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
          ≥0.1 mm · Open-Meteo definition
        </p>
      </div>
    </Card>
  )
}
