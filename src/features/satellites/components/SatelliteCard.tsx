'use client'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import {
  formatCoord,
  formatDegrees,
  formatDistance,
  formatNumber,
  formatRelativeTime,
} from '@/lib/format'
import {
  elementAgeDays,
  orbitalElements,
  propagateGeodetic,
} from '@/lib/propagation/satrec'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import { KeyValueTile } from '@/components/molecules/KeyValueTile'
import { StatTile } from '@/components/molecules/StatTile'
import type { GroupId } from '@/lib/propagation/types'
import type { OmmRecord } from '../api/schema'
import { useSelectedSatellite } from '../lib/use-selected-satellite'

const labels: Record<GroupId, string> = {
  stations: 'Stations',
  visual: 'Visual',
  starlink: 'Starlink',
  'gps-ops': 'GPS operational',
  active: 'Active',
}

export function SatelliteCard({
  record,
  issCrossCheck,
  group,
}: {
  record: OmmRecord
  group?: GroupId
  issCrossCheck?: ReactNode
}) {
  const satellite = useSelectedSatellite(record)
  const now = useFrameClock(4)
  const position = satellite && propagateGeodetic(satellite.satrec, now)
  const elements = orbitalElements(record)
  const ageDays = satellite ? elementAgeDays(satellite.epochMs, now) : 0
  const old = ageDays > 7
  return (
    <section
      className="space-y-4 p-4 lg:space-y-1.5 lg:p-3"
      aria-label="Selected satellite"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-accent-soft text-brand-600 dark:text-brand-300 flex size-10 shrink-0 items-center justify-center rounded-xl"
        >
          ✦
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold tracking-tight">
            {record.OBJECT_NAME}
          </h2>
          <p className="text-fg-subtle mt-1 text-xs">
            NORAD{' '}
            <span className="text-fg-muted font-mono">
              {record.NORAD_CAT_ID}
            </span>{' '}
            ·{' '}
            <span className="text-fg-muted font-mono">{record.OBJECT_ID}</span>
            {group && ` · ${labels[group]}`}
          </p>
        </div>
      </div>
      {position ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:gap-2">
            <StatTile
              label="Altitude"
              value={formatNumber(position.altKm, 1)}
              unit="km"
            />
            <StatTile
              label="Velocity"
              value={formatNumber(position.speedKmS, 2)}
              unit="km/s"
            />
          </div>
          <p className="text-fg-muted font-mono text-xs">
            {formatCoord(position.latDeg, position.lonDeg)}
          </p>
        </>
      ) : (
        <p className="text-fg-muted text-sm">
          No position (decayed or invalid elements)
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <KeyValueTile
          label="Inclination"
          value={formatDegrees(elements.inclinationDeg)}
        />
        <KeyValueTile
          label="Period"
          value={`${formatNumber(elements.periodMin, 2)} min`}
        />
        <KeyValueTile
          label="Eccentricity"
          value={formatNumber(elements.eccentricity, 5)}
        />
        <KeyValueTile
          label="Perigee"
          value={formatDistance(elements.perigeeKm)}
        />
        <KeyValueTile
          label="Apogee"
          value={formatDistance(elements.apogeeKm)}
        />
        <KeyValueTile
          label="Revs/day"
          value={formatNumber(elements.revsPerDay, 2)}
        />
      </div>
      <p
        className={cn(
          'text-xs',
          old ? 'text-warning-600 dark:text-warning-500' : 'text-fg-subtle',
        )}
      >
        Elements from{' '}
        <span className="font-mono">
          {satellite
            ? new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'UTC',
              }).format(satellite.epochMs)
            : record.EPOCH}
        </span>{' '}
        UTC{satellite && ` (${formatRelativeTime(satellite.epochMs, now)})`}
        {ageDays > 30 &&
          ' · Elements are over 30 days old; predictions may be unreliable.'}
      </p>
      {record.NORAD_CAT_ID === 25544 && issCrossCheck}
    </section>
  )
}
