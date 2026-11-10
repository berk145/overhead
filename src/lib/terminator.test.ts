import { expect, it } from 'vitest'
import { geoContains } from 'd3'
import { subsolarPoint, nightPolygon } from './terminator'
import { normalizeLon } from './geo'
it('locates the sun and shades the opposite hemisphere', () => {
  const t = 1794241823000, sun = subsolarPoint(t), polygon = nightPolygon(t)
  expect(sun.latDeg).toBeCloseTo(-16.9913, 1)
  expect(sun.lonDeg).toBeCloseTo(-71.64, 1)
  expect(geoContains(polygon, [sun.lonDeg, sun.latDeg])).toBe(false)
  expect(geoContains(polygon, [normalizeLon(sun.lonDeg + 180), -sun.latDeg])).toBe(true)
})
