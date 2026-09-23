import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { UnitSettings } from '@/components/common/UnitSettings'
import { useAppStore } from '@/store/useAppStore'

beforeEach(() => {
  useAppStore.setState({ temperatureUnit: 'celsius' })
})

describe('UnitSettings dialog', () => {
  it('opens, closes on Escape, and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<UnitSettings />)

    const trigger = screen.getByRole('button', { name: /unit settings/i })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')

    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: /unit settings/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
