import { json2satrec, propagate, SatRecError, gstime, eciToGeodetic, degreesLat, degreesLong, eciToEcf, ecfToLookAngles, degreesToRadians, radiansToDegrees, type SatRec, type EciVec3, type GeodeticLocation } from 'satellite.js'
import { normalizeLon } from '../geo'
import type { OmmRecordLike, ObserverInput } from './types'
export type BuiltSatrec = { noradId: number; name: string; satrec: SatRec; epochMs: number; isLeo: boolean }
export function buildSatrec(rec: OmmRecordLike): BuiltSatrec | null {
  try {
    const epochMs = Date.parse(rec.EPOCH.endsWith('Z') ? rec.EPOCH : `${rec.EPOCH}Z`)
    if (Number.isNaN(epochMs)) return null
    const classification = rec.CLASSIFICATION_TYPE === 'U' || rec.CLASSIFICATION_TYPE === 'C' ? rec.CLASSIFICATION_TYPE : undefined
    const satrec = json2satrec({ ...rec, CLASSIFICATION_TYPE: classification })
    return satrec.error === SatRecError.None ? { noradId: rec.NORAD_CAT_ID, name: rec.OBJECT_NAME, satrec, epochMs, isLeo: isLeo(rec) } : null
  } catch { return null }
}
export const elementAgeDays = (epochMs: number, nowMs: number): number => (nowMs - epochMs) / 86_400_000
export type GeoState = { latDeg: number; lonDeg: number; altKm: number; speedKmS: number; eci: EciVec3<number>; gmst: number }
export function propagateGeodetic(satrec: SatRec, atMs: number): GeoState | null {
  const date = new Date(atMs)
  const pv = propagate(satrec, date, { communityDecayCheckEnabled: true })
  if (pv === null) return null
  const gmst = gstime(date), gd = eciToGeodetic(pv.position, gmst)
  return { latDeg: degreesLat(gd.latitude), lonDeg: normalizeLon(degreesLong(gd.longitude)), altKm: gd.height, speedKmS: Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z), eci: pv.position, gmst }
}
export const observerGd = (o: ObserverInput): GeodeticLocation => ({ latitude: degreesToRadians(o.lat), longitude: degreesToRadians(o.lon), height: o.altM / 1000 })
export type Look = { azDeg: number; elDeg: number; rangeKm: number }
export function lookAngles(obs: GeodeticLocation, eci: EciVec3<number>, gmst: number): Look {
  const la = ecfToLookAngles(obs, eciToEcf(eci, gmst))
  return { azDeg: (radiansToDegrees(la.azimuth) + 360) % 360, elDeg: radiansToDegrees(la.elevation), rangeKm: la.rangeSat }
}
export const MU = 398600.4418
export const R_E = 6378.137
export type OrbitalElements = { periodMin: number; semiMajorKm: number; perigeeKm: number; apogeeKm: number; revsPerDay: number; inclinationDeg: number; eccentricity: number }
export function orbitalElements(rec: Pick<OmmRecordLike, 'MEAN_MOTION' | 'ECCENTRICITY' | 'INCLINATION'>): OrbitalElements {
  const periodMin = 1440 / rec.MEAN_MOTION
  const semiMajorKm = Math.cbrt(MU * ((periodMin * 60) / (2 * Math.PI)) ** 2)
  return { periodMin, semiMajorKm, perigeeKm: semiMajorKm * (1 - rec.ECCENTRICITY) - R_E, apogeeKm: semiMajorKm * (1 + rec.ECCENTRICITY) - R_E, revsPerDay: rec.MEAN_MOTION, inclinationDeg: rec.INCLINATION, eccentricity: rec.ECCENTRICITY }
}
export const isLeo = (rec: Pick<OmmRecordLike, 'MEAN_MOTION'>): boolean => rec.MEAN_MOTION >= 6.4
