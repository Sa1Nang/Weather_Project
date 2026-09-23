import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme } from '@/App'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAppStore } from '@/store/useAppStore'

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.classList.remove('dark')
})

beforeEach(() => {
  useAppStore.setState({ theme: 'system' })
})

function stubColorScheme(dark: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('ThemeToggle', () => {
  it('cycles system → light → dark with pressed states', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /system theme/i }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: /^light theme/i }))
    expect(useAppStore.getState().theme).toBe('light')

    await user.click(screen.getByRole('button', { name: /^dark theme/i }))
    expect(useAppStore.getState().theme).toBe('dark')
    expect(
      screen.getByRole('button', { name: /^dark theme/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists the theme choice', () => {
    useAppStore.getState().setTheme('dark')
    const raw = localStorage.getItem('ph-weather-app:preferences')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string).state.theme).toBe('dark')
  })
})

describe('applyTheme', () => {
  it('applies explicit light and dark', () => {
    stubColorScheme(false)
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('follows the OS preference on system', () => {
    stubColorScheme(true)
    applyTheme('system')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    stubColorScheme(false)
    applyTheme('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
