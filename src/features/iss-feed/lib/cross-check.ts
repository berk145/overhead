import { haversineKm } from '@/lib/geo'
import type { IssPosition } from '../api/schema'
export function crossCheck(
  ours: { latDeg: number; lonDeg: number; altKm: number; speedKmS: number },
  theirs: IssPosition,
  nowMs: number,
) {
  return {
    groundKm: haversineKm(
      ours.latDeg,
      ours.lonDeg,
      theirs.latitude,
      theirs.longitude,
    ),
    altKm: ours.altKm - theirs.altitude,
    speedKmS: ours.speedKmS - theirs.velocity / 3600,
    ageS: Math.max(0, (nowMs - theirs.timestamp * 1000) / 1000),
  }
}
