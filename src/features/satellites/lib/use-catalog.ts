'use client'
import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { GROUP_ORDER, type GroupId } from '@/lib/propagation/types'
import type { OmmRecord } from '../api/schema'
import { gpGroupOptions } from '../api/queries'
import { mergeGroups } from './catalog'
export function useCatalog() {
  const enabled = useAppStore((s) => s.enabledGroups)
  const results = useQueries({
    queries: GROUP_ORDER.map((g) => ({
      ...gpGroupOptions(g),
      enabled: enabled.includes(g),
    })),
  })
  const [stations, visual, gps, starlink, active] = results.map(
    (result) => result.data?.records,
  )
  const loaded = useMemo<Partial<Record<GroupId, OmmRecord[]>>>(
    () => ({ stations, visual, 'gps-ops': gps, starlink, active }),
    [stations, visual, gps, starlink, active],
  )
  const catalog = useMemo(() => mergeGroups(loaded, enabled), [loaded, enabled])
  return {
    ...catalog,
    loaded,
    statuses: GROUP_ORDER.map((group, i) => ({
      group,
      status: results[i]?.status,
      error: results[i]?.error,
      data: results[i]?.data,
      refetch: results[i]?.refetch,
    })),
  }
}
export type CatalogResult = ReturnType<typeof useCatalog>
