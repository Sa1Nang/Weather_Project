import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CurrentCard } from '@/components/weather/CurrentCard'
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
  useAppStore.setState({ favorites: [] })
})

describe('CurrentCard', () => {
  it('renders prominent temperature and condition', () => {
    render(
      <CurrentCard
        location={DEFAULT_LOCATION}
        current={current}
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
    expect(screen.getByRole('heading', { name: /manila/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/current temperature 29°C/i)).toBeInTheDocument()
    expect(screen.getByText('Thunderstorm')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('shows Unavailable when rain probability is missing', () => {
    render(
      <CurrentCard location={DEFAULT_LOCATION} current={{ ...current, rainProbabilityPct: null }} />,
    )
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('toggles favorites via the star button', async () => {
    const user = userEvent.setup()
    render(<CurrentCard location={DEFAULT_LOCATION} current={current} />)
    const star = screen.getByRole('button', { name: /save manila to favorites/i })
    await user.click(star)
    expect(useAppStore.getState().favorites).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: /remove manila from favorites/i }),
    ).toBeInTheDocument()
  })
})
