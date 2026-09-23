import { useEffect, useRef, useState } from 'react'
import { Settings2 } from 'lucide-react'
import {
  useAppStore,
  type PressureUnit,
  type TemperatureUnit,
  type WindUnit,
} from '@/store/useAppStore'

/** Persisted unit controls: temperature, wind, pressure. */
export function UnitSettings() {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit)
  const windUnit = useAppStore((s) => s.windUnit)
  const pressureUnit = useAppStore((s) => s.pressureUnit)
  const setUnits = useAppStore((s) => s.setUnits)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape closes and returns focus; outside pointer closes.
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (
        !dialogRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Unit settings"
        title="Unit settings"
        className="flex min-h-10 items-center gap-1.5 rounded-lg border border-[var(--mist)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface-muted)] "
      >
        <Settings2 aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">
          {temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
        </span>
      </button>
      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-label="Unit settings"
          className="absolute right-0 z-20 mt-1 w-56 space-y-3 rounded-lg border border-[var(--mist)] bg-[var(--surface)] p-3 shadow-lg"
        >
          <label className="block text-xs font-medium">
            Temperature
            <select
              value={temperatureUnit}
              onChange={(e) =>
                setUnits({ temperatureUnit: e.target.value as TemperatureUnit })
              }
              className="mt-1 min-h-10 w-full rounded-lg border border-[var(--mist)] bg-[var(--surface)] px-2 py-1.5 text-sm"
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </label>
          <label className="block text-xs font-medium">
            Wind speed
            <select
              value={windUnit}
              onChange={(e) =>
                setUnits({ windUnit: e.target.value as WindUnit })
              }
              className="mt-1 min-h-10 w-full rounded-lg border border-[var(--mist)] bg-[var(--surface)] px-2 py-1.5 text-sm"
            >
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
              <option value="ms">m/s</option>
              <option value="knots">knots</option>
            </select>
          </label>
          <label className="block text-xs font-medium">
            Pressure
            <select
              value={pressureUnit}
              onChange={(e) =>
                setUnits({ pressureUnit: e.target.value as PressureUnit })
              }
              className="mt-1 min-h-10 w-full rounded-lg border border-[var(--mist)] bg-[var(--surface)] px-2 py-1.5 text-sm"
            >
              <option value="hpa">hPa</option>
              <option value="inHg">inHg</option>
            </select>
          </label>
        </div>
      )}
    </div>
  )
}


