import { Moon, Sun, SunMoon } from 'lucide-react'
import { useAppStore, type ThemePreference } from '@/store/useAppStore'

const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/** Persisted theme toggle; dark is the default on first visit. */
export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center rounded-lg border border-[var(--mist)]"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            title={`${option.label} theme`}
            aria-label={`${option.label} theme`}
            className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 ${
              active
                ? 'bg-[var(--wine)] text-[var(--wine-ink)]'
                : 'hover:bg-[var(--surface-muted)]'
            }`}
          >
            {option.value === 'light' ? (
              <Sun aria-hidden="true" className="h-4 w-4" />
            ) : option.value === 'dark' ? (
              <Moon aria-hidden="true" className="h-4 w-4" />
            ) : (
              <SunMoon aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        )
      })}
    </div>
  )
}

