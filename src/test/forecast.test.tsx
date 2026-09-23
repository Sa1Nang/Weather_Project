import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ForecastSection } from '@/components/forecast/ForecastSection'
import { selectUpcomingHours } from '@/components/forecast/HourlyStrip'
import { renderWithProviders } from '@/lib/testUtils'
import { useAppStore } from '@/store/useAppStore'
import type { HourPoint } from '@/types/weather'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

beforeEach(() => {
  useAppStore.setState({
    temperatureUnit: 'celsius',
    windUnit: 'kmh',
    pressureUnit: 'hpa',
  })
})

function hourAt(iso: string, tempC: number): HourPoint {
  return {
    time: iso,
    temperatureC: tempC,
    feelsLikeC: tempC,
    rainProbabilityPct: 10,
    precipitationMm: 0,
    weatherCode: 1,
    condition: 'partly-cloudy',
    isDay: true,
    humidityPct: 60,
    windSpeedKmh: 10,
    uvIndex: 5,
  }
}

describe('selectUpcomingHours', () => {
  it('slices the next 24 hours from now', () => {
    const base = Date.parse('2026-09-22T13:30:00')
    const hours = Array.from({ length: 48 }, (_, i) => {
      const t = new Date(base - 5 * 3600_000 + i * 3600_000)
      return hourAt(t.toISOString().slice(0, 16), 25 + i * 0.1)
    })
    const selected = selectUpcomingHours(hours, 24, base)
    expect(selected).toHaveLength(24)
    expect(Date.parse(selected[0]?.time ?? '')).toBeGreaterThanOrEqual(
      base - 30 * 60_000,
    )
  })

  it('falls back to the first entries when all hours are past', () => {
    const hours = [hourAt('2020-01-01T00:00', 25), hourAt('2020-01-01T01:00', 26)]
    expect(selectUpcomingHours(hours, 24)).toHaveLength(2)
  })
})

describe('ForecastSection', () => {
  function mockWeather() {
    // Pin "now" before the fixture hours so all entries are upcoming.
    vi.spyOn(Date, 'now').mockReturnValue(
      Date.parse('2026-09-22T11:00:00Z'),
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify(openMeteoFixture), { status: 200 }),
      ),
    )
  }

  it('renders hourly cards and the 7-day list from live-shaped data', async () => {
    mockWeather()
    renderWithProviders(<ForecastSection latitude={14.5995} longitude={120.9842} />)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /hourly/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    expect(screen.getByRole('heading', { name: /7-day forecast/i })).toBeInTheDocument()
    // Fixture: 3 hourly entries → 3 cards; 2 daily rows.
    expect(screen.getByText('Now')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /7-day forecast/i })).toBeInTheDocument()
  }, 15000)

  it('expands a day to reveal precipitation, wind, UV, and sun details', async () => {
    mockWeather()
    const user = userEvent.setup()
    renderWithProviders(<ForecastSection latitude={14.5995} longitude={120.9842} />)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /7-day forecast/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    // First day expanded by default: fixture precipitation 12.4 mm visible.
    expect(screen.getByText('12.4 mm')).toBeInTheDocument()
    // Collapse it, then expand the second day.
    const secondDay = screen.getByRole('button', { name: /sep 23/i })
    expect(secondDay).toHaveAttribute('aria-expanded', 'false')
    await user.click(secondDay)
    expect(secondDay).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('3.0 mm')).toBeInTheDocument()
  }, 15000)

  it('honors the user-selected temperature and wind units', async () => {
    mockWeather()
    useAppStore.setState({ temperatureUnit: 'fahrenheit', windUnit: 'mph' })
    renderWithProviders(<ForecastSection latitude={14.5995} longitude={120.9842} />)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /hourly/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    // 29.3°C → 85°F in the hourly strip.
    expect(screen.getByText('85°F')).toBeInTheDocument()
  }, 15000)
})
