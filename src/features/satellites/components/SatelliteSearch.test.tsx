import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import { useAppStore } from '@/store'
import { gpGroupSchema } from '../api/schema'
import { SatelliteSearch } from './SatelliteSearch'
import { TrackedList } from './TrackedList'

vi.mock('@/lib/propagation/worker-client', () => ({
  useLivePositions: () => null,
  usePropagationStatus: () => 'live',
}))

const records = gpGroupSchema.parse(stations)
const catalog = {
  records,
  groupOf: new Map(
    records.map((record) => [record.NORAD_CAT_ID, 'stations' as const]),
  ),
}

afterEach(() => {
  cleanup()
  useAppStore.setState({ searchQuery: '', selectedNoradId: 25544 })
})

it.each(['iss', '25544'])(
  'selects the first match for %s on Enter',
  (query) => {
    useAppStore.setState({ selectedNoradId: null })
    render(<SatelliteSearch catalog={catalog} />)
    const input = screen.getByRole('textbox', { name: 'Search satellites' })
    fireEvent.change(input, { target: { value: query } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(useAppStore.getState().selectedNoradId).toBe(25544)
  },
)

it('keeps the selection when there is no match', () => {
  render(<SatelliteSearch catalog={catalog} />)
  const input = screen.getByRole('textbox', { name: 'Search satellites' })
  fireEvent.change(input, { target: { value: 'no such satellite' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(useAppStore.getState().selectedNoradId).toBe(25544)
})

it('selects the first displayed match, even when the catalog arrives in a different order', () => {
  const template = gpGroupSchema.element.parse(stations[0])
  const auditRecords = [
    { ...template, OBJECT_NAME: 'ZZZ AUDIT', NORAD_CAT_ID: 99998 },
    { ...template, OBJECT_NAME: 'AAA AUDIT', NORAD_CAT_ID: 99999 },
  ]
  const auditCatalog = {
    records: auditRecords,
    groupOf: new Map(
      auditRecords.map((r) => [r.NORAD_CAT_ID, 'stations' as const]),
    ),
  }
  render(
    <>
      <SatelliteSearch catalog={auditCatalog} />
      <TrackedList catalog={auditCatalog} />
    </>,
  )
  const input = screen.getByRole('textbox', { name: 'Search satellites' })
  fireEvent.change(input, { target: { value: 'audit' } })
  expect(
    screen.getAllByRole('button').map((button) => button.textContent),
  ).toEqual([
    expect.stringContaining('AAA AUDIT'),
    expect.stringContaining('ZZZ AUDIT'),
  ])
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(useAppStore.getState().selectedNoradId).toBe(99999)
})

it('selects an exact NORAD ID before a name containing that number', () => {
  const template = gpGroupSchema.element.parse(stations[0])
  const auditRecords = [
    { ...template, OBJECT_NAME: 'AAA 99999', NORAD_CAT_ID: 99998 },
    { ...template, OBJECT_NAME: 'ZZZ AUDIT', NORAD_CAT_ID: 99999 },
  ]
  const auditCatalog = {
    records: auditRecords,
    groupOf: new Map(
      auditRecords.map((r) => [r.NORAD_CAT_ID, 'stations' as const]),
    ),
  }
  render(
    <>
      <SatelliteSearch catalog={auditCatalog} />
      <TrackedList catalog={auditCatalog} />
    </>,
  )
  const input = screen.getByRole('textbox', { name: 'Search satellites' })
  fireEvent.change(input, { target: { value: '99999' } })
  expect(screen.getAllByRole('button')[0]).toHaveTextContent('ZZZ AUDIT')
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(useAppStore.getState().selectedNoradId).toBe(99999)
})
