import { geoCircle } from 'd3'
import type { Polygon } from 'geojson'
import { R_E } from './propagation/satrec'
export const footprintRadiusDeg = (altKm: number): number => Math.acos(R_E / (R_E + altKm)) * 180 / Math.PI
export const footprintRadiusKm = (altKm: number): number => 6371 * Math.acos(R_E / (R_E + altKm))
export const footprintPolygon = (latDeg: number, lonDeg: number, altKm: number): Polygon => geoCircle().center([lonDeg, latDeg]).radius(footprintRadiusDeg(altKm)).precision(2)()
