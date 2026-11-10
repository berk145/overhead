import { expect, it } from 'vitest'
import { geoContains } from 'd3'
import { footprintRadiusKm, footprintRadiusDeg, footprintPolygon } from './footprint'
it('covers the subpoint at the expected ISS radius', () => {
  expect(footprintRadiusKm(423)).toBeCloseTo(2300, -2)
  expect(footprintRadiusDeg(423)).toBeCloseTo(20.7, 0)
  expect(geoContains(footprintPolygon(52, 4, 423), [4, 52])).toBe(true)
})
