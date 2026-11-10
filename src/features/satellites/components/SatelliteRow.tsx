'use client'
import { cn } from '@/lib/utils'
import { formatDegrees, formatDistance } from '@/lib/format'
import type { GroupId } from '@/lib/propagation/types'
import { useAppStore } from '@/store'
import type { OmmRecord } from '../api/schema'
const colors: Record<GroupId, string> = {
  stations: 'bg-group-stations',
  visual: 'bg-group-visual',
  starlink: 'bg-group-starlink',
  'gps-ops': 'bg-group-gps',
  active: 'bg-group-active',
}
export function SatelliteRow({
  record,
  group,
  altitudeKm,
}: {
  record: OmmRecord
  group: GroupId
  altitudeKm?: number
}) {
  const selected = useAppStore((s) => s.selectedNoradId === record.NORAD_CAT_ID)
  const select = useAppStore((s) => s.selectSatellite)
  const handleSelect = () => select(record.NORAD_CAT_ID)
  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={selected}
      className={cn(
        'flex min-h-14 w-full items-center gap-3 border-l-2 px-3 text-left',
        selected
          ? 'border-accent bg-accent-soft'
          : 'hover:bg-surface-hover border-transparent',
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', colors[group])} />
      <span className="min-w-0 flex-1">
        <span className="text-md block truncate font-semibold">
          {record.OBJECT_NAME}
        </span>
        <span className="text-fg-subtle text-2xs">
          NORAD <span className="font-mono">{record.NORAD_CAT_ID}</span>
        </span>
      </span>
      <span className="text-fg-muted text-2xs text-right font-mono">
        <span className="block">
          {altitudeKm !== undefined && Number.isFinite(altitudeKm)
            ? formatDistance(altitudeKm)
            : '–'}
        </span>
        <span>{formatDegrees(record.INCLINATION, 1)}</span>
      </span>
    </button>
  )
}
