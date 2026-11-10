'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import {
  propagationClient,
  useLivePositions,
  usePropagationStatus,
} from '@/lib/propagation/worker-client'
import type { BuiltSatrec } from '@/lib/propagation/satrec'
import type { OmmRecordLike } from '@/lib/propagation/types'
export function usePasses(
  record: OmmRecordLike | null,
  built: BuiltSatrec | null,
) {
  const observer = useAppStore((s) => s.observer)
  const minElevationDeg = useAppStore((s) => s.minElevationDeg)
  const days = useAppStore((s) => s.days)
  const now = useFrameClock(1)
  const frame = useLivePositions()
  const status = usePropagationStatus()
  const noradId = record?.NORAD_CAT_ID ?? null
  const loaded =
    noradId !== null && (frame?.roster.includes(noradId) || status === 'error')
  const startMs = Math.floor(now / 3_600_000) * 3_600_000
  const query = useQuery({
    queryKey: [
      'passes',
      noradId,
      record?.EPOCH,
      observer.lat,
      observer.lon,
      observer.altM,
      minElevationDeg,
      days,
      startMs,
    ],
    enabled: !!record && (!built || loaded),
    staleTime: Infinity,
    gcTime: 3_600_000,
    queryFn: () => {
      if (noradId === null) throw new Error('No satellite selected')
      if (!built) return { passes: [], error: 'decayed' as const }
      return propagationClient.predictPasses({
        noradId,
        observer,
        startMs,
        // shortcut: LEO-only padding, revisit if longer-period pass prediction is supported.
        days: days + 4 / 24,
        minElevationDeg,
      })
    },
  })
  const data = useMemo(
    () =>
      query.data && {
        ...query.data,
        passes: query.data.passes.filter(
          (pass) => pass.setMs > now && pass.riseMs < now + days * 86_400_000,
        ),
      },
    [query.data, now, days],
  )
  return { ...query, data }
}
