import { afterEach, expect, it, vi } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import type { OmmRecordLike } from './types'
import { PropagationClient } from './worker-client'
class SilentWorker {
  onmessage = null
  onerror = null
  onmessageerror = null
  postMessage() {}
  terminate() {}
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
it('falls back to predicting passes when the worker does not respond', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('Worker', SilentWorker)
  const client = new PropagationClient()
  client.load('stations', stations as OmmRecordLike[])
  const result = client.predictPasses({ noradId: 25544, observer: { lat: 52.37, lon: 4.9, altM: 3 }, startMs: 1794241823000, days: 1, minElevationDeg: 10 })
  await vi.advanceTimersByTimeAsync(5000)
  expect(client.getStatus()).toBe('error')
  expect((await result).passes.length).toBeGreaterThan(0)
})
