import { expect, it } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import type { OmmRecordLike } from './types'
import { buildSatrec } from './satrec'
import { bisect, classifyVisibility, findPasses, goldenMax } from './pass-search'
const iss = stations.find((r) => r.NORAD_CAT_ID === 25544) as OmmRecordLike | undefined
if (!iss) throw new Error('ISS fixture missing')
const built = buildSatrec(iss)
if (!built) throw new Error('ISS fixture is invalid')
const ams = { lat: 52.37, lon: 4.9, altM: 3 }, startMs = 1794241823000
it('finds and samples ISS passes within the prediction window', () => {
  const passes = findPasses({ satrec: built.satrec, observer: ams, startMs, days: 5, minElevationDeg: 10, noradId: 25544 })
  expect(passes).toHaveLength(23)
  const p = passes[0]
  if (!p) throw new Error('Expected an ISS pass')
  expect(Math.abs(p.riseMs - Date.parse('2026-11-09T19:08:48Z'))).toBeLessThan(2000)
  expect(p.maxElDeg).toBeCloseTo(15.76, 1)
  expect(p.samples[0]?.tMs).toBe(p.riseMs)
  expect(p.samples.at(-1)?.tMs).toBe(p.setMs)
})
it('refines crossings and peaks and classifies visibility', () => {
  expect(Math.abs(bisect((x) => x - 100000, 70000, 130000, 0) - 100000)).toBeLessThan(1000)
  expect(Math.abs(goldenMax((x) => -((x - 250000) ** 2), 0, 600000) - 250000)).toBeLessThan(1000)
  const night = Date.parse('2026-11-09T22:00:00Z'), noon = Date.parse('2026-11-09T12:00:00Z')
  const sample = (tMs: number, lit: boolean) => ({ tMs, lit, azDeg: 0, elDeg: 30 })
  expect(classifyVisibility([sample(night, true)], ams, night)).toBe('visible')
  expect(classifyVisibility([sample(night, false)], ams, night)).toBe('shadow')
  expect(classifyVisibility([sample(noon, true)], ams, noon)).toBe('daylight')
})
it('finds short grazing passes above a high elevation between coarse samples', () => {
  const passes = findPasses({ satrec: built.satrec, observer: ams, startMs, days: 5, minElevationDeg: 50, noradId: 25544 })
  const first = passes.find((p) => Math.abs(p.peakMs - Date.parse('2026-11-09T20:47:09.893Z')) < 2000)
  const second = passes.find((p) => Math.abs(p.peakMs - Date.parse('2026-11-13T19:12:59Z')) < 2000)
  if (!first) throw new Error('Expected first grazing pass')
  expect(first.maxElDeg).toBeCloseTo(50.709, 1)
  expect(first.setMs - first.riseMs).toBeLessThan(30_000)
  if (!second) throw new Error('Expected second grazing pass')
  expect(second.maxElDeg).toBeCloseTo(50.275, 1)
  expect(second.setMs - second.riseMs).toBeLessThan(30_000)
})
it('handles passes in progress and requested-window boundaries', () => {
  const satrec = built.satrec
  const args = { satrec, observer: ams, minElevationDeg: 10, noradId: 25544 }
  const during = Date.parse('2026-11-09T19:10:00Z')
  const current = findPasses({ ...args, startMs: during, days: 10 / 1440 })
  expect(current[0]?.riseMs).toBe(during)
  expect(current[0]?.setMs).toBeLessThan(during + 10 * 60_000)
  const beforeSet = findPasses({ ...args, startMs: during, days: 1 / 1440 })
  expect(beforeSet).toHaveLength(0)
  const endsAfterThreshold = findPasses({ ...args, startMs: during, days: 3.5 / 1440 })
  expect(endsAfterThreshold).toHaveLength(1)
})
