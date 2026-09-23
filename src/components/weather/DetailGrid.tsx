import { Droplets, Eye, Gauge, Umbrella, Wind } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { useAppStore } from '@/store/useAppStore'
import type { CurrentWeather } from '@/types/weather'
import { formatVisibility } from '@/utils/format'
import {
  formatPressure,
  formatTemperature,
  formatWindSpeed,
  uvIndexLabel,
  windDirectionLabel,
} from '@/utils/units'

interface DetailGridProps {
  current: CurrentWeather
}

function Unavailable() {
  return <span className="text-[var(--ink-muted)]">Unavailable</span>
}

/** Origin data modules: neutral cards, mono eyebrows, ink data signal. */
export function DetailGrid({ current }: DetailGridProps) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const windUnit = useAppStore((s) => s.windUnit)
  const pressureUnit = useAppStore((s) => s.pressureUnit)

  const cell =
    'rounded-2xl border border-[var(--mist)] bg-[var(--surface-muted)] p-4'
  const label =
    'mono-label flex items-center gap-1.5 text-[var(--ink-muted)]'

  return (
    <Card labelledBy="details-heading" className="p-8">
      <p className="mono-label text-[var(--ink-muted)]">Telemetry</p>
      <h2 id="details-heading" className="font-display mt-1 text-[38px]">
        Details
      </h2>
      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className={cell}>
          <dt className={label}>
            <Droplets aria-hidden="true" className="h-4 w-4" /> Humidity
          </dt>
          <dd className="mt-2 text-2xl font-normal">{current.humidityPct}%</dd>
          <dd
            aria-hidden="true"
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--mist)]"
          >
            <div
              className="h-full rounded-full bg-[var(--ink)]"
              style={{ width: `${Math.min(100, current.humidityPct)}%` }}
            />
          </dd>
        </div>

        <div className={cell}>
          <dt className={label}>
            <Wind aria-hidden="true" className="h-4 w-4" /> Wind
          </dt>
          <dd className="mt-2 text-2xl font-normal">
            {formatWindSpeed(current.windSpeedKmh, windUnit)}{' '}
            <span className="text-sm text-[var(--ink-muted)]">
              {windDirectionLabel(current.windDirectionDeg)}
            </span>
          </dd>
          <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            {Math.round(current.windDirectionDeg)}°
            {current.windGustsKmh !== null &&
              ` · Gusts ${formatWindSpeed(current.windGustsKmh, windUnit)}`}
          </dd>
        </div>

        <div className={cell}>
          <dt className={label}>
            <Gauge aria-hidden="true" className="h-4 w-4" /> Pressure
          </dt>
          <dd className="mt-2 text-2xl font-normal">
            {current.pressureHpa === null ? (
              <Unavailable />
            ) : (
              formatPressure(current.pressureHpa, pressureUnit)
            )}
          </dd>
        </div>

        <div className={cell}>
          <dt className={label}>
            <Eye aria-hidden="true" className="h-4 w-4" /> Visibility
          </dt>
          <dd className="mt-2 text-2xl font-normal">
            {formatVisibility(current.visibilityM)}
          </dd>
        </div>

        <div className={cell}>
          <dt className={label}>
            <Umbrella aria-hidden="true" className="h-4 w-4" /> Precipitation
          </dt>
          <dd className="mt-2 text-2xl font-normal">
            {current.precipitationMm.toFixed(1)} mm
          </dd>
        </div>

        <div className={cell}>
          <dt className={label}>Feels like</dt>
          <dd className="mt-2 text-2xl font-normal">
            {formatTemperature(current.feelsLikeC, temperatureUnit)}
          </dd>
          <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            UV{' '}
            {current.uvIndex === null
              ? 'unavailable'
              : `${current.uvIndex.toFixed(1)} (${uvIndexLabel(current.uvIndex)})`}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
