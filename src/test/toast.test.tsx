import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastHost } from '@/components/common/Toast'
import { DEFAULT_LOCATION, useAppStore } from '@/store/useAppStore'

beforeEach(() => {
  vi.useRealTimers()
  useAppStore.setState({ favorites: [], lastFavoriteEvent: null })
})

describe('ToastHost favorite feedback', () => {
  it('announces when a favorite is added and removed', () => {
    render(<ToastHost />)
    // Single persistent live region, announced via text content.
    expect(screen.getByRole('status')).toBeInTheDocument()
    act(() => {
      useAppStore.getState().toggleFavorite(DEFAULT_LOCATION)
    })
    expect(screen.getByText('Manila saved to favorites')).toBeInTheDocument()

    act(() => {
      useAppStore.getState().toggleFavorite(DEFAULT_LOCATION)
    })
    expect(screen.getByText('Manila removed from favorites')).toBeInTheDocument()
  })

  it('auto-dismisses after a delay', async () => {
    vi.useFakeTimers()
    try {
      render(<ToastHost />)
      act(() => {
        useAppStore.getState().toggleFavorite(DEFAULT_LOCATION)
      })
      expect(screen.getByText('Manila saved to favorites')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(3100)
      })
      expect(screen.queryByText('Manila saved to favorites')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('supports manual close', async () => {
    const user = userEvent.setup()
    render(<ToastHost />)
    act(() => {
      useAppStore.getState().toggleFavorite(DEFAULT_LOCATION)
    })
    await user.click(
      screen.getByRole('button', { name: /dismiss notification/i }),
    )
    expect(screen.queryByText('Manila saved to favorites')).not.toBeInTheDocument()
  })

  it('does not persist transient toast events', () => {
    act(() => {
      useAppStore.getState().toggleFavorite(DEFAULT_LOCATION)
    })
    const raw = localStorage.getItem('ph-weather-app:preferences')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state.lastFavoriteEvent).toBeNull()
    expect(JSON.parse(raw as string).state.favorites).toHaveLength(1)
  })
})
