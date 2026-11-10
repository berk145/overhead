import { jday, sunPos, shadowFraction, type EciVec3 } from 'satellite.js'
import { getPosition } from 'suncalc'
import type { ObserverInput } from './types'
export function satelliteSunlit(eciKm: EciVec3<number>, atMs: number): boolean {
  return shadowFraction(sunPos(jday(new Date(atMs))).rsun, eciKm) < 0.5
}
export const sunAltitudeDeg = (observer: ObserverInput, atMs: number): number => getPosition(new Date(atMs), observer.lat, observer.lon).altitude
export const observerIsDark = (observer: ObserverInput, atMs: number): boolean => sunAltitudeDeg(observer, atMs) < -6
