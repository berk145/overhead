import { expect, it } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import visual from '@/test/fixtures/gp-visual.json'
import gps from '@/test/fixtures/gp-gps-ops.json'
import { gpGroupSchema } from './schema'
it('accepts real catalog responses and rejects malformed data', () => {
  for (const fixture of [stations, visual, gps])
    expect(gpGroupSchema.safeParse(fixture).success).toBe(true)
  expect(gpGroupSchema.safeParse('Invalid query').success).toBe(false)
  expect(
    gpGroupSchema.safeParse([{ ...stations[0], ECCENTRICITY: 1.2 }]).success,
  ).toBe(false)
})
