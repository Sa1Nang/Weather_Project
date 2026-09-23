import { CloudSun } from 'lucide-react'
import { RefreshButton } from '@/components/common/RefreshButton'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { UnitSettings } from '@/components/common/UnitSettings'
import { GeoButton } from '@/components/location/GeoButton'
import { SearchBar } from '@/components/location/SearchBar'
import type { MapLocation } from '@/types/location'

interface AppHeaderProps {
  latitude: number
  longitude: number
  updatedAt?: string
  isFetching: boolean
  onSelectLocation: (location: MapLocation) => void
}

/** Origin glass nav: brand serif + AI-prompt search + ghost controls. */
export function AppHeader({
  latitude,
  longitude,
  updatedAt,
  isFetching,
  onSelectLocation,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mist)] bg-[var(--surface)]/70 backdrop-blur-[24px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:rounded focus:px-2 focus:py-1"
        >
          Skip to main content
        </a>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--wine)] text-[var(--wine-ink)]">
            <CloudSun aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="mono-label block text-[var(--ink-muted)]">
              Midnight gallery
            </span>
            <span className="font-display text-xl">PH Weather</span>
          </span>
        </div>
        <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:px-4">
          <SearchBar onSelect={onSelectLocation} />
        </div>
        <nav
          aria-label="Weather controls"
          className="ml-auto flex flex-wrap items-center gap-2"
        >
          <GeoButton onLocated={onSelectLocation} />
          <UnitSettings />
          <RefreshButton
            latitude={latitude}
            longitude={longitude}
            updatedAt={updatedAt}
            isFetching={isFetching}
          />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
