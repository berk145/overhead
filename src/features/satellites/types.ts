import type { GroupId } from '@/lib/propagation/types'
import type { OmmRecord } from './api/schema'
export type Catalog = {
  records: OmmRecord[]
  byId: Map<number, OmmRecord>
  groupOf: Map<number, GroupId>
  counts: Record<GroupId, number>
}
