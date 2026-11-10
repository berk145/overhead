import { expect, it } from 'vitest'
import stations from '@/test/fixtures/gp-stations.json'
import {
  buildSatrec,
  orbitalElements,
  propagateGeodetic,
} from '@/lib/propagation/satrec'
import { gpGroupSchema } from '../api/schema'
import { orbitPath } from './orbit'

it('samples the ISS orbit from the current position for one period', () => {
  const iss = gpGroupSchema
    .parse(stations)
    .find((record) => record.NORAD_CAT_ID === 25544)
  expect(iss).toBeDefined()
  if (!iss) throw new Error('ISS fixture missing')
  const built = buildSatrec(iss)
  expect(built).not.toBeNull()
  if (!built) throw new Error('ISS elements invalid')
  const points = orbitPath(
    built.satrec,
    built.epochMs,
    orbitalElements(iss).periodMin,
  )
  const first = propagateGeodetic(built.satrec, built.epochMs)
  expect(points).toHaveLength(120)
  expect(points[0]).toEqual({
    lat: first?.latDeg,
    lng: first?.lonDeg,
    alt: (first?.altKm ?? 0) / 6371,
  })
  for (const point of points) {
    expect(point.alt).toBeGreaterThan(0.05)
    expect(point.alt).toBeLessThan(0.08)
  }
})
