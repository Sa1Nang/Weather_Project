import { useMemo } from 'react'
import { AlertBanner } from '@/components/alerts/AlertBanner'
import { AlertCard } from '@/components/alerts/AlertCard'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/FeedbackStates'
import type { WeatherBundle } from '@/types/weather'
import { deriveWarnings } from '@/utils/warnings'

interface AlertsSectionProps {
  bundle: WeatherBundle
  locationName: string
}

/**
 * Dedicated severe-weather area: locally derived guidance in a card that
 * is permanently labeled as non-official. The government-feed card was
 * removed — no reliable machine-readable PAGASA feed is wired yet, so it
 * only ever rendered an empty placeholder. Follow PAGASA and local
 * authorities directly for official advisories.
 */
export function AlertsSection({ bundle, locationName }: AlertsSectionProps) {
  const warnings = useMemo(() => deriveWarnings(bundle), [bundle])

  return (
    <div className="space-y-4">
      <AlertBanner warnings={warnings} />

      <Card labelledBy="guidance-heading" className="p-8">
        <p className="mono-label text-[var(--ink-muted)]">Derived · not official</p>
        <h2 id="guidance-heading" className="font-display mt-1 text-[38px]">
          Condition-based guidance
        </h2>
        {warnings.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No weather guidance right now"
              message="Conditions look calm for the next 24 hours. Guidance appears here automatically when thresholds are met."
            />
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Computed from forecast data — not official government warnings.
            </p>
            <ul className="mt-3 space-y-2" aria-label="Condition-based guidance">
              {warnings.map((warning, index) => (
                <AlertCard
                  key={warning.id}
                  warning={warning}
                  locationName={locationName}
                  defaultExpanded={index === 0}
                />
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}


