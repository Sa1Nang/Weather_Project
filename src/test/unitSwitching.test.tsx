import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CurrentCard } from '@/components/weather/CurrentCard'
import { DetailGrid } from '@/components/weather/DetailGrid'
import { DEFAULT_LOCATION, useAppStore } from '@/store/useAppStore'
import type { CurrentWeather } from '@/types/weather'

const current: CurrentWeather = {
  observedAt: '2026-09-22T13:30',
  temperatureC: 29.3,
  feelsLikeC: 35.0,
  humidityPct: 77,
  rainProbabilityPct: 80,
  precipitationMm: 0.6,
  weatherCode: 95,
  condition: 'thunderstorm',
  isDay: true,
  cloudCoverPct: 75,
  pressureHpa: 1009.5,
  windSpeedKmh: 9.4,
  windDirectionDeg: 257,
  windGustsKmh: 20.0,
  uvIndex: 6.5,
  visibilityM: 16000,
}

beforeEach(() => {
  useAppStore.setState({
    favorites: [],
    lastFavoriteEvent: null,
    temperatureUnit: 'celsius',
    windUnit: 'kmh',
    pressureUnit: 'hpa',
  })
})

describe('unit changes update current-weather UI immediately', () => {
  it('hero temperature follows the temperature unit', () => {
    const { rerender } = render(
      <CurrentCard location={DEFAULT_LOCATION} current={current} />,
    )
    expect(screen.getByLabelText(/current temperature 29°C/i)).toBeInTheDocument()

    useAppStore.setState({ temperatureUnit: 'fahrenheit' })
    rerender(<CurrentCard location={DEFAULT_LOCATION} current={current} />)
    // 29.3°C → 85°F, feels-like 35°C → 95°F.
    expect(screen.getByLabelText(/current temperature 85°F/i)).toBeInTheDocument()
    expect(screen.getByText('95°F')).toBeInTheDocument()
  })

  it('details follow wind and pressure units', () => {
    const { rerender } = render(<DetailGrid current={current} />)
    expect(screen.getByText(/9 km\/h/i)).toBeInTheDocument()
    expect(screen.getByText('1010 hPa')).toBeInTheDocument()

    useAppStore.setState({ windUnit: 'mph', pressureUnit: 'inHg' })
    rerender(<DetailGrid current={current} />)
    // 9.4 km/h → 6 mph; 1009.5 hPa → 29.81 inHg.
    expect(screen.getByText(/6 mph/i)).toBeInTheDocument()
    expect(screen.getByText('29.81 inHg')).toBeInTheDocument()
  })
})
