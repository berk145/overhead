import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { OverheadApp } from './OverheadApp'
const state = vi.hoisted(() => ({
  status: 'pending',
  record: false,
  queryError: false,
  data: undefined as
    { source: string; updatedAt: number; stale: boolean } | undefined,
}))
vi.mock('@/store', () => ({
  useAppStore: (selector: (s: object) => unknown) =>
    selector({
      selectedNoradId: 20580,
      selectedPassIndex: null,
      observer: { lat: 0, lon: 0, altM: 0, label: 'Test' },
      enabledGroups: ['stations'],
      baseRealMs: 0,
      baseSimMs: 0,
      speed: 1,
    }),
}))
vi.mock('@/features/satellites', () => ({
  useCatalog: () => ({
    byId: new Map(state.record ? [[20580, { NORAD_CAT_ID: 20580 }]] : []),
    groupOf: new Map(),
    loaded: {},
    records: [],
    counts: {},
    statuses: [{ group: 'stations', status: state.status, data: state.data }],
  }),
  useSelectedSatellite: () => null,
  GroupList: () => null,
  TrackedList: () => null,
  SatelliteSearch: () => null,
  SatelliteCard: () => null,
}))
vi.mock('@/features/passes', () => ({
  usePasses: () => ({
    isLoading: false,
    isPending: false,
    isError: state.queryError,
    data: undefined,
  }),
  PassList: ({ loading, error }: { loading?: boolean; error?: string }) => (
    <div>{loading ? 'loading' : (error ?? 'empty')}</div>
  ),
  PassSettingsPill: () => null,
  SkyDome: () => null,
  ExportIcsButton: () => null,
}))
vi.mock('@/features/observer', () => ({
  LocationPill: () => null,
  UrlStateSync: () => null,
}))
vi.mock('@/features/weather', () => ({ CloudStrip: () => null }))
vi.mock('@/features/iss-feed', () => ({ IssCrossCheck: () => null }))
vi.mock('./StageSwitch', () => ({ StageSwitch: () => null }))
vi.mock('@/features/ground-track/components/GroundTrackView', () => ({
  GroundTrackView: () => null,
}))
vi.mock('@/lib/propagation/worker-client', () => ({
  propagationClient: { load: () => {}, unload: () => {}, setClock: () => {} },
  usePropagationStatus: () => 'live',
}))
vi.mock('@/lib/propagation/use-frame-clock', () => ({ useFrameClock: () => 0 }))
vi.mock('@/components/atoms/ThemeToggle', () => ({ ThemeToggle: () => null }))
it('distinguishes an absent selection from loading, failure, and an empty pass result', () => {
  const { rerender, unmount } = render(<OverheadApp />)
  expect(screen.getByText('loading')).toBeInTheDocument()
  state.status = 'success'
  rerender(<OverheadApp />)
  expect(screen.getByText('not-loaded')).toBeInTheDocument()
  state.status = 'error'
  rerender(<OverheadApp />)
  expect(screen.getByText('unavailable')).toBeInTheDocument()
  state.status = 'success'
  state.record = true
  rerender(<OverheadApp />)
  expect(screen.getByText('empty')).toBeInTheDocument()
  state.record = false
  state.status = 'pending'
  unmount()
})

it('shows the upstream source and stale data age', () => {
  state.status = 'success'
  state.data = {
    source: 'CelesTrak via ReTLEctor',
    updatedAt: Date.now() - 8 * 60 * 60_000,
    stale: false,
  }
  const { getByTestId, getAllByText } = render(<OverheadApp />)
  expect(getByTestId('live-indicator')).toHaveAttribute(
    'data-state',
    'stale',
  )
  expect(getAllByText(/CelesTrak via ReTLEctor/)[0]).toHaveTextContent(
    'stale · data updated 8 h ago',
  )
  state.data = undefined
  state.status = 'pending'
})
