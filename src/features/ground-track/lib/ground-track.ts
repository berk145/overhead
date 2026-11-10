import type { LineString } from 'geojson'
import type { SatRec } from 'satellite.js'
import { propagateGeodetic } from '@/lib/propagation/satrec'
export function groundTrack(
  satrec: SatRec,
  startMs: number,
  periodMin: number,
): LineString[] {
  const period = periodMin * 60_000
  return Array.from({ length: 3 }, (_, orbit): LineString => {
    const start = startMs + orbit * period
    const end = startMs + (orbit + 1) * period
    const coordinates: number[][] = []
    for (let time = start; time < end; time += 30_000) {
      const position = propagateGeodetic(satrec, time)
      if (position) coordinates.push([position.lonDeg, position.latDeg])
    }
    const last = propagateGeodetic(satrec, end)
    if (last) coordinates.push([last.lonDeg, last.latDeg])
    return { type: 'LineString', coordinates }
  }).filter((line) => line.coordinates.length > 1)
}
