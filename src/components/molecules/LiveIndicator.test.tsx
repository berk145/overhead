import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { LiveIndicator } from './LiveIndicator'

it('announces only state changes, not clock updates', () => {
  const { rerender } = render(
    <LiveIndicator state="live" clock="12:00 UTC" label="refreshed just now" />,
  )
  const status = screen.getByRole('status')
  expect(status).toHaveTextContent('Live')
  expect(status).not.toHaveTextContent('12:00 UTC')
  rerender(
    <LiveIndicator
      state="stale"
      clock="12:01 UTC"
      label="refreshed just now"
    />,
  )
  expect(status).toHaveTextContent('Stale')
  expect(status).not.toHaveTextContent('12:01 UTC')
  rerender(
    <LiveIndicator
      state="error"
      clock="12:02 UTC"
      label="refreshed just now"
    />,
  )
  expect(status).toHaveTextContent('Error')
})
