'use client'
import { useMemo } from 'react'
import { buildSatrec } from '@/lib/propagation/satrec'
import type { OmmRecord } from '../api/schema'

export function useSelectedSatellite(record: OmmRecord | null | undefined) {
  return useMemo(() => (record ? buildSatrec(record) : null), [record])
}
