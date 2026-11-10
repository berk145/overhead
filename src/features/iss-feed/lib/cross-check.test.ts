import { expect, it } from 'vitest'
import fixture from '@/test/fixtures/iss-live.json'
import { crossCheck } from './cross-check'
it('compares ground, altitude, speed and age in the correct units', () => {
  const result = crossCheck(
    {
      latDeg: fixture.latitude,
      lonDeg: fixture.longitude,
      altKm: fixture.altitude + 1,
      speedKmS: fixture.velocity / 3600,
    },
    fixture,
    fixture.timestamp * 1000 + 3000,
  )
  expect(result.groundKm).toBe(0)
  expect(result.altKm).toBeCloseTo(1)
  expect(result.speedKmS).toBeCloseTo(0)
  expect(result.ageS).toBe(3)
})
