import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useAppStore } from '@/store'
import { LiveClock } from './LiveClock'
vi.mock('@/lib/propagation/use-frame-clock', () => ({
  useFrameClock: () => Date.now(),
}))
afterEach(() => {
  vi.useRealTimers()
  useAppStore.getState().resetClock()
})
it('keeps simulated time after switching back to 1x until reset', () => {
  vi.useFakeTimers()
  useAppStore.getState().resetClock()
  render(<LiveClock />)
  fireEvent.click(screen.getByRole('button', { name: '60×' }))
  act(() => vi.advanceTimersByTime(2000))
  fireEvent.click(screen.getByRole('button', { name: '1×' }))
  expect(screen.getByRole('button', { name: /Simulated/ })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Simulated/ }))
  expect(screen.getByRole('button', { name: /Real time/ })).toBeInTheDocument()
})
