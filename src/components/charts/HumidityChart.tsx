import { memo, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartFrame, ChartTooltip } from '@/components/charts/ChartFrame'
import { summarize, toHumidityRows } from '@/components/charts/chartData'
import { useChartColors } from '@/hooks/useChartColors'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HourPoint } from '@/types/weather'

interface HumidityChartProps {
  hours: HourPoint[]
}

/** 24h relative humidity (%, fixed 0–100 domain). */
export const HumidityChart = memo(function HumidityChart({ hours }: HumidityChartProps) {
  const rows = useMemo(() => toHumidityRows(hours), [hours])
  const reduceMotion = useReducedMotion()
  const colors = useChartColors()

  const summary = useMemo(() => {
    const s = summarize(rows.map((r) => r.humidityPct))
    return s.min === null
      ? 'Humidity data unavailable.'
      : `Humidity next 24 hours: low ${s.min}%, high ${s.max}%, average ${s.avg?.toFixed(0)}%.`
  }, [rows])

  return (
    <ChartFrame label="Humidity chart in percent" summary={summary}>
      <AreaChart
        data={rows}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        className="text-[var(--ink-muted)]"
      >
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} interval={3} />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          domain={[0, 100]}
          label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="humidityPct"
          name="Humidity (%)"
          stroke={colors.humidity}
          fill={colors.humidity}
          fillOpacity={0.25}
          connectNulls
          isAnimationActive={!reduceMotion}
        />
      </AreaChart>
    </ChartFrame>
  )
})
