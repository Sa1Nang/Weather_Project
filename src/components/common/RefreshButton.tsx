import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { queryKeys } from '@/constants/defaults'
import { formatObservedAt } from '@/utils/format'

interface RefreshButtonProps {
  latitude: number
  longitude: number
  updatedAt?: string
  isFetching: boolean
}

/**
 * Manual refresh: invalidates the location's cached bundle exactly once
 * (no duplicate simultaneous requests — one query key, one refetch).
 */
export function RefreshButton({
  latitude,
  longitude,
  updatedAt,
  isFetching,
}: RefreshButtonProps) {
  const queryClient = useQueryClient()
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(updatedAt)

  async function refresh() {
    if (isFetching) return
    await queryClient.invalidateQueries({
      queryKey: queryKeys.weather(latitude, longitude),
    })
    setLastUpdated(new Date().toISOString())
  }

  return (
    <div className="flex items-center gap-2">
      {lastUpdated && (
        <p className="hidden text-xs text-[var(--ink-muted)] md:block">
          Updated {formatObservedAt(lastUpdated)}
        </p>
      )}
      <button
        type="button"
        onClick={refresh}
        disabled={isFetching}
        aria-label="Refresh weather data"
        title="Refresh weather data"
        className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--mist)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:cursor-wait disabled:opacity-60 "
      >
        <RefreshCw
          aria-hidden="true"
          className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
        />
        <span className="hidden sm:inline">
          {isFetching ? 'Updating…' : 'Refresh'}
        </span>
      </button>
    </div>
  )
}


