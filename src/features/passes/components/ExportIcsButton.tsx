'use client'
import { Calendar } from '@untitledui/icons'
import { useAppStore } from '@/store'
import type { Pass } from '@/lib/propagation/types'
import { buildIcs } from '../lib/ics'
export function ExportIcsButton({
  passes,
  satelliteName,
}: {
  passes: Pass[]
  satelliteName: string
}) {
  const observer = useAppStore((s) => s.observer)
  function download() {
    const blob = new Blob(
      [
        buildIcs({
          passes,
          satelliteName,
          locationLabel: observer.label,
          nowMs: Date.now(),
        }),
      ],
      { type: 'text/calendar;charset=utf-8' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `overhead-${satelliteName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-passes.ics`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  return (
    <button
      type="button"
      disabled={!passes.length}
      onClick={download}
      className="border-border-strong text-md flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 font-medium disabled:opacity-50"
    >
      <Calendar aria-hidden="true" className="size-4" />
      Export {passes.length} passes to calendar (.ics)
    </button>
  )
}
