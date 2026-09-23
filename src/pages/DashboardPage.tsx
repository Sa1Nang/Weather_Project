import { useCallback, useEffect } from 'react'
import { AppHeader } from '@/components/common/AppHeader'
import { ErrorState } from '@/components/common/FeedbackStates'
import { CurrentWeatherSkeleton } from '@/components/common/LoadingSkeleton'
import { AlertsSection } from '@/components/alerts/AlertsSection'
import { ChartsSection } from '@/components/charts/ChartsSection'
import { ForecastSection } from '@/components/forecast/ForecastSection'
import { FavoritesBar } from '@/components/location/FavoritesBar'
import { CurrentCard } from '@/components/weather/CurrentCard'
import { DetailGrid } from '@/components/weather/DetailGrid'
import { SunCard } from '@/components/weather/SunCard'
import { useWeatherBundle } from '@/hooks/useWeather'
import { useNow } from '@/hooks/useNow'
import { AppLayout } from '@/layouts/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import type { MapLocation } from '@/types/location'
import { getWeatherBackdrop, getBackdropPhoto } from '@/utils/backdrop'

/**
 * Z-pattern dashboard. Top bar (brand → search → controls) opens the Z;
 * hero row pairs current conditions (left) with saved places (right);
 * the eye then travels across forecast into a side-by-side
 * details row, then guidance into charts + footer.
 * Mobile collapses to a single column in the same order.
 */
export function DashboardPage() {
  const selectedLocation = useAppStore((s) => s.selectedLocation)
  const setLocation = useAppStore((s) => s.setLocation)
  const { latitude, longitude } = selectedLocation

  const bundle = useWeatherBundle(latitude, longitude)
  // Ticking clock so the backdrop flips day→night between refetches.
  const now = useNow(60_000)

  const today = bundle.data?.daily[0]
  const backdrop = bundle.data
    ? getWeatherBackdrop(bundle.data.current.condition, bundle.data.current.isDay, {
        feelsLikeC: bundle.data.current.feelsLikeC,
        sunrise: today?.sunrise ?? null,
        sunset: today?.sunset ?? null,
        now,
      })
    : 'neutral'

  // Preload the active photo so bucket switches don't flash.
  useEffect(() => {
    const photo = getBackdropPhoto(backdrop)
    if (!photo || typeof Image === 'undefined') return
    const img = new Image()
    img.src = photo
  }, [backdrop])

  const handleSelectLocation = useCallback(
    (location: MapLocation) => setLocation(location),
    [setLocation],
  )

  const handleSelectFavorite = useCallback(
    (locationId: string) => {
      const favorite = useAppStore.getState().favorites.find(
        (f) => f.id === locationId,
      )
      if (favorite) setLocation(favorite)
    },
    [setLocation],
  )

  return (
    <AppLayout
      backdrop={backdrop}
      header={
        <AppHeader
          latitude={latitude}
          longitude={longitude}
          updatedAt={bundle.data?.updatedAt}
          isFetching={bundle.isFetching}
          onSelectLocation={handleSelectLocation}
        />
      }
    >
      <div className="space-y-10">
        {/* Z row 1 — hero: current conditions → saved places (equal height) */}
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {bundle.isPending ? (
              <section aria-label="Current weather">
                <CurrentWeatherSkeleton />
              </section>
            ) : bundle.isError ? (
              <ErrorState
                error={bundle.error}
                onRetry={() => bundle.refetch()}
                title={`Weather for ${selectedLocation.name} couldn’t be loaded`}
              />
            ) : bundle.data ? (
              <CurrentCard
                location={selectedLocation}
                current={bundle.data.current}
                today={bundle.data.daily[0]}
              />
            ) : null}
          </div>
          <FavoritesBar onSelect={handleSelectFavorite} />
        </div>

        {/* Z row 2 — forecast: hourly → 7-day (side-by-side on desktop) */}
        <ForecastSection latitude={latitude} longitude={longitude} />

        {/* Z row 3 — details: telemetry → sun */}
        {bundle.data && (
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DetailGrid current={bundle.data.current} />
            </div>
            <SunCard today={bundle.data.daily[0]} />
          </div>
        )}

        {/* Guidance directly above charts */}
        {bundle.data && (
          <AlertsSection
            bundle={bundle.data}
            locationName={`${selectedLocation.name}, ${selectedLocation.country}`}
          />
        )}

        {/* Z terminal — charts, then footer call-to-action */}
        <ChartsSection latitude={latitude} longitude={longitude} />
      </div>
    </AppLayout>
  )
}
