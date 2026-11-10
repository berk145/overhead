import { expect, it } from 'vitest'
import fixture from '@/test/fixtures/open-meteo-cloud.json'
import { cloudWindow } from './cloud-window'
it('returns six UTC hours around the pass and handles missing forecasts', () => {
  const bars = cloudWindow(fixture, Date.parse('2026-11-10T06:33:00Z'))
  expect(bars).toHaveLength(6)
  expect(new Date(bars[0]!.hourMs).toISOString()).toBe(
    '2026-11-10T04:00:00.000Z',
  )
  expect(bars[2]?.isPassHour).toBe(true)
  expect(bars[2]?.cover).toBe(fixture.hourly.cloud_cover[30])
  expect(
    cloudWindow(fixture, Date.parse('2026-12-01T00:00:00Z')).every(
      (b) => b.cover === null,
    ),
  ).toBe(true)
})
