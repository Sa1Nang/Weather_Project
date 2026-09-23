import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const DISPLAY_MS = 3000

/**
 * Favorite confirmation toasts. A single persistent `role="status"`
 * region (always mounted, empty when idle) announces exactly once —
 * no nested live regions, no aria-label duplication.
 */
export function ToastHost() {
  const event = useAppStore((s) => s.lastFavoriteEvent)
  const clearFavoriteEvent = useAppStore((s) => s.clearFavoriteEvent)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!event) {
      setVisible(false)
      return
    }
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      clearFavoriteEvent()
    }, DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [event, clearFavoriteEvent])

  const message =
    event === null
      ? ''
      : event.action === 'added'
        ? `${event.name} saved to favorites`
        : `${event.name} removed from favorites`

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div role="status" aria-atomic="true">
        {event !== null && visible && (
          <div className="pointer-events-auto flex min-h-10 items-center gap-2 rounded-full border border-[var(--mist)] bg-[var(--wine)] px-4 py-2.5 text-sm font-medium text-[var(--wine-ink)]">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => {
                setVisible(false)
                clearFavoriteEvent()
              }}
              aria-label="Dismiss notification"
              className="ml-1 flex min-h-10 min-w-10 items-center justify-center rounded-lg hover:opacity-80"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

