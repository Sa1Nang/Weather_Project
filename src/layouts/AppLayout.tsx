import type { ReactNode } from 'react'
import { getBackdropPhoto, type WeatherBackdrop } from '@/utils/backdrop'
import { cn } from '@/utils/cn'

interface AppLayoutProps {
  header: ReactNode
  children: ReactNode
  backdrop?: WeatherBackdrop
}

/**
 * Z-pattern frame: full-bleed weather photo (decorative) + readability
 * scrim + glass nav + 1200px content + footer. Gradient underneath keeps
 * loading/error/offline states attractive when no photo applies.
 */
export function AppLayout({ header, children, backdrop = 'neutral' }: AppLayoutProps) {
  const photo = getBackdropPhoto(backdrop)
  return (
    <div
      className={cn(
        'weather-bg relative flex min-h-screen flex-col text-[var(--ink)]',
        `weather-bg-${backdrop}`,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {photo && (
          <div
            key={backdrop}
            className="weather-photo absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${photo}")` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-[var(--surface-muted)] dark:from-black/60 dark:via-black/45 dark:to-[var(--surface-muted)]" />
      </div>
      {header}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 outline-none focus-visible:outline sm:px-6 lg:px-8"
      >
        {children}
      </main>
      <footer className="relative z-10 bg-[var(--abyss)]/70 py-10 text-center backdrop-blur-md">
        <p className="mono-label text-[var(--ink-muted)]">
          Weather data by Open-Meteo · Official advisories via PAGASA
        </p>
        <p className="font-display mt-2 text-lg opacity-80">
          A quiet gallery for loud skies.
        </p>
      </footer>
    </div>
  )
}
