'use client'
import { MarkerPin01 } from '@untitledui/icons'
import { useAppStore } from '@/store'
import { formatCoord, formatNumber } from '@/lib/format'
import { LocationDialog } from './LocationDialog'
export function LocationPill() {
  const observer = useAppStore((s) => s.observer)
  const open = useAppStore((s) => s.locationDialogOpen)
  const setOpen = useAppStore((s) => s.setLocationDialogOpen)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border bg-surface text-fg-muted inline-flex min-h-10 w-full max-w-full items-center gap-1.5 rounded-lg border px-3 py-2 text-xs sm:w-auto"
      >
        <MarkerPin01 aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="text-fg block truncate font-medium sm:inline">
          {observer.label}
        </span>
        <span className="hidden font-mono sm:inline">
          {' '}
          · {formatCoord(observer.lat, observer.lon)} ·{' '}
          {formatNumber(observer.altM)} m
        </span>
      </button>
      <LocationDialog
        key={`${observer.lat}:${observer.lon}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
