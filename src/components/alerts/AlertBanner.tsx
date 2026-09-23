import { ShieldAlert } from 'lucide-react'
import type { DerivedWarning } from '@/types/alerts'
import { SEVERITY_ORDER } from '@/types/alerts'
import { categoryLabel } from '@/components/alerts/CategoryIcon'

interface AlertBannerProps {
  warnings: DerivedWarning[]
}

/**
 * Calm summary banner naming the highest-severity active guidance.
 * Text-first (never color-only), non-alarming wording.
 */
export function AlertBanner({ warnings }: AlertBannerProps) {
  if (warnings.length === 0) return null

  const top = [...warnings].sort(
    (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity],
  )[0]
  if (!top) return null

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        <strong>Weather guidance ({top.severity}):</strong>{' '}
        {categoryLabel(top.category).toLowerCase()} conditions expected —{' '}
        {top.headline.toLowerCase()}.{' '}
        {warnings.length > 1 &&
          `${warnings.length - 1} more guidance item${warnings.length > 2 ? 's' : ''} below.`}{' '}
        See details for precautions.
      </p>
    </div>
  )
}

