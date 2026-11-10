import type { PassSample } from '@/lib/propagation/types'
export function skyToXY(
  azDeg: number,
  elDeg: number,
  radius: number,
  cx: number,
  cy: number,
) {
  const r = ((90 - Math.max(0, Math.min(90, elDeg))) / 90) * radius
  const az = (azDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(az), y: cy - r * Math.cos(az) }
}
export function litRuns(samples: PassSample[]) {
  const runs: { lit: boolean; samples: PassSample[] }[] = []
  for (const sample of samples) {
    const last = runs.at(-1)
    if (last?.lit === sample.lit) last.samples.push(sample)
    else {
      const previous = last?.samples.at(-1)
      runs.push({
        lit: sample.lit,
        samples: previous ? [previous, sample] : [sample],
      })
    }
  }
  return runs
}
export function labelSamples(
  samples: PassSample[],
  peakMs: number,
  maxElDeg = 90,
) {
  if (samples.length <= 3) return samples
  const indices = [
    0,
    Math.floor(samples.length / 4),
    samples.findIndex((s) => s.tMs === peakMs),
    Math.floor((3 * samples.length) / 4),
    samples.length - 1,
  ]
  if (indices[2] === -1) indices[2] = Math.floor(samples.length / 2)
  if (maxElDeg < 35) {
    indices.splice(3, 1)
    indices.splice(1, 1)
  }
  return [...new Set(indices)]
    .sort((a, b) => a - b)
    .flatMap((i) => (samples[i] ? [samples[i]] : []))
}
