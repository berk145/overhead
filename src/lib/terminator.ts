import { geoCircle } from 'd3'
import { gstime, jday, sunPos, radiansToDegrees } from 'satellite.js'
import type { Polygon } from 'geojson'
import { normalizeLon } from './geo'
export type SubsolarPoint = { latDeg: number; lonDeg: number }
export function subsolarPoint(atMs: number): SubsolarPoint {
  const date = new Date(atMs), { rtasc, decl } = sunPos(jday(date))
  return { latDeg: radiansToDegrees(decl), lonDeg: normalizeLon(radiansToDegrees(rtasc - gstime(date))) }
}
export function nightPolygon(atMs: number): Polygon {
  const sun = subsolarPoint(atMs)
  return geoCircle().center([normalizeLon(sun.lonDeg + 180), -sun.latDeg]).radius(90).precision(2)()
}
