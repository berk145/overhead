import { expect, it } from 'vitest'
import { compassPoint, haversineKm, normalizeLon } from './geo'
it('wraps longitude and resolves compass directions', () => {
  expect([190, -190, 180, 0].map(normalizeLon)).toEqual([-170, 170, -180, 0])
  expect([0, 22.5, 348.75, 191.25, -90].map(compassPoint)).toEqual(['N', 'NNE', 'N', 'SSW', 'W'])
  expect(haversineKm(52.37, 4.9, 52.37, 4.9)).toBe(0)
  expect(haversineKm(0, 0, 0, 1)).toBeCloseTo(111.2, 1)
})
