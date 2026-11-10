import { GROUP_ORDER, type GroupId } from '@/lib/propagation/types'
export { GROUP_ORDER } from '@/lib/propagation/types'
import type { OmmRecord } from '../api/schema'
import type { Catalog } from '../types'
export function mergeGroups(
  loaded: Partial<Record<GroupId, OmmRecord[]>>,
  enabled: GroupId[],
): Catalog {
  const byId = new Map<number, OmmRecord>()
  const groupOf = new Map<number, GroupId>()
  const counts: Record<GroupId, number> = {
    stations: 0,
    visual: 0,
    'gps-ops': 0,
    starlink: 0,
    active: 0,
  }
  for (const g of GROUP_ORDER) {
    const recs = loaded[g]
    counts[g] = recs?.length ?? 0
    if (!recs || !enabled.includes(g)) continue
    for (const r of recs)
      if (!byId.has(r.NORAD_CAT_ID)) {
        byId.set(r.NORAD_CAT_ID, r)
        groupOf.set(r.NORAD_CAT_ID, g)
      }
  }
  return { records: [...byId.values()], byId, groupOf, counts }
}
export function sortCatalog(
  records: OmmRecord[],
  groupOf: Map<number, GroupId>,
): OmmRecord[] {
  return records.slice().sort((a, b) => {
    if (a.NORAD_CAT_ID === 25544) return b.NORAD_CAT_ID === 25544 ? 0 : -1
    if (b.NORAD_CAT_ID === 25544) return 1
    const aGroup = groupOf.get(a.NORAD_CAT_ID)
    const bGroup = groupOf.get(b.NORAD_CAT_ID)
    return (
      (aGroup ? GROUP_ORDER.indexOf(aGroup) : GROUP_ORDER.length) -
        (bGroup ? GROUP_ORDER.indexOf(bGroup) : GROUP_ORDER.length) ||
      a.OBJECT_NAME.localeCompare(b.OBJECT_NAME)
    )
  })
}
export function searchCatalog(
  records: OmmRecord[],
  query: string,
  limit = 50,
): OmmRecord[] {
  const q = query.trim().toLowerCase()
  if (!q || limit <= 0) return []
  const asId = /^\d+$/.test(q) ? Number(q) : null
  const exact =
    asId === null ? undefined : records.find((r) => r.NORAD_CAT_ID === asId)
  const out: OmmRecord[] = exact ? [exact] : []
  if (out.length >= limit) return out
  for (const r of records)
    if (r !== exact && r.OBJECT_NAME.toLowerCase().includes(q)) {
      out.push(r)
      if (out.length >= limit) break
    }
  return out
}
