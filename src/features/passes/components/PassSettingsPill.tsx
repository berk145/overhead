'use client'
import { Settings01 } from '@untitledui/icons'
import { useState } from 'react'
import { useAppStore } from '@/store'
export function PassSettingsPill() {
  const [open, setOpen] = useState(false)
  const days = useAppStore((s) => s.days)
  const min = useAppStore((s) => s.minElevationDeg)
  const setMin = useAppStore((s) => s.setMinElevationDeg)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="border-border bg-surface text-fg-muted inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs"
      >
        <Settings01 aria-hidden="true" className="size-3.5" />
        Next {days} days · min elevation {min}°
      </button>
      {open && (
        <div className="border-border bg-surface shadow-popover absolute top-full left-0 z-20 mt-2 rounded-lg border p-4">
          <label className="text-sm">
            Minimum elevation{' '}
            <input
              aria-label="Minimum elevation"
              className="border-border-strong bg-surface-2 ml-2 min-h-10 w-16 rounded border p-1"
              type="number"
              min={0}
              max={60}
              step={5}
              value={min}
              onChange={(e) => {
                if (e.target.value !== '') setMin(Number(e.target.value))
              }}
            />
            °
          </label>
        </div>
      )}
    </div>
  )
}
