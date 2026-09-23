import { memo, useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartFrame, ChartTooltip } from '@/components/charts/ChartFrame'
import { summarize, toWindRows } from '@/components/charts/chartData'
import { useChartColors } from '@/hooks/useChartColors'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAppStore } from '@/store/useAppStore'
import type { HourPoint } from '@/types/weather'
import { toWindSpeed, windSpeedLabel } from '@/utils/units'

interface WindChartProps {
  hours: HourPoint[]
}

/** 24h wind speed in the user's selected wind unit. */
export const WindChart = memo(function WindChart({ hours }: WindChartProps) {
  const windUnit = useAppStore((s) => s.windUnit)
  const reduceMotion = useReducedMotion()
  const colors = useChartColors()
  const unit = windSpeedLabel(windUnit)

  const rows = useMemo(
    () =>
      toWindRows(hours).map((r) => ({
        label: r.label,
        wind: Math.round(toWindSpeed(r.windKmh, windUnit) * 10) / 10,
      })),
    [hours, windUnit],
  )

  const summary = useMemo(() => {
    const s = summarize(rows.map((r) => r.wind))
    return s.min === null
      ? 'Wind data unavailable.'
      : `Wind next 24 hours: peak ${s.max} ${unit}, average ${s.avg?.toFixed(1)} ${unit}.`
  }, [rows, unit])

  return (
    <ChartFrame label={`Wind speed chart in ${unit}`} summary={summary}>
      <LineChart
        data={rows}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        className="text-[var(--ink-muted)]"
      >
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} interval={3} />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="wind"
          name={`Wind (${unit})`}
          stroke={colors.wind}
          strokeWidth={2}
          dot={false}
          isAnimationActive={!reduceMotion}
        />
      </LineChart>
    </ChartFrame>
  )
})
