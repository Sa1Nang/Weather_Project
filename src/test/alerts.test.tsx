import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AlertsSection } from '@/components/alerts/AlertsSection'
import type { HourPoint, WeatherBundle } from '@/types/weather'

function hourAt(iso: string, overrides: Partial<HourPoint> = {}): HourPoint {
  return {
    time: iso,
    temperatureC: 30,
    feelsLikeC: 33,
    rainProbabilityPct: 10,
    precipitationMm: 0,
    weatherCode: 1,
    condition: 'partly-cloudy',
    isDay: true,
    humidityPct: 70,
    windSpeedKmh: 10,
    uvIndex: 5,
    ...overrides,
  }
}

function bundleWithStorm(): WeatherBundle {
  return {
    latitude: 14.5995,
    longitude: 120.9842,
    timezone: 'Asia/Manila',
    updatedAt: '2026-09-22T13:00:00Z',
    current: {
      observedAt: '2026-09-22T13:00',
      temperatureC: 29.3,
      feelsLikeC: 35,
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
      windGustsKmh: 20,
      uvIndex: 6.5,
      visibilityM: 16000,
    },
    hourly: [hourAt('2026-09-22T13:00'), hourAt('2026-09-22T14:00')],
    daily: [],
  }
}

function calmBundle(): WeatherBundle {
  const storm = bundleWithStorm()
  return {
    ...storm,
    current: {
      ...storm.current,
      weatherCode: 1,
      condition: 'partly-cloudy',
      rainProbabilityPct: 5,
    },
  }
}

describe('AlertsSection', () => {
  it('shows derived guidance with a permanent not-official disclaimer', async () => {
    const user = userEvent.setup()
    render(
      <AlertsSection bundle={bundleWithStorm()} locationName="Manila, Philippines" />,
    )
    // Banner: derived thunderstorm warning is announced.
    expect(
      await screen.findByText(/weather guidance \(warning\)/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /condition-based guidance/i }),
    ).toBeInTheDocument()
    // Government-feed card was removed — it only ever rendered a placeholder.
    expect(
      screen.queryByRole('heading', { name: /official warnings/i }),
    ).not.toBeInTheDocument()

    // First card expanded by default; disclaimer visible.
    expect(screen.getByText(/guidance only/i)).toBeInTheDocument()

    // Expand the heavy-rain card to check location/source metadata.
    await user.click(
      screen.getByRole('button', { name: /heavy rain likely/i }),
    )
    expect(screen.getAllByText('Manila, Philippines').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/app analysis of forecast data/i).length).toBeGreaterThan(0)
  })

  it('shows a calm empty state with no official-feed placeholder', async () => {
    render(<AlertsSection bundle={calmBundle()} locationName="Manila, Philippines" />)
    expect(
      screen.getByText(/no weather guidance right now/i),
    ).toBeInTheDocument()
    // Government-feed card was removed — no placeholder text remains.
    expect(
      screen.queryByText(/no official alerts available/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /official warnings/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/weather guidance \(/i)).not.toBeInTheDocument()
  })
})
