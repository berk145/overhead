import { gpResponseSchema, type GpGroup } from './schema'
import type { GroupId } from '@/lib/propagation/types'
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
export async function fetchGpGroup(
  group: GroupId,
  signal?: AbortSignal,
): Promise<GpGroup> {
  const res = await fetch(`/api/gp/${group}`, { signal })
  if (!res.ok) throw new ApiError(res.status, `Catalog ${res.status}`)
  return gpResponseSchema.parse(await res.json())
}
