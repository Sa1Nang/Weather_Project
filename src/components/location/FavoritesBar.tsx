import { StarOff, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/FeedbackStates'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { ConditionIcon } from '@/components/weather/ConditionIcon'
import { queryKeys } from '@/constants/defaults'
import { useFavoriteSummaries } from '@/hooks/useFavoriteSummaries'
import { useAppStore } from '@/store/useAppStore'
import { formatTemperature } from '@/utils/units'
import { wmoToLabel } from '@/utils/wmo'

interface FavoritesBarProps {
  onSelect: (locationId: string) => void
}

/**
 * Saved locations with live weather summaries.
 * Selecting highlights the active favorite; removing never
 * disturbs the currently displayed location.
 */
export function FavoritesBar({ onSelect }: FavoritesBarProps) {
  const selectedId = useAppStore((s) => s.selectedLocation.id)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const summaries = useFavoriteSummaries()
  const queryClient = useQueryClient()
  const failed = summaries.filter((s) => s.isError)
  const anyFailed = failed.length > 0

  function retrySummaries() {
    // Scoped to failed favorites only — the dashboard cache is untouched.
    for (const summary of failed) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.weather(
          summary.location.latitude,
          summary.location.longitude,
        ),
      })
    }
  }

  return (
    <Card labelledBy="favorites-heading" className="flex h-full flex-col p-8">
      <p className="mono-label text-[var(--ink-muted)]">Pinned skies</p>
      <h2 id="favorites-heading" className="font-display mt-1 flex items-center gap-2 text-[38px]">
        Favorites
        {anyFailed && (
          <button
            type="button"
            onClick={retrySummaries}
            className="ml-auto min-h-10 rounded-full border border-[var(--mist)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest hover:bg-[var(--surface-muted)]"
          >
            Retry summaries
          </button>
        )}
      </h2>
      {summaries.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No favorites yet"
            message="Search for a location and tap the star to pin it here."
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Favorite locations">
          {summaries.some((s) => s.isPending) && (
            <span role="status" className="sr-only">
              Loading favorite weather…
            </span>
          )}
          {summaries.map((summary) => {
            const { location } = summary
            const active = location.id === selectedId
            return (
              <li
                key={location.id}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-1.5 transition-colors duration-200 ease-out ${
                  active
                    ? 'border-transparent bg-[var(--wine)] text-[var(--wine-ink)]'
                    : 'border-[var(--mist)] bg-[var(--surface-muted)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(location.id)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Show weather for ${location.name}, ${location.country}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-full text-left"
                >
                  {summary.isPending ? (
                    <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  ) : summary.condition !== null &&
                    summary.weatherCode !== null &&
                    summary.isDay !== null ? (
                    <ConditionIcon
                      condition={summary.condition}
                      weatherCode={summary.weatherCode}
                      isDay={summary.isDay}
                      decorative
                      className="h-6 w-6 shrink-0"
                    />
                  ) : (
                    <StarOff
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 text-[var(--ink-muted)]"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[11px] uppercase tracking-widest">
                      {location.name}
                    </span>
                    <span className="block truncate text-xs opacity-70">
                      {summary.temperatureC !== null
                        ? `${formatTemperature(summary.temperatureC, temperatureUnit)} · ${wmoToLabel(summary.weatherCode ?? 0)}`
                        : summary.isError
                          ? 'Weather unavailable'
                          : location.country}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(location)}
                  aria-label={`Remove ${location.name} from favorites`}
                  title="Remove from favorites"
                  className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}


