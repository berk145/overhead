'use client'
import { useMemo } from 'react'
import {
  useLivePositions,
  usePropagationStatus,
} from '@/lib/propagation/worker-client'
import { useAppStore } from '@/store'
import type { CatalogResult } from '../lib/use-catalog'
import { searchCatalog, sortCatalog } from '../lib/catalog'
import { SatelliteRow } from './SatelliteRow'

export function TrackedList({
  catalog,
}: {
  catalog: Pick<CatalogResult, 'records' | 'groupOf'>
}) {
  const query = useAppStore((s) => s.searchQuery)
  const frame = useLivePositions()
  const status = usePropagationStatus()
  const indices = useMemo(
    () => new Map(Array.from(frame?.roster ?? [], (id, index) => [id, index])),
    [frame?.roster],
  )
  const sorted = useMemo(
    () => sortCatalog(catalog.records, catalog.groupOf),
    [catalog.records, catalog.groupOf],
  )
  const records = query.trim()
    ? searchCatalog(sorted, query)
    : sorted.slice(0, 2000)
  return (
    <section>
      <h2 className="label-caps flex items-center justify-between px-3 py-3">
        Tracked objects
        <span className="font-mono">
          {catalog.records.length.toLocaleString()}
        </span>
      </h2>
      {status === 'error' && (
        <p className="text-fg-subtle px-3 py-4 text-sm" role="status">
          Live positions unavailable
        </p>
      )}
      <div>
        {records.map((record) => {
          const group = catalog.groupOf.get(record.NORAD_CAT_ID)
          const index = indices.get(record.NORAD_CAT_ID)
          const altitude =
            index === undefined ? undefined : frame?.latLngAlt[index * 3 + 2]
          return group ? (
            <SatelliteRow
              key={record.NORAD_CAT_ID}
              record={record}
              group={group}
              altitudeKm={altitude}
            />
          ) : null
        })}
      </div>
      {!query.trim() && sorted.length > 2000 && (
        <p className="text-fg-subtle px-3 py-4 text-sm">
          Showing first 2,000, use search to find more.
        </p>
      )}
      {query.trim() && !records.length && (
        <p className="text-fg-subtle px-3 py-4 text-sm">No satellites found.</p>
      )}
    </section>
  )
}
