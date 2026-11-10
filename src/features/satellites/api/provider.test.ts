import { afterEach, expect, it, vi } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'

const date = 'Mon, 09 Nov 2026 12:00:00 GMT'
const success = () =>
  new Response(JSON.stringify(stations), { headers: { 'Last-Modified': date } })
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.resetModules()
})

it('coalesces requests, caches valid records, and serves stale data when upstream fails', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-09T14:00:00Z'))
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(success())
    .mockResolvedValue(new Response('', { status: 503 }))
  vi.stubGlobal('fetch', fetch)
  const { getGpGroup } = await import('./provider')
  const [first, second] = await Promise.all([
    getGpGroup('stations'),
    getGpGroup('stations'),
  ])
  expect(first).toEqual(second)
  expect(first).toMatchObject({
    source: 'CelesTrak via ReTLEctor',
    updatedAt: Date.parse(date),
    stale: false,
  })
  expect(fetch).toHaveBeenCalledTimes(1)
  await getGpGroup('stations')
  expect(fetch).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(6 * 60 * 60_000)
  expect(await getGpGroup('stations')).toMatchObject({
    updatedAt: Date.parse(date),
    stale: true,
  })
  expect(fetch).toHaveBeenCalledTimes(3)
  await getGpGroup('stations')
  expect(fetch).toHaveBeenCalledTimes(3)
})

it('validates mirror data, falls back, and stops CelesTrak requests after a non-200', async () => {
  const fetch = vi
    .fn()
    .mockImplementation(async (url: string) =>
      url.includes('retlector')
        ? new Response('[]', { headers: { Date: date } })
        : new Response('', { status: 403 }),
    )
  vi.stubGlobal('fetch', fetch)
  const { getGpGroup } = await import('./provider')
  await expect(
    Promise.all([getGpGroup('stations'), getGpGroup('visual')]),
  ).rejects.toThrow()
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(
    fetch.mock.calls.filter(([url]) => String(url).includes('celestrak.org')),
  ).toHaveLength(1)
})

it('returns fallback data and rejects unknown route groups', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockResolvedValueOnce(success())
  vi.stubGlobal('fetch', fetch)
  const { GET } = await import('@/app/api/gp/[group]/route')
  const invalid = await GET(new Request('http://localhost/api/gp/invalid'), {
    params: Promise.resolve({ group: 'invalid' }),
  })
  expect(invalid.status).toBe(404)
  expect(fetch).not.toHaveBeenCalled()
  const response = await GET(new Request('http://localhost/api/gp/stations'), {
    params: Promise.resolve({ group: 'stations' }),
  })
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({
    source: 'CelesTrak',
    updatedAt: Date.parse(date),
    stale: false,
  })
})
