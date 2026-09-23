import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DetailGrid } from '@/components/weather/DetailGrid'
import { SunCard } from '@/components/weather/SunCard'
import { useAppStore } from '@/store/useAppStore'
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
  pressureHpa: null,
  windSpeedKmh: 9.4,
  windDirectionDeg: 257,
  windGustsKmh: 20.0,
  uvIndex: null,
  visibilityM: null,
}

beforeEach(() => {
  useAppStore.setState({
    temperatureUnit: 'celsius',
    windUnit: 'kmh',
    pressureUnit: 'hpa',
  })
})

describe('DetailGrid', () => {
  it('renders humidity, wind with compass, and precipitation', () => {
    render(<DetailGrid current={current} />)
    expect(screen.getByText('77%')).toBeInTheDocument()
    expect(screen.getByText(/9 km\/h/i)).toBeInTheDocument()
    expect(screen.getByText('WSW')).toBeInTheDocument()
  })

  it('shows Unavailable for missing pressure and visibility', () => {
    render(<DetailGrid current={current} />)
    expect(screen.getAllByText('Unavailable')).toHaveLength(2)
  })
})

describe('SunCard', () => {
  it('renders sunrise, sunset, and day length', () => {
    render(
      <SunCard
        today={{
          date: '2026-09-22',
          weatherCode: 95,
          condition: 'thunderstorm',
          tempMaxC: 31,
          tempMinC: 25,
          rainProbabilityMaxPct: 80,
          precipitationSumMm: 12.4,
          sunrise: '2026-09-22T05:45',
          sunset: '2026-09-22T17:50',
          uvIndexMax: 8.5,
          windSpeedMaxKmh: 25,
          windGustsMaxKmh: 45,
          windDirectionDominantDeg: 250,
        }}
      />,
    )
    expect(screen.getByText('5:45 AM')).toBeInTheDocument()
    expect(screen.getByText('5:50 PM')).toBeInTheDocument()
    expect(screen.getByText('12h 05m')).toBeInTheDocument()
  })

  it('falls back gracefully without sun data', () => {
    render(<SunCard today={undefined} />)
    expect(screen.getAllByText('Unavailable')).toHaveLength(3)
  })
})
