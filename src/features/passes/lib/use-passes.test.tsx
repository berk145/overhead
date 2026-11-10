import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import stations from '@/test/fixtures/gp-stations.json'
import { buildSatrec } from '@/lib/propagation/satrec'
import type { OmmRecordLike, Pass } from '@/lib/propagation/types'
import { usePasses } from './use-passes'

const state = vi.hoisted(() => ({
  now: 3_900_000,
  loaded: true,
  predict: vi.fn(),
}))
vi.mock('@/lib/propagation/use-frame-clock', () => ({
  useFrameClock: () => state.now,
}))
vi.mock('@/lib/propagation/worker-client', () => ({
  propagationClient: { predictPasses: state.predict },
  useLivePositions: () => (state.loaded ? { roster: [25544] } : null),
  usePropagationStatus: () => 'live',
}))
const record = stations.find((r) => r.NORAD_CAT_ID === 25544) as OmmRecordLike
const built = buildSatrec(record)
if (!built) throw new Error('Invalid fixture')
const pass = (riseMs: number, setMs: number): Pass => ({
  noradId: 25544,
  riseMs,
  setMs,
  peakMs: riseMs,
  riseAzDeg: 0,
  peakAzDeg: 0,
  setAzDeg: 0,
  maxElDeg: 20,
  visibility: 'visible',
  samples: [],
})
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

it('caches from the hour boundary and filters the rolling window when time moves or resets', async () => {
  state.loaded = true
  state.now = 3_900_000
  const early = pass(3_700_000, 3_800_000)
  const current = pass(3_850_000, 4_000_000)
  state.predict.mockResolvedValue({ passes: [early, current] })
  const { result, rerender } = renderHook(() => usePasses(record, built), {
    wrapper,
  })
  await waitFor(() => expect(result.current.data?.passes).toEqual([current]))
  expect(state.predict).toHaveBeenCalledWith(
    expect.objectContaining({ startMs: 3_600_000, days: 5 + 4 / 24 }),
  )
  state.now = 4_000_000
  rerender()
  expect(result.current.data?.passes).toEqual([])
  state.now = 3_650_000
  rerender()
  expect(result.current.data?.passes).toEqual([early, current])
  expect(state.predict).toHaveBeenCalledTimes(1)
})

it('resolves invalid elements without waiting for the worker roster', async () => {
  state.loaded = false
  const { result } = renderHook(() => usePasses(record, null), { wrapper })
  await waitFor(() => expect(result.current.data?.error).toBe('decayed'))
})
