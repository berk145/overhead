import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import { gpGroupSchema } from '../api/schema'
import { TrackedList } from './TrackedList'

const state = vi.hoisted(() => ({ query: '', status: 'live' }))
vi.mock('@/store', () => ({
  useAppStore: (
    selector: (s: {
      searchQuery: string
      selectedNoradId: number
      selectSatellite: () => void
    }) => unknown,
  ) =>
    selector({
      searchQuery: state.query,
      selectedNoradId: 25544,
      selectSatellite: () => {},
    }),
}))
vi.mock('@/lib/propagation/worker-client', () => ({
  usePropagationStatus: () => state.status,
  useLivePositions: () => ({
    roster: new Int32Array([25544]),
    latLngAlt: new Float32Array([1, 2, 421.6]),
  }),
}))
const template = gpGroupSchema
  .parse(stations)
  .find((r) => r.NORAD_CAT_ID === 25544)
if (!template) throw new Error('ISS fixture missing')
const records = Array.from({ length: 60 }, (_, i) => ({
  ...template,
  NORAD_CAT_ID: 1000 + i,
  OBJECT_NAME: `MATCH ${String(i).padStart(2, '0')}`,
}))
records.push(template)
const groupOf = new Map(
  records.map(
    (r) =>
      [r.NORAD_CAT_ID, r.NORAD_CAT_ID % 2 ? 'visual' : 'stations'] as const,
  ),
)
const catalog = { records, groupOf }

it('shows worker errors while keeping the catalog searchable', () => {
  state.status = 'error'
  state.query = 'match 01'
  const { rerender } = render(<TrackedList catalog={catalog} />)
  expect(screen.getByRole('status')).toHaveTextContent('Live positions unavailable')
  expect(screen.getByRole('button')).toHaveTextContent('MATCH 01')
  state.status = 'loading'
  rerender(<TrackedList catalog={{ records: [], groupOf: new Map() }} />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  state.query = ''
  state.status = 'live'
})

it('sorts by group with ISS first, displays live altitude and limits search to 50', () => {
  expect(
    gpGroupSchema.parse(stations).some((r) => r.NORAD_CAT_ID === 25544),
  ).toBe(true)
  const { rerender } = render(<TrackedList catalog={catalog} />)
  const rows = screen.getAllByRole('button')
  expect(rows[0]).toHaveTextContent('ISS (ZARYA)')
  expect(rows[0]).toHaveTextContent('421.6 km')
  expect(rows[1]).toHaveTextContent('MATCH 00')
  expect(rows[30]).toHaveTextContent('MATCH 58')
  expect(rows[31]).toHaveTextContent('MATCH 01')
  state.query = 'match'
  rerender(<TrackedList catalog={catalog} />)
  expect(screen.getAllByRole('button')).toHaveLength(50)
  state.query = ''
})

it('explains the unfiltered 2,000 item limit only when truncated', () => {
  const many = Array.from({ length: 2001 }, (_, i) => ({
    ...template,
    NORAD_CAT_ID: i + 10000,
    OBJECT_NAME: `SAT ${i}`,
  }))
  const largeCatalog = {
    records: many,
    groupOf: new Map(many.map((r) => [r.NORAD_CAT_ID, 'stations'] as const)),
  }
  const { rerender } = render(<TrackedList catalog={largeCatalog} />)
  expect(
    screen.getByText(/Showing first 2,000, use search/),
  ).toBeInTheDocument()
  state.query = 'SAT 1'
  rerender(<TrackedList catalog={largeCatalog} />)
  expect(
    screen.queryByText(/Showing first 2,000, use search/),
  ).not.toBeInTheDocument()
  state.query = ''
  rerender(
    <TrackedList
      catalog={{ records: many.slice(0, 2000), groupOf: largeCatalog.groupOf }}
    />,
  )
  expect(
    screen.queryByText(/Showing first 2,000, use search/),
  ).not.toBeInTheDocument()
})
