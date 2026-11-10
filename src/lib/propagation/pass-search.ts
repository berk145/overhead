import type { SatRec } from 'satellite.js'
import { lookAngles, observerGd, propagateGeodetic } from './satrec'
import { satelliteSunlit, observerIsDark } from './illumination'
import type { ObserverInput, Pass, PassSample } from './types'
const COARSE_MS = 30_000, SAMPLE_MS = 10_000, REFINE_MS = 1_000, GOLDEN = (Math.sqrt(5) - 1) / 2
export type PassSearchInput = { satrec: SatRec; observer: ObserverInput; startMs: number; days: number; minElevationDeg: number; noradId: number }
export function bisect(f: (ms: number) => number, lo: number, hi: number, target: number): number {
  let a = lo, b = hi
  const fa = f(a) - target
  while (b - a > REFINE_MS) { const m = (a + b) / 2; if ((f(m) - target < 0) === (fa < 0)) a = m; else b = m }
  return Math.round((a + b) / 2)
}
export function goldenMax(f: (ms: number) => number, a0: number, b0: number): number {
  let a = a0, b = b0, c = b - GOLDEN * (b - a), d = a + GOLDEN * (b - a), fc = f(c), fd = f(d)
  while (b - a > REFINE_MS) {
    if (fc > fd) { b = d; d = c; fd = fc; c = b - GOLDEN * (b - a); fc = f(c) }
    else { a = c; c = d; fc = fd; d = a + GOLDEN * (b - a); fd = f(d) }
  }
  return Math.round((a + b) / 2)
}
export function classifyVisibility(samples: PassSample[], observer: ObserverInput, peakMs: number): Pass['visibility'] {
  if (samples.some((s) => s.lit && observerIsDark(observer, s.tMs))) return 'visible'
  return observerIsDark(observer, peakMs) ? 'shadow' : 'daylight'
}
export function findPasses(input: PassSearchInput): Pass[] {
  const { satrec, observer, startMs, days, minElevationDeg: minEl, noradId } = input
  const obs = observerGd(observer), endMs = startMs + days * 86_400_000
  const elAt = (ms: number): number => { const g = propagateGeodetic(satrec, ms); return g ? lookAngles(obs, g.eci, g.gmst).elDeg : -90 }
  const passes: Pass[] = []
  const addPass = (horizonRise: number, horizonSet: number) => {
    const peakMs = goldenMax(elAt, horizonRise, horizonSet)
    if (elAt(peakMs) < minEl) return
    const riseMs = elAt(horizonRise) >= minEl || minEl === 0 ? horizonRise : bisect(elAt, horizonRise, peakMs, minEl)
    const setMs = minEl === 0 ? horizonSet : bisect(elAt, peakMs, horizonSet, minEl)
    const times = new Set([riseMs, peakMs, setMs])
    for (let t = riseMs + SAMPLE_MS; t < setMs; t += SAMPLE_MS) times.add(t)
    const samples = [...times].sort((a, b) => a - b).map((tMs): PassSample => {
      const g = propagateGeodetic(satrec, tMs)
      if (!g) return { tMs, azDeg: 0, elDeg: -90, lit: false }
      const look = lookAngles(obs, g.eci, g.gmst)
      return { tMs, azDeg: look.azDeg, elDeg: look.elDeg, lit: satelliteSunlit(g.eci, tMs) }
    })
    const at = (ms: number) => { const sample = samples.find((s) => s.tMs === ms); if (!sample) throw new Error(`Missing pass sample at ${ms}`); return sample }
    passes.push({ noradId, riseMs, peakMs, setMs, riseAzDeg: at(riseMs).azDeg, peakAzDeg: at(peakMs).azDeg, setAzDeg: at(setMs).azDeg, maxElDeg: at(peakMs).elDeg, visibility: classifyVisibility(samples, observer, peakMs), samples })
  }
  let prevMs = startMs, prevEl = elAt(startMs), horizonRise: number | null = prevEl >= 0 ? startMs : null
  while (prevMs < endMs) {
    const ms = Math.min(prevMs + COARSE_MS, endMs), el = elAt(ms)
    if (horizonRise === null && prevEl < 0 && el >= 0) horizonRise = bisect(elAt, prevMs, ms, 0)
    else if (horizonRise !== null && prevEl >= 0 && el < 0) {
      addPass(horizonRise, bisect(elAt, prevMs, ms, 0))
      horizonRise = null
    }
    prevMs = ms; prevEl = el
  }
  if (horizonRise !== null && prevEl < minEl) addPass(horizonRise, endMs)
  return passes
}
