import { memo, useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartFrame, ChartTooltip } from '@/components/charts/ChartFrame'
import { summarize, toRainRows } from '@/components/charts/chartData'
import { useChartColors } from '@/hooks/useChartColors'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HourPoint } from '@/types/weather'

interface RainChartProps {
  hours: HourPoint[]
}

/**
 * Combined rain story: probability line (left %, 0–100) +
 * precipitation bars (right, mm).
 */
export const RainChart = memo(function RainChart({ hours }: RainChartProps) {
  const rows = useMemo(() => toRainRows(hours), [hours])
  const reduceMotion = useReducedMotion()
  const colors = useChartColors()

  const summary = useMemo(() => {
    const prob = summarize(rows.map((r) => r.rainPct))
    const total = rows.reduce((a, r) => a + r.precipMm, 0)
    if (prob.max === null) return 'Rain probability unavailable for the next 24 hours.'
    return `Rain next 24 hours: peak probability ${prob.max}%, total precipitation ${total.toFixed(1)} mm.`
  }, [rows])

  return (
    <ChartFrame label="Rain probability and precipitation chart" summary={summary}>
      <ComposedChart
        data={rows}
        margin={{ top: 8, right: -4, bottom: 0, left: -12 }}
        className="text-[var(--ink-muted)]"
      >
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} interval={3} />
        <YAxis
          yAxisId="pct"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          domain={[0, 100]}
          label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 11 }}
        />
        <YAxis
          yAxisId="mm"
          orientation="right"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          label={{ value: 'mm', angle: 90, position: 'insideRight', fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          yAxisId="mm"
          dataKey="precipMm"
          name="Precip (mm)"
          fill={colors.rainBar}
          fillOpacity={0.7}
          barSize={10}
          isAnimationActive={!reduceMotion}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="rainPct"
          name="Rain prob (%)"
          stroke={colors.rainLine}
          strokeWidth={2}
          dot={false}
          connectNulls
          isAnimationActive={!reduceMotion}
        />
      </ComposedChart>
    </ChartFrame>
  )
})
