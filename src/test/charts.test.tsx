import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChartTabs } from '@/components/charts/ChartTabs'
import { renderWithProviders } from '@/lib/testUtils'
import { useAppStore } from '@/store/useAppStore'
import type { HourPoint } from '@/types/weather'

function hourAt(iso: string, overrides: Partial<HourPoint> = {}): HourPoint {
  return {
    time: iso,
    temperatureC: 29,
    feelsLikeC: 34,
    rainProbabilityPct: 40,
    precipitationMm: 0.2,
    weatherCode: 3,
    condition: 'cloudy',
    isDay: true,
    humidityPct: 78,
    windSpeedKmh: 8,
    uvIndex: 5,
    ...overrides,
  }
}

const hours = [
  hourAt('2026-09-22T12:00'),
  hourAt('2026-09-22T13:00', { temperatureC: 30, rainProbabilityPct: 80 }),
  hourAt('2026-09-22T14:00', { temperatureC: 31, humidityPct: null }),
]

beforeEach(() => {
  useAppStore.setState({ temperatureUnit: 'celsius', windUnit: 'kmh' })
  // Pin "now" before the test hours so the 24h slice keeps every entry.
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-22T11:00:00Z'))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ChartTabs', () => {
  it('shows the temperature chart by default with a text summary', () => {
    renderWithProviders(<ChartTabs hours={hours} />)
    expect(
      screen.getByRole('img', { name: /temperature chart/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/temperature next 24 hours/i)).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Temperature' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('switches between rain, humidity, and wind charts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChartTabs hours={hours} />)

    await user.click(screen.getByRole('tab', { name: 'Rain' }))
    expect(
      screen.getByRole('img', { name: /rain probability/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/peak probability 80%/i)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Humidity' }))
    expect(
      screen.getByRole('img', { name: /humidity chart/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Wind' }))
    expect(
      screen.getByRole('img', { name: /wind speed chart/i }),
    ).toBeInTheDocument()
  })

  it('supports arrow-key navigation with roving tabindex', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChartTabs hours={hours} />)

    const tempTab = screen.getByRole('tab', { name: 'Temperature' })
    expect(tempTab).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Rain' })).toHaveAttribute(
      'tabindex',
      '-1',
    )

    tempTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Rain' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByRole('img', { name: /rain probability/i }),
    ).toBeInTheDocument()

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Wind' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Temperature' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('links tabs to the labelled tabpanel', () => {
    renderWithProviders(<ChartTabs hours={hours} />)
    const panel = screen.getByRole('tabpanel')
    const tempTab = screen.getByRole('tab', { name: 'Temperature' })
    expect(tempTab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tempTab.id)
  })

  it('renders one chart at a time and honors user units', async () => {
    useAppStore.setState({ temperatureUnit: 'fahrenheit', windUnit: 'mph' })
    const user = userEvent.setup()
    renderWithProviders(<ChartTabs hours={hours} />)
    expect(screen.getByText(/°F/)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Wind' }))
    expect(screen.getByText(/mph/)).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: /temperature chart/i }),
    ).not.toBeInTheDocument()
  })
})
