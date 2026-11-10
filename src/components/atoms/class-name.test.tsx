import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { Input } from './Input'
import Error from '@/app/error'

describe('component class names', () => {
  it('passes React Aria state to Button and Input class name callbacks', () => {
    render(
      <>
        <Button
          className={({ isDisabled }) =>
            isDisabled ? 'button-disabled' : 'button-enabled'
          }
          isDisabled
        >
          Action
        </Button>
        <Input
          aria-label="Search"
          className={({ isFocused }) =>
            isFocused ? 'input-focused' : 'input-unfocused'
          }
        />
      </>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'button-disabled',
      'rounded-lg',
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('input-unfocused', 'rounded-lg')
  })
})

describe('route error', () => {
  it('offers a retry', () => {
    const retry = vi.fn()
    render(<Error retry={retry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
