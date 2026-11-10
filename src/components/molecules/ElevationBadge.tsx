import { cn } from '@/lib/utils'
export function ElevationBadge({
  elevationDeg,
  selected = false,
}: {
  elevationDeg: number
  selected?: boolean
}) {
  return (
    <span
      className={cn(
        'bg-surface-2 flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-current text-sm font-bold tabular-nums',
        elevationDeg >= 50 && 'text-el-high',
        elevationDeg >= 25 && elevationDeg < 50 && 'text-el-mid',
        elevationDeg < 25 && 'text-el-low',
        selected && 'ring-2 ring-current/30',
      )}
    >
      {Math.round(elevationDeg)}°
    </span>
  )
}
