import { useId, useState } from 'react'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import { CategoryIcon, categoryLabel } from '@/components/alerts/CategoryIcon'
import type { DerivedWarning, OfficialAlert } from '@/types/alerts'
import { formatObservedAt } from '@/utils/format'
import { cn } from '@/utils/cn'

const SEVERITY_STYLES = {
  advisory: {
    badge: 'border border-[var(--mist)] bg-[var(--surface-muted)] text-[var(--ink)]',
    label: 'Advisory',
  },
  watch: {
    badge: 'border border-[var(--mist)] bg-[var(--surface-muted)] text-[var(--ink)]',
    label: 'Watch',
  },
  warning: {
    badge: 'bg-[var(--wine)] text-[var(--wine-ink)]',
    label: 'Warning',
  },
} as const

interface AlertCardProps {
  warning: DerivedWarning | OfficialAlert
  locationName: string
  defaultExpanded?: boolean
}

/**
 * Expandable alert card: severity badge + category icon + headline always
 * visible; window, description, source, and timestamp behind the toggle.
 * Derived warnings carry a permanent "not official" disclaimer.
 */
export function AlertCard({ warning, locationName, defaultExpanded }: AlertCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const style = SEVERITY_STYLES[warning.severity]
  const isOfficial = warning.kind === 'official'

  const validFrom = isOfficial ? null : warning.validFrom
  const validUntil = isOfficial ? warning.expiresAt : warning.validUntil
  const buttonId = useId()
  const panelId = useId()

  return (
    <li className="overflow-hidden rounded-2xl border border-white/40 bg-[var(--surface)]/80 shadow-sm backdrop-blur-xl dark:border-white/10">
      <button
        type="button"
        id={buttonId}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${style.label}: ${warning.headline} in ${locationName}. ${expanded ? 'Collapse' : 'Expand'} details.`}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--surface-muted)]"
      >
        {isOfficial ? (
          <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--ink)]" />
        ) : (
          <CategoryIcon category={warning.category} decorative className="shrink-0 text-[var(--ink-muted)]" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {warning.headline}
          </span>
          <span className="block truncate text-xs text-[var(--ink-muted)]">
            {isOfficial
              ? `Official · ${warning.source}`
              : `${categoryLabel(warning.category)} · condition-based guidance`}
          </span>
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest',
            style.badge,
          )}
        >
          {style.label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="space-y-2 border-t border-[var(--mist)] bg-[var(--surface-muted)] px-3 py-3 text-sm"
        >
          <p>{isOfficial ? warning.description : warning.detail}</p>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)] sm:grid-cols-2">
            <div>
              <dt className="font-medium">Location</dt>
              <dd>{locationName}</dd>
            </div>
            {(validFrom || validUntil) && (
              <div>
                <dt className="font-medium">Valid</dt>
                <dd>
                  {validFrom ? formatObservedAt(validFrom) : '—'}
                  {' → '}
                  {validUntil ? formatObservedAt(validUntil) : '—'}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Source</dt>
              <dd>{isOfficial ? warning.source : 'App analysis of forecast data'}</dd>
            </div>
            <div>
              <dt className="font-medium">
                {isOfficial ? 'Issued' : 'Generated'}
              </dt>
              <dd>
                {isOfficial
                  ? formatObservedAt(warning.issuedAt)
                  : 'With the latest forecast'}
              </dd>
            </div>
          </dl>
          {!isOfficial && (
            <p className="rounded-lg bg-[var(--surface-muted)] px-2 py-1.5 text-xs">
              Guidance only — not an official government warning. Follow
              PAGASA and local authorities for official advisories.
            </p>
          )}
        </div>
      )}
    </li>
  )
}

