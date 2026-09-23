import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'
import type { WeatherCondition } from '@/types/weather'
import { wmoToLabel } from '@/utils/wmo'
import { cn } from '@/utils/cn'

interface ConditionIconProps {
  condition: WeatherCondition
  weatherCode: number
  isDay: boolean
  className?: string
  /**
   * Set when an ancestor (e.g. a named accordion button) already exposes
   * the condition — the icon becomes purely decorative.
   */
  decorative?: boolean
}

/**
 * Weather-condition icon (Lucide only — no emoji).
 * Adapts to day/night for clear and partly-cloudy states.
 */
export function ConditionIcon({
  condition,
  weatherCode,
  isDay,
  className,
  decorative,
}: ConditionIconProps) {
  const label = wmoToLabel(weatherCode)
  const shared = cn('h-10 w-10', className)
  const inheritsColor = className?.includes('text-') ?? false
  const tone = (fallback: string) => (inheritsColor ? undefined : fallback)
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': label }

  switch (condition) {
    case 'clear':
      return isDay ? (
        <Sun {...a11y} className={cn(shared, tone('text-amber-600 dark:text-amber-400'))} />
      ) : (
        <CloudSun {...a11y} className={cn(shared, tone('text-slate-500 dark:text-slate-400'))} />
      )
    case 'partly-cloudy':
      return (
        <CloudSun {...a11y} className={cn(shared, tone('text-amber-600 dark:text-amber-400'))} />
      )
    case 'cloudy':
      return (
        <Cloud {...a11y} className={cn(shared, tone('text-slate-500 dark:text-slate-400'))} />
      )
    case 'fog':
      return (
        <CloudFog {...a11y} className={cn(shared, tone('text-slate-500 dark:text-slate-400'))} />
      )
    case 'drizzle':
      return (
        <CloudDrizzle {...a11y} className={cn(shared, tone('text-sky-600 dark:text-sky-400'))} />
      )
    case 'rain':
      return (
        <CloudRain {...a11y} className={cn(shared, tone('text-blue-600 dark:text-blue-300'))} />
      )
    case 'thunderstorm':
      return (
        <CloudLightning
          {...a11y}
          className={cn(shared, tone('text-slate-600 dark:text-slate-300'))}
        />
      )
    case 'snow':
      return (
        <CloudSnow {...a11y} className={cn(shared, tone('text-sky-600 dark:text-sky-300'))} />
      )
    case 'unknown':
    default:
      return (
        <Cloud {...a11y} className={cn(shared, tone('text-slate-500 dark:text-slate-400'))} />
      )
  }
}
