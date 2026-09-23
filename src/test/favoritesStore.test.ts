import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/store/useAppStore'

const CEBU = {
  id: 'geo:1717512',
  name: 'Cebu City',
  country: 'Philippines',
  region: 'Central Visayas',
  latitude: 10.2924,
  longitude: 123.9017,
}

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({ favorites: [] })
})

describe('favorites store', () => {
  it('matches by id so re-adding never duplicates', () => {
    const { toggleFavorite } = useAppStore.getState()
    toggleFavorite(CEBU)
    expect(useAppStore.getState().favorites).toHaveLength(1)
    // A fresh object with the same id toggles off — never a second entry.
    toggleFavorite({ ...CEBU })
    expect(useAppStore.getState().favorites).toHaveLength(0)
    toggleFavorite({ ...CEBU })
    expect(useAppStore.getState().favorites).toHaveLength(1)
  })

  it('persists selected location and favorites to localStorage', () => {
    const { setLocation, toggleFavorite } = useAppStore.getState()
    setLocation(CEBU)
    toggleFavorite(CEBU)
    const raw = localStorage.getItem('ph-weather-app:preferences')
    expect(raw).not.toBeNull()
    expect(raw as string).toContain('Cebu City')
    expect(raw as string).toContain('1717512')
  })
})
