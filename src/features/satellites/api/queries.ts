import { queryOptions } from '@tanstack/react-query'
import type { GroupId } from '@/lib/propagation/types'
import { fetchGpGroup } from './client'
export const gpKeys = {
  all: ['gp'] as const,
  group: (g: GroupId) => ['gp', g] as const,
}
export const gpGroupOptions = (g: GroupId) =>
  queryOptions({
    queryKey: gpKeys.group(g),
    queryFn: ({ signal }) => fetchGpGroup(g, signal),
    staleTime: 6 * 60 * 60_000,
    gcTime: 6 * 60 * 60_000,
    refetchInterval: 6 * 60 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
