import { expect, it } from 'vitest'
import { skyToXY, litRuns, labelSamples } from './sky-dome'
it('maps the sky to a north-up polar plot', () => {
  expect(skyToXY(0, 90, 100, 150, 150)).toEqual({ x: 150, y: 150 })
  expect(skyToXY(0, 0, 100, 150, 150).y).toBe(50)
  expect(skyToXY(90, 0, 100, 150, 150).x).toBe(250)
})
it('joins illuminated and shadowed segments and selects labels', () => {
  const samples = Array.from({ length: 20 }, (_, i) => ({
    tMs: i,
    azDeg: 0,
    elDeg: 10,
    lit: i >= 10,
  }))
  const runs = litRuns(samples)
  expect(runs).toHaveLength(2)
  expect(runs[1]?.samples[0]?.tMs).toBe(9)
  expect(labelSamples(samples, 10, 20).map((s) => s.tMs)).toEqual([0, 10, 19])
  expect(labelSamples(samples, 10, 79)).toHaveLength(5)
  expect(labelSamples(samples, 10).some((s) => s.tMs === 10)).toBe(true)
})
