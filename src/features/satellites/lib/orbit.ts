import type { SatRec } from 'satellite.js'
import { propagateGeodetic } from '@/lib/propagation/satrec'

export function orbitPath(satrec: SatRec, startMs: number, periodMin: number) {
  const points: { lat: number; lng: number; alt: number }[] = []
  for (let i = 0; i < 120; i++) {
    const position = propagateGeodetic(
      satrec,
      startMs + (i * periodMin * 60_000) / 120,
    )
    if (position)
      points.push({
        lat: position.latDeg,
        lng: position.lonDeg,
        alt: position.altKm / 6371,
      })
  }
  return points
}
