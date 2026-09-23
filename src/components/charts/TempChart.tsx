import { memo, useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartFrame, ChartTooltip } from '@/components/charts/ChartFrame'
import { summarize, toTempRows } from '@/components/charts/chartData'
import { useChartColors } from '@/hooks/useChartColors'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAppStore } from '@/store/useAppStore'
import type { HourPoint } from '@/types/weather'
import { temperatureLabel, toTemperature } from '@/utils/units'

interface TempChartProps {
  hours: HourPoint[]
}

/** 24h temperature + feels-like (°C/°F per user setting). */
export const TempChart = memo(function TempChart({ hours }: TempChartProps) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const reduceMotion = useReducedMotion()
  const colors = useChartColors()
  const unit = temperatureLabel(temperatureUnit)

  const rows = useMemo(
    () =>
      toTempRows(hours).map((r) => ({
        label: r.label,
        temp: Math.round(toTemperature(r.tempC, temperatureUnit) * 10) / 10,
        feelsLike:
          r.feelsLikeC === null
            ? null
            : Math.round(toTemperature(r.feelsLikeC, temperatureUnit) * 10) / 10,
      })),
    [hours, temperatureUnit],
  )

  const summary = useMemo(() => {
    const s = summarize(rows.map((r) => r.temp))
    return s.min === null
      ? 'Temperature data unavailable.'
      : `Temperature next 24 hours: low ${s.min}${unit}, high ${s.max}${unit}, average ${s.avg?.toFixed(1)}${unit}.`
  }, [rows, unit])

  return (
    <ChartFrame
      label={`Temperature chart in ${unit}`}
      summary={summary}
    >
      <ComposedChart
        data={rows}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        className="text-[var(--ink-muted)]"
      >
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} interval={3} />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11 }}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="temp"
          name={`Temp (${unit})`}
          stroke={colors.temp}
          fill={colors.temp}
          fillOpacity={0.2}
          connectNulls
          isAnimationActive={!reduceMotion}
        />
        <Line
          type="monotone"
          dataKey="feelsLike"
          name={`Feels like (${unit})`}
          stroke={colors.feelsLike}
          strokeDasharray="5 4"
          dot={false}
          connectNulls
          isAnimationActive={!reduceMotion}
        />
      </ComposedChart>
    </ChartFrame>
  )
})
