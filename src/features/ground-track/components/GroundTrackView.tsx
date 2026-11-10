'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import {
  buildSatrec,
  orbitalElements,
  propagateGeodetic,
} from '@/lib/propagation/satrec'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import { nightPolygon } from '@/lib/terminator'
import { footprintPolygon } from '@/lib/footprint'
import type { OmmRecordLike, ObserverInput } from '@/lib/propagation/types'
import { formatDuration, formatTime } from '@/lib/format'
import { groundTrack } from '../lib/ground-track'
export function GroundTrackView({
  record,
  observer,
}: {
  record: OmmRecordLike | null
  observer: ObserverInput
}) {
  const now = useFrameClock(1)
  const bucket = Math.floor(now / 10_000) * 10_000
  const built = useMemo(() => (record ? buildSatrec(record) : null), [record])
  const period = record ? orbitalElements(record).periodMin : 0
  const lines = useMemo(
    () => (built ? groundTrack(built.satrec, bucket, period) : []),
    [built, bucket, period],
  )
  const pos = built ? propagateGeodetic(built.satrec, now) : null
  const land = useQuery({
    queryKey: ['geo', 'land110'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/geo/land-110m.json', { signal })
      if (!response.ok) throw new Error('Map unavailable')
      const topo: Topology = await response.json()
      const object = topo.objects.land
      if (!object || object.type !== 'GeometryCollection')
        throw new Error('Invalid map')
      return feature(topo, object as GeometryCollection)
    },
    staleTime: Infinity,
  })
  const projection = geoEquirectangular().fitSize([800, 400], {
    type: 'Sphere',
  })
  const path = geoPath(projection)
  const obs = projection([observer.lon, observer.lat])
  const sat = pos && projection([pos.lonDeg, pos.latDeg])
  return (
    <div
      className="border-border bg-bg relative h-full min-h-0 w-full flex-1 overflow-hidden rounded-lg border"
      data-testid="ground-track"
    >
      <svg
        viewBox="0 0 800 400"
        role="img"
        aria-label="World map showing the next three orbits"
        className="absolute inset-0 h-full w-full"
      >
        <title>World map showing the next three orbits</title>
        <path
          d={path({ type: 'Sphere' }) ?? undefined}
          fill="var(--color-surface-2)"
        />
        <path
          d={path(geoGraticule10()) ?? undefined}
          fill="none"
          stroke="var(--color-chart-grid)"
        />
        {land.data && (
          <path
            data-testid="ground-track-land"
            d={path(land.data) ?? undefined}
            fill="var(--color-chart-1)"
            fillOpacity="0.45"
            stroke="var(--color-chart-1)"
            strokeOpacity="0.5"
          />
        )}
        <path
          d={path(nightPolygon(now)) ?? undefined}
          fill="var(--color-night)"
        />
        <path
          d={path(nightPolygon(now)) ?? undefined}
          fill="none"
          stroke="var(--color-fg-subtle)"
          strokeOpacity="0.4"
        />
        {pos && (
          <path
            d={
              path(footprintPolygon(pos.latDeg, pos.lonDeg, pos.altKm)) ??
              undefined
            }
            fill="var(--color-footprint)"
          />
        )}
        {lines.map((line, i) => (
          <path
            key={i}
            d={path(line) ?? undefined}
            fill="none"
            className="stroke-brand-600 dark:stroke-brand-300"
            strokeWidth="2"
            opacity={[1, 0.6, 0.35][i]}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {obs && (
          <circle cx={obs[0]} cy={obs[1]} r="5" fill="var(--color-observer)" />
        )}
        {sat && (
          <circle
            cx={sat[0]}
            cy={sat[1]}
            r="5"
            className="fill-brand-600 dark:fill-brand-300"
          />
        )}
      </svg>
      <div className="text-fg-muted absolute right-2 bottom-2 left-2 flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs">
        <span className="bg-surface-overlay rounded px-1">
          3 orbits · next {formatDuration(period * 3 * 60_000)}
        </span>
        <span className="bg-surface-overlay rounded px-1">
          Terminator · {formatTime(now, { timeZone: 'UTC' })} UTC
        </span>
      </div>
      <span className="sr-only">
        Map showing the observer, the selected satellite and its next three
        orbits, with the night side shaded.
      </span>
    </div>
  )
}
