import { Card } from '@/components/common/Card'
import { EmptyState, ErrorState } from '@/components/common/FeedbackStates'
import { ForecastSkeleton } from '@/components/common/LoadingSkeleton'
import { DailyList } from '@/components/forecast/DailyList'
import { HourlyStrip } from '@/components/forecast/HourlyStrip'
import { useDailyForecast, useHourlyForecast } from '@/hooks/useWeather'

interface ForecastSectionProps {
  latitude: number
  longitude: number
}

/**
 * Forecast data owner: hourly + daily slices share the dashboard's
 * cached bundle (same query key → one network request total).
 * Own loading/error states with retry; never crashes the page.
 */
export function ForecastSection({ latitude, longitude }: ForecastSectionProps) {
  const hourly = useHourlyForecast(latitude, longitude)
  const daily = useDailyForecast(latitude, longitude)

  const isPending = hourly.isPending || daily.isPending
  const error = hourly.error ?? daily.error

  if (isPending) {
    return (
      <Card labelledBy="forecast-heading" className="p-8">
        <p className="mono-label text-[var(--ink-muted)]">Forecast</p>
        <h2 id="forecast-heading" className="font-display mt-1 text-[38px]">
          Coming hours
        </h2>
        <div className="mt-3">
          <ForecastSkeleton rows={5} />
        </div>
      </Card>
    )
  }

  if (error || !hourly.data || !daily.data) {
    return (
      <ErrorState
        error={error ?? new Error('Forecast unavailable')}
        onRetry={() => {
          void hourly.refetch()
          void daily.refetch()
        }}
        title="Forecast couldn’t be loaded"
      />
    )
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card labelledBy="hourly-heading" className="p-8">
        <p className="mono-label text-[var(--ink-muted)]">Next 24 hours</p>
        <h2 id="hourly-heading" className="font-display mb-4 mt-1 text-[38px]">
          Hourly
        </h2>
        {hourly.data.length === 0 ? (
          <EmptyState
            title="No hourly data"
            message="Hourly forecast is empty for this location right now."
          />
        ) : (
          <HourlyStrip hours={hourly.data} />
        )}
      </Card>
      <Card labelledBy="daily-heading" className="p-8">
        <p className="mono-label text-[var(--ink-muted)]">Week ahead</p>
        <h2 id="daily-heading" className="font-display mb-4 mt-1 text-[38px]">
          7-day forecast
        </h2>
        {daily.data.length === 0 ? (
          <EmptyState
            title="No daily data"
            message="Daily forecast is empty for this location right now."
          />
        ) : (
          <DailyList days={daily.data} />
        )}
      </Card>
    </div>
  )
}
