import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Purely visual loading placeholder (aria-hidden). Announced loading
 * state lives on the section wrapper (role="status"), never on each
 * shimmering block — one announcement per section.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg bg-[var(--mist)]',
        className,
      )}
    />
  )
}

/** Hero-shaped skeleton for the current-weather card. */
export function CurrentWeatherSkeleton() {
  return (
    <div role="status" aria-label="Loading current weather">
      <span className="sr-only">Loading current weather…</span>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-3 h-16 w-40" />
      <Skeleton className="mt-3 h-5 w-32" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </div>
  )
}

/** Row-shaped skeleton for forecast lists. */
export function ForecastSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading forecast">
      <span className="sr-only">Loading forecast…</span>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

