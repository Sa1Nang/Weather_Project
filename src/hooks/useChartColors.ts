import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Resolved dark mode (follows light/dark/system + OS changes).
 * For canvas/SVG colors that can't use Tailwind `dark:` variants.
 */
export function useResolvedDark(): boolean {
  const theme = useAppStore((s) => s.theme)
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}

/**
 * Monochrome chart palette: ink strokes on surface,
 * muted gray secondaries. ≥3:1 stroke-vs-card both modes.
 */
export function useChartColors() {
  const dark = useResolvedDark()
  return {
    grid: dark ? '#3f4041' : '#e5e5e5',
    temp: dark ? '#ffffff' : '#101214',
    feelsLike: dark ? '#9f9fa0' : '#5b5c5e',
    rainBar: dark ? '#ffffff' : '#101214',
    rainLine: dark ? '#9f9fa0' : '#5b5c5e',
    humidity: dark ? '#ffffff' : '#101214',
    wind: dark ? '#ffffff' : '#101214',
  }
}
