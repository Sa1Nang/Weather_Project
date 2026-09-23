import { useId, useMemo, useRef, useState } from 'react'
import { HumidityChart } from '@/components/charts/HumidityChart'
import { RainChart } from '@/components/charts/RainChart'
import { TempChart } from '@/components/charts/TempChart'
import { WindChart } from '@/components/charts/WindChart'
import { selectUpcomingHours } from '@/components/forecast/HourlyStrip'
import type { HourPoint } from '@/types/weather'
import { cn } from '@/utils/cn'

type ChartTabId = 'temp' | 'rain' | 'humidity' | 'wind'

const TABS: Array<{ id: ChartTabId; label: string }> = [
  { id: 'temp', label: 'Temperature' },
  { id: 'rain', label: 'Rain' },
  { id: 'humidity', label: 'Humidity' },
  { id: 'wind', label: 'Wind' },
]

interface ChartTabsProps {
  hours: HourPoint[]
}

/**
 * APG-compliant tabs, one chart at a time: roving tabindex,
 * ArrowLeft/Right + Home/End with automatic activation, and a
 * labelled tabpanel — so keyboard users get the full chart story.
 */
export function ChartTabs({ hours }: ChartTabsProps) {
  const [active, setActive] = useState<ChartTabId>('temp')
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  // Same 24h window as the hourly strip: one consistent story.
  const upcoming = useMemo(() => selectUpcomingHours(hours, 24), [hours])

  const activeIndex = TABS.findIndex((t) => t.id === active)

  function focusTab(index: number) {
    const count = TABS.length
    const next = ((index % count) + count) % count
    const tab = TABS[next]
    if (tab) {
      setActive(tab.id)
      tabRefs.current[next]?.focus()
    }
  }

  function onTabKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(TABS.length - 1)
        break
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Weather charts" className="flex flex-wrap gap-1">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-panel`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onTabKeyDown(e, index)}
            className={cn(
              'rounded-full px-4 py-1.5 min-h-10 font-mono text-xs uppercase tracking-widest border border-[var(--mist)] transition-colors duration-200 ease-out',
              active === tab.id
                ? 'bg-[var(--wine)] text-[var(--wine-ink)] border-transparent'
                : 'hover:bg-[var(--surface-muted)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${TABS[activeIndex]?.id ?? 'temp'}`}
        tabIndex={0}
        className="mt-3"
      >
        {active === 'temp' && <TempChart hours={upcoming} />}
        {active === 'rain' && <RainChart hours={upcoming} />}
        {active === 'humidity' && <HumidityChart hours={upcoming} />}
        {active === 'wind' && <WindChart hours={upcoming} />}
      </div>
    </div>
  )
}
