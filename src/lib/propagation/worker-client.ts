import { startTransition, useSyncExternalStore } from 'react'
import { buildSatrec, isLeo, propagateGeodetic } from './satrec'
import { findPasses } from './pass-search'
import { GROUP_ORDER, type WorkerRequest, type WorkerResponse, type Pass, type GroupId, type SimClock, type ObserverInput, type OmmRecordLike } from './types'
export type Frame = { roster: Int32Array; groupIndex: Uint8Array; latLngAlt: Float32Array; simTimeMs: number }
type PassArgs = { noradId: number; observer: ObserverInput; startMs: number; days: number; minElevationDeg: number }
type PassResult = { passes: Pass[]; error?: 'not-loaded' | 'decayed' | 'not-leo' }
type Pending = { args: PassArgs; resolve: (result: PassResult) => void; timeout: ReturnType<typeof setTimeout> }
export class PropagationClient {
  private worker: Worker | null = null
  private failed = false
  private frame: Frame | null = null
  private roster: Int32Array = new Int32Array(0)
  private groupIndex: Uint8Array = new Uint8Array(0)
  private groups = new Map<GroupId, OmmRecordLike[]>()
  private listeners = new Set<() => void>()
  private pending = new Map<number, Pending>()
  private nextId = 1
  private timeout: ReturnType<typeof setTimeout> | null = null
  private ensure(): Worker | null {
    if (this.failed) return null
    if (this.worker) return this.worker
    try {
      this.worker = new Worker(new URL('./propagate.worker.ts', import.meta.url))
      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => this.onMessage(e.data)
      this.worker.onerror = () => this.fail()
      this.worker.onmessageerror = () => this.fail()
      return this.worker
    } catch { this.fail(); return null }
  }
  private fail() {
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = null; this.failed = true; this.worker?.terminate(); this.worker = null; this.frame = null
    for (const pending of this.pending.values()) { clearTimeout(pending.timeout); this.fallback(pending) }
    this.pending.clear(); this.emit()
  }
  private fallback({ args, resolve }: Pick<Pending, 'args' | 'resolve'>) {
    startTransition(() => {
      const rec = GROUP_ORDER.flatMap((g) => this.groups.get(g) ?? []).find((r) => r.NORAD_CAT_ID === args.noradId)
      if (!rec) return resolve({ passes: [], error: 'not-loaded' })
      if (!isLeo(rec)) return resolve({ passes: [], error: 'not-leo' })
      const built = buildSatrec(rec)
      if (!built || !propagateGeodetic(built.satrec, args.startMs)) return resolve({ passes: [], error: 'decayed' })
      resolve({ passes: findPasses({ ...args, satrec: built.satrec }) })
    })
  }
  private onMessage(m: WorkerResponse) {
    switch (m.type) {
      case 'roster':
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = null; this.roster = m.ids; this.groupIndex = m.groupIndex; this.frame = null; this.emit(); break
      case 'positions':
        if (m.latLngAlt.length !== this.roster.length * 3) return
        this.frame = { roster: this.roster, groupIndex: this.groupIndex, latLngAlt: m.latLngAlt, simTimeMs: m.simTimeMs }; this.emit(); break
      case 'passes': { const pending = this.pending.get(m.requestId); if (pending) { clearTimeout(pending.timeout); pending.resolve({ passes: m.passes, error: m.error }); this.pending.delete(m.requestId) } break }
      case 'loaded': break
    }
  }
  private emit() { for (const listener of this.listeners) listener() }
  private send(msg: WorkerRequest) { try { this.ensure()?.postMessage(msg) } catch { this.fail() } }
  load(group: GroupId, records: OmmRecordLike[]) {
    this.groups.set(group, records)
    if (!this.failed && !this.timeout) this.timeout = setTimeout(() => this.fail(), 5000)
    this.send({ type: 'load', group, records })
  }
  unload(group: GroupId) { this.groups.delete(group); this.send({ type: 'unload', group }) }
  setClock(clock: SimClock) { this.send({ type: 'setClock', clock }) }
  predictPasses(args: PassArgs): Promise<PassResult> {
    return new Promise((resolve) => {
      if (this.failed) return this.fallback({ args, resolve })
      const requestId = this.nextId++
      const timeout = setTimeout(() => this.fail(), 5000)
      this.pending.set(requestId, { args, resolve, timeout }); this.send({ type: 'predictPasses', requestId, ...args })
    })
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  getFrame = () => this.frame
  getStatus = () => { if (this.failed) return 'error'; if (this.frame) return 'live'; return 'loading' }
}
export const propagationClient = new PropagationClient()
export const useLivePositions = () => useSyncExternalStore(propagationClient.subscribe, propagationClient.getFrame, () => null)

export const usePropagationStatus = () => useSyncExternalStore(propagationClient.subscribe, propagationClient.getStatus, () => 'loading')
