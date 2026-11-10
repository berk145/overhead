import { gpGroupSchema, type GpGroup } from './schema'
import type { GroupId } from '@/lib/propagation/types'

const SIX_HOURS = 6 * 60 * 60_000
const FAILURE_DELAY = 5 * 60_000
const cache = new Map<GroupId, { data: GpGroup; fetchedAt: number }>()
const pending = new Map<GroupId, Promise<GpGroup>>()
const failedUntil = new Map<GroupId, number>()
let celestrakStopped = false
let fallbackQueue: Promise<unknown> = Promise.resolve()

async function request(
  url: string,
  source: GpGroup['source'],
): Promise<GpGroup> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    cache: 'no-store',
    redirect: 'manual',
  })
  if (!response.ok) {
    if (source === 'CelesTrak') celestrakStopped = true
    throw new Error(`${source} returned ${response.status}`)
  }
  const records = gpGroupSchema.min(1).parse(await response.json())
  const timestamp =
    response.headers.get('last-modified') ?? response.headers.get('date')
  const updatedAt = timestamp ? Date.parse(timestamp) : NaN
  if (!Number.isFinite(updatedAt))
    throw new Error(`${source} did not provide a valid update time`)
  return { records, source, updatedAt, stale: false }
}

async function fetchGroup(group: GroupId): Promise<GpGroup> {
  try {
    return await request(
      `https://retlector.eu/${group}/json`,
      'CelesTrak via ReTLEctor',
    )
  } catch {
    const fallback = fallbackQueue.then(() => {
      if (celestrakStopped)
        throw new Error('CelesTrak requests stopped after an upstream error')
      return request(
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`,
        'CelesTrak',
      )
    })
    fallbackQueue = fallback.catch(() => {})
    return fallback
  }
}

export function getGpGroup(group: GroupId): Promise<GpGroup> {
  const cached = cache.get(group)
  if (cached && Date.now() - cached.fetchedAt < SIX_HOURS)
    return Promise.resolve(cached.data)
  const existing = pending.get(group)
  if (existing) return existing
  if ((failedUntil.get(group) ?? 0) > Date.now()) {
    return cached
      ? Promise.resolve({ ...cached.data, stale: true })
      : Promise.reject(new Error('Catalog temporarily unavailable'))
  }
  const loading = fetchGroup(group)
    .then((data) => {
      cache.set(group, { data, fetchedAt: Date.now() })
      failedUntil.delete(group)
      return data
    })
    .catch((error: unknown) => {
      failedUntil.set(group, Date.now() + FAILURE_DELAY)
      if (cached) return { ...cached.data, stale: true }
      throw error
    })
    .finally(() => pending.delete(group))
  pending.set(group, loading)
  return loading
}
