import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RefreshButton } from '@/components/common/RefreshButton'
import { useWeatherBundle } from '@/hooks/useWeather'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockWeather(count: { calls: number }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      count.calls += 1
      return new Response(JSON.stringify(openMeteoFixture), { status: 200 })
    }),
  )
}

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  function Probe() {
    const bundle = useWeatherBundle(14.5995, 120.9842)
    return (
      <RefreshButton
        latitude={14.5995}
        longitude={120.9842}
        updatedAt={bundle.data?.updatedAt}
        isFetching={bundle.isFetching}
      />
    )
  }
  render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  )
}

describe('RefreshButton', () => {
  it('refetches the weather bundle exactly once per click', async () => {
    const count = { calls: 0 }
    mockWeather(count)
    const user = userEvent.setup()
    setup()

    await waitFor(() => expect(count.calls).toBe(1), { timeout: 5000 })
    await user.click(screen.getByRole('button', { name: /refresh weather data/i }))
    await waitFor(() => expect(count.calls).toBe(2), { timeout: 5000 })
  }, 15000)

  it('shows updating feedback while fetching', async () => {
    let release!: (value: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve
          }),
      ),
    )
    setup()
    const button = screen.getByRole('button', { name: /refresh weather data/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/updating/i)

    release(new Response(JSON.stringify(openMeteoFixture), { status: 200 }))
    await waitFor(
      () => expect(screen.getByText(/refresh/i, { selector: 'span' })).toBeInTheDocument(),
      { timeout: 5000 },
    )
  }, 15000)

  it('does not fire while already fetching', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    render(
      <QueryClientProvider client={client}>
        <RefreshButton latitude={14.5995} longitude={120.9842} isFetching />
      </QueryClientProvider>,
    )
    await userEvent.click(
      screen.getByRole('button', { name: /refresh weather data/i }),
    )
    expect(spy).not.toHaveBeenCalled()
  })
})
