import { buildSatrec, propagateGeodetic, type BuiltSatrec } from './satrec'
import { findPasses } from './pass-search'
import { realTime, simNow } from './sim-clock'
import { GROUP_ORDER, type GroupId, type WorkerRequest, type WorkerResponse } from './types'
const groups = new Map<GroupId, BuiltSatrec[]>()
let roster: BuiltSatrec[] = [], clock = realTime(), timer: ReturnType<typeof setInterval> | null = null, intervalMs = 1000
const post = (msg: WorkerResponse, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(msg, transfer)
function rebuildRoster() {
  const seen = new Set<number>(), next: BuiltSatrec[] = [], indexes: number[] = []
  for (const [i, group] of GROUP_ORDER.entries()) { for (const sat of groups.get(group) ?? []) if (!seen.has(sat.noradId)) { seen.add(sat.noradId); next.push(sat); indexes.push(i) } }
  roster = next
  const ids = Int32Array.from(roster.map((s) => s.noradId)), groupIndex = Uint8Array.from(indexes)
  post({ type: 'roster', ids, groupIndex }, [ids.buffer, groupIndex.buffer])
  if (roster.length && timer === null) { timer = setInterval(tick, intervalMs); tick() }
  if (!roster.length && timer !== null) { clearInterval(timer); timer = null }
}
function tick() {
  const started = performance.now()
  const simTimeMs = simNow(clock), out = new Float32Array(roster.length * 3)
  for (const [i, sat] of roster.entries()) {
    const g = propagateGeodetic(sat.satrec, simTimeMs), o = i * 3
    out[o] = g?.latDeg ?? NaN; out[o + 1] = g?.lonDeg ?? NaN; out[o + 2] = g?.altKm ?? NaN
  }
  post({ type: 'positions', simTimeMs, latLngAlt: out }, [out.buffer])
  if (performance.now() - started > 800 && intervalMs === 1000 && timer !== null) {
    clearInterval(timer); intervalMs = 2000; timer = setInterval(tick, intervalMs)
  }
}
self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const m = e.data
  switch (m.type) {
    case 'load': {
      const built: BuiltSatrec[] = [], rejectedIds: number[] = []
      for (const r of m.records) { const b = buildSatrec(r); if (b) built.push(b); else rejectedIds.push(r.NORAD_CAT_ID) }
      groups.set(m.group, built); post({ type: 'loaded', group: m.group, count: built.length, rejectedIds }); rebuildRoster(); break
    }
    case 'unload': groups.delete(m.group); rebuildRoster(); break
    case 'setClock': clock = m.clock; break
    case 'predictPasses': {
      const s = roster.find((x) => x.noradId === m.noradId)
      let error: 'not-loaded' | 'not-leo' | 'decayed' | undefined
      if (!s) error = 'not-loaded'
      else if (!s.isLeo) error = 'not-leo'
      else if (!propagateGeodetic(s.satrec, m.startMs)) error = 'decayed'
      const passes = s && !error ? findPasses({ ...m, satrec: s.satrec }) : []
      post({ type: 'passes', requestId: m.requestId, noradId: m.noradId, passes, error }); break
    }
  }
}
