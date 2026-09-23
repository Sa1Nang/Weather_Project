import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MapLocation } from '@/types/location'

export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'kmh' | 'mph' | 'ms' | 'knots'
export type PressureUnit = 'hpa' | 'inHg'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface FavoriteEvent {
  action: 'added' | 'removed'
  name: string
  at: number
}

interface AppState {
  /** Currently displayed location. Defaults to Manila (PH-first). */
  selectedLocation: MapLocation
  favorites: MapLocation[]
  temperatureUnit: TemperatureUnit
  windUnit: WindUnit
  pressureUnit: PressureUnit
  theme: ThemePreference
  /** Last favorite add/remove, consumed by the toast host (not persisted). */
  lastFavoriteEvent: FavoriteEvent | null
  setLocation: (location: MapLocation) => void
  toggleFavorite: (location: MapLocation) => void
  clearFavoriteEvent: () => void
  setUnits: (units: {
    temperatureUnit?: TemperatureUnit
    windUnit?: WindUnit
    pressureUnit?: PressureUnit
  }) => void
  setTheme: (theme: ThemePreference) => void
}

const MANILA: MapLocation = {
  id: 'manila-ph',
  name: 'Manila',
  country: 'Philippines',
  region: 'Metro Manila',
  latitude: 14.5995,
  longitude: 120.9842,
}

/**
 * Phase 1 shell store: shape + persistence only.
 * Weather fetching (TanStack Query) and full favorite logic land in later phases.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedLocation: MANILA,
      favorites: [],
      temperatureUnit: 'celsius',
      windUnit: 'kmh',
      pressureUnit: 'hpa',
      theme: 'dark',
      lastFavoriteEvent: null,
      setLocation: (location) => set({ selectedLocation: location }),
      toggleFavorite: (location) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.id === location.id)
          return {
            favorites: exists
              ? state.favorites.filter((f) => f.id !== location.id)
              : [...state.favorites, location],
            lastFavoriteEvent: {
              action: exists ? 'removed' : 'added',
              name: location.name,
              at: Date.now(),
            },
          }
        }),
      clearFavoriteEvent: () => set({ lastFavoriteEvent: null }),
      setUnits: (units) => set(units),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ph-weather-app:preferences',
      // Toast events are transient — persist them as null so a stale
      // notification never rehydrates.
      partialize: (state) => ({ ...state, lastFavoriteEvent: null }),
    },
  ),
)

export const DEFAULT_LOCATION = MANILA
