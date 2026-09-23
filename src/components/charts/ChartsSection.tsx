import { Suspense, lazy } from 'react'
import { Card } from '@/components/common/Card'
import { EmptyState, ErrorState } from '@/components/common/FeedbackStates'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { useHourlyForecast } from '@/hooks/useWeather'

// Code-split: Recharts stays out of the initial bundle.
const ChartTabs = lazy(() =>
  import('@/components/charts/ChartTabs').then((m) => ({ default: m.ChartTabs })),
)

interface ChartsSectionProps {
  latitude: number
  longitude: number
}

/**
 * Charts data owner. Lazy-loads Recharts on demand; a chart-library
 * failure degrades to this section's error state, never the dashboard.
 */
export function ChartsSection({ latitude, longitude }: ChartsSectionProps) {
  const hourly = useHourlyForecast(latitude, longitude)

  if (hourly.isPending) {
    return (
      <Card labelledBy="charts-heading" className="p-8">
        <p className="mono-label text-[var(--ink-muted)]">Signals</p>
        <h2 id="charts-heading" className="font-display mt-1 text-[38px]">
          Charts
        </h2>
        <div className="mt-3" role="status" aria-label="Loading charts">
          <span className="sr-only">Loading charts…</span>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-64 w-full" />
        </div>
      </Card>
    )
  }

  if (hourly.isError || !hourly.data) {
    return (
      <ErrorState
        error={hourly.error ?? new Error('Charts unavailable')}
        onRetry={() => hourly.refetch()}
        title="Charts couldn’t be loaded"
      />
    )
  }

  return (
    <Card labelledBy="charts-heading" className="p-8">
      <p className="mono-label text-[var(--ink-muted)]">Signals · next 24 hours</p>
      <h2 id="charts-heading" className="font-display mt-1 text-[38px]">
        Charts
      </h2>
      <div className="mt-3">
        {hourly.data.length === 0 ? (
          <EmptyState
            title="No chart data"
            message="There is no hourly data to chart for this location right now."
          />
        ) : (
          <Suspense
            fallback={
            <div role="status" aria-label="Loading chart library">
              <span className="sr-only">Loading chart library…</span>
              <Skeleton className="h-64 w-full" />
            </div>
            }
          >
            <ChartTabs hours={hourly.data} />
          </Suspense>
        )}
      </div>
    </Card>
  )
}
