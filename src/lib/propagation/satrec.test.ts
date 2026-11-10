import { expect, it } from 'vitest'
import { ecfToEci, geodeticToEcf } from 'satellite.js'
import stations from '@/test/fixtures/gp-stations.json'
import gpsOps from '@/test/fixtures/gp-gps-ops.json'
import type { OmmRecordLike } from './types'
import { buildSatrec, elementAgeDays, isLeo, lookAngles, observerGd, orbitalElements, propagateGeodetic } from './satrec'
const iss = stations.find((r) => r.NORAD_CAT_ID === 25544) as OmmRecordLike | undefined
if (!iss) throw new Error('ISS fixture missing')
it('builds and propagates the ISS and rejects an invalid epoch', () => {
  const built = buildSatrec(iss)
  if (!built) throw new Error('ISS fixture is invalid')
  expect(built.satrec.inclo * 180 / Math.PI).toBeCloseTo(51.6321, 4)
  expect(buildSatrec({ ...iss, EPOCH: 'bad' })).toBeNull()
  expect(elementAgeDays(0, 216_000_000)).toBe(2.5)
  const g = propagateGeodetic(built.satrec, 1794241823000)
  if (!g) throw new Error('ISS propagation failed')
  expect(Math.abs(g.latDeg - 15.018)).toBeLessThan(.3)
  expect(Math.abs(g.lonDeg - 171.423)).toBeLessThan(.3)
  expect(g.altKm).toBeCloseTo(423.2, -1)
  const look = lookAngles(observerGd({ lat: 52.37, lon: 4.9, altM: 3 }), g.eci, g.gmst)
  expect(look.elDeg).toBeCloseTo(-54.45, 1)
})
it('computes zenith and orbital elements', () => {
  const obs = observerGd({ lat: 52.37, lon: 4.9, altM: 0 })
  expect(lookAngles(obs, ecfToEci(geodeticToEcf({ ...obs, height: 400 }), 0), 0).elDeg).toBeCloseTo(90, 3)
  const el = orbitalElements(iss)
  expect(el.periodMin).toBeCloseTo(92.947, 2)
  expect(el.perigeeKm).toBeCloseTo(413.9, 0)
  expect(isLeo(iss)).toBe(true)
  const gps = gpsOps[0]
  if (!gps) throw new Error('GPS fixture missing')
  expect(isLeo(gps)).toBe(false)
})
