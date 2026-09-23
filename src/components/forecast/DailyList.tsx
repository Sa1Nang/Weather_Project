import { useState } from 'react'
import { DayCard } from '@/components/forecast/DayCard'
import type { DayPoint } from '@/types/weather'

interface DailyListProps {
  days: DayPoint[]
}

/** 7-day forecast as a single-expand accordion (first day open). */
export function DailyList({ days }: DailyListProps) {
  const [expandedIndex, setExpandedIndex] = useState(0)

  const highs = days.map((d) => d.tempMaxC)
  const lows = days.map((d) => d.tempMinC)
  const weekMax = Math.max(...highs)
  const weekMin = Math.min(...lows)

  return (
    <ul aria-label="7-day forecast" className="space-y-2">
      {days.map((day, index) => (
        <DayCard
          key={day.date}
          day={day}
          weekMax={weekMax}
          weekMin={weekMin}
          expanded={expandedIndex === index}
          onToggle={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
        />
      ))}
    </ul>
  )
}
