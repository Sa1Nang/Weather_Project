import { useId } from 'react'
import { CloudOff } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { toUserMessage } from '@/lib/http'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  title?: string
}

/** Friendly, non-technical failure state with optional retry. */
export function ErrorState({
  error,
  onRetry,
  title = 'Weather data couldn’t be loaded',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-2xl border border-[var(--mist)] bg-[var(--surface)] p-8"
    >
      <p className="mono-label text-[var(--ink-muted)]">Signal lost</p>
      <p className="font-display text-2xl">{title}</p>
      <p className="text-sm text-[var(--ink-muted)]">{toUserMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 min-h-10 rounded-lg bg-[var(--wine)] px-[18px] py-3 text-sm font-medium text-[var(--wine-ink)] transition-colors duration-200 ease-out hover:opacity-85"
        >
          Try again →
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  message: string
}

/** Neutral empty state (no results, no favorites, no alerts). */
export function EmptyState({ title, message }: EmptyStateProps) {
  const titleId = useId()
  return (
    <Card labelledBy={titleId} className="p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <CloudOff
          aria-hidden="true"
          className="h-8 w-8 text-[var(--ink-muted)]"
        />
        <p id={titleId} className="font-semibold">{title}</p>
        <p className="text-sm text-[var(--ink-muted)]">{message}</p>
      </div>
    </Card>
  )
}

