import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { expect, it } from 'vitest'
import { useAppStore } from '@/store'
import type { Pass } from '@/lib/propagation/types'
import { PassList } from './PassList'

const pass = (riseMs: number): Pass => ({
  noradId: 25544,
  riseMs,
  peakMs: riseMs + 1,
  setMs: riseMs + 2,
  riseAzDeg: 0,
  peakAzDeg: 0,
  setAzDeg: 0,
  maxElDeg: 20,
  visibility: 'visible',
  samples: [],
})
it('selects with arrow keys and retains the selected pass as earlier passes end', async () => {
  useAppStore.setState({ selectedPassIndex: null })
  const passes = [pass(1_000), pass(5_000), pass(9_000)]
  const { rerender } = render(<PassList passes={passes} />)
  const options = screen.getAllByRole('option')
  const first = options[0]
  if (!first) throw new Error('Expected a pass')
  first.focus()
  fireEvent.keyDown(first, { key: 'ArrowDown' })
  await waitFor(() => expect(useAppStore.getState().selectedPassIndex).toBe(1))
  rerender(<PassList passes={passes.slice(1)} />)
  await waitFor(() => expect(useAppStore.getState().selectedPassIndex).toBe(0))
  expect(screen.getAllByRole('option')[0]).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
it('explains invalid elements', () => {
  render(<PassList passes={[]} error="decayed" />)
  expect(
    screen.getByText(/elements are invalid or decayed/i),
  ).toBeInTheDocument()
})

it('shows elevation bands, visibility and duration', () => {
  useAppStore.setState({ selectedPassIndex: null })
  const { container } = render(
    <PassList
      passes={[
        { ...pass(1_000), maxElDeg: 11, setMs: 361_000, visibility: 'visible' },
        { ...pass(501_000), maxElDeg: 39, visibility: 'daylight' },
        { ...pass(901_000), maxElDeg: 79, visibility: 'shadow' },
      ]}
    />,
  )
  expect(screen.getByText('11°')).toHaveClass('text-el-low')
  expect(screen.getByText('39°')).toHaveClass('text-el-mid')
  expect(screen.getByText('79°')).toHaveClass('text-el-high')
  expect(within(container).getByText('Visible')).toBeInTheDocument()
  expect(screen.getByText('Daylight')).toBeInTheDocument()
  expect(screen.getByText('In shadow')).toBeInTheDocument()
  expect(screen.getByText(/6 min/)).toBeInTheDocument()
})
