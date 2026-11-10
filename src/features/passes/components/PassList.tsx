'use client'
import { useEffect, useRef, type ComponentProps } from 'react'
import { ListBox, ListBoxItem } from 'react-aria-components'
import { Badge } from '@/components/atoms/Badge'
import { ElevationBadge } from '@/components/molecules/ElevationBadge'
import { useAppStore } from '@/store'
import { compassPoint } from '@/lib/geo'
import {
  formatDateShort,
  formatDegrees,
  formatDuration,
  formatTime,
} from '@/lib/format'
import type { Pass } from '@/lib/propagation/types'
function timezoneCaption(atMs: number) {
  const name =
    new Intl.DateTimeFormat('en', { timeZoneName: 'short' })
      .formatToParts(atMs)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''
  const offset =
    new Intl.DateTimeFormat('en', { timeZoneName: 'shortOffset' })
      .formatToParts(atMs)
      .find((part) => part.type === 'timeZoneName')
      ?.value.replace('GMT', 'UTC') ?? 'UTC'
  return `${name} (${offset})`
}
export function PassList({
  passes,
  loading,
  error,
}: {
  passes: Pass[]
  loading?: boolean
  error?: string
}) {
  const observer = useAppStore((s) => s.observer)
  const selected = useAppStore((s) => s.selectedPassIndex)
  const select = useAppStore((s) => s.selectPass)
  const lastList = useRef<Pass[]>([])
  useEffect(() => {
    const previous = lastList.current
    if (previous === passes) return
    lastList.current = passes
    const selectedPass = selected === null ? null : previous[selected]
    const retained = selectedPass
      ? passes.findIndex(
          (p) =>
            p.noradId === selectedPass.noradId &&
            p.riseMs === selectedPass.riseMs,
        )
      : -1
    const visible = passes.findIndex((p) => p.visibility === 'visible')
    const next = passes.length
      ? retained >= 0
        ? retained
        : Math.max(0, visible)
      : null
    if (next !== selected) select(next)
  }, [passes, select, selected])
  const handleSelectionChange: NonNullable<
    ComponentProps<typeof ListBox>['onSelectionChange']
  > = (keys) => {
    if (keys === 'all') return
    const key = [...keys][0]
    const index = passes.findIndex((p) => `${p.noradId}:${p.riseMs}` === key)
    if (index >= 0) select(index)
  }
  return (
    <section className="border-border border-t p-4 lg:px-3 lg:py-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="label-caps min-w-0 truncate">
          Next passes · {observer.label.split(',')[0]}
        </h2>
        <span className="text-fg-subtle text-2xs whitespace-nowrap">
          {timezoneCaption(passes[0]?.riseMs ?? 0)}
        </span>
      </div>
      {loading ? (
        <p className="text-fg-muted mt-4 text-sm">Computing passes...</p>
      ) : error ? (
        <p className="text-fg-muted mt-4 text-sm">
          {error === 'not-leo'
            ? 'Pass prediction is available for low Earth orbits.'
            : error === 'decayed'
              ? 'Pass prediction unavailable: satellite elements are invalid or decayed.'
              : error === 'not-loaded'
                ? 'Enable the group containing this satellite.'
                : 'Pass prediction unavailable.'}
        </p>
      ) : !passes.length ? (
        <p data-testid="pass-list-empty" className="text-fg-muted mt-4 text-sm">
          No passes above the minimum elevation.
        </p>
      ) : (
        <ListBox
          data-testid="pass-list"
          aria-label="Upcoming passes"
          selectionMode="single"
          selectionBehavior="replace"
          selectedKeys={
            selected === null || !passes[selected]
              ? []
              : [`${passes[selected].noradId}:${passes[selected].riseMs}`]
          }
          onSelectionChange={handleSelectionChange}
          className="mt-2 outline-none lg:mt-1 lg:max-h-[300px] lg:overflow-auto"
        >
          {passes.map((pass, index) => (
            <ListBoxItem
              id={`${pass.noradId}:${pass.riseMs}`}
              key={`${pass.noradId}:${pass.riseMs}`}
              textValue={`Pass ${formatDateShort(pass.riseMs)} ${formatTime(pass.riseMs)}, maximum elevation ${formatDegrees(pass.maxElDeg, 0)}, ${pass.visibility === 'shadow' ? 'in shadow' : pass.visibility}, duration ${formatDuration(pass.setMs - pass.riseMs)}`}
              className="group data-[selected]:bg-accent-soft focus-visible:ring-ring hover:bg-surface-hover duration-fast flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-3 transition-colors outline-none focus-visible:ring-2 lg:gap-2 lg:py-1.5"
            >
              <ElevationBadge
                elevationDeg={pass.maxElDeg}
                selected={selected === index}
              />
              <span className="min-w-0 flex-1">
                <span className="text-md block font-semibold">
                  {formatDateShort(pass.riseMs)}
                </span>
                <span className="text-fg block font-mono text-xs lg:whitespace-nowrap">
                  {formatTime(pass.riseMs)}{' '}
                  <span className="text-fg-subtle">→</span>{' '}
                  {formatTime(pass.peakMs)}{' '}
                  <span className="text-fg-subtle">→</span>{' '}
                  {formatTime(pass.setMs)}
                </span>
                <span className="text-fg-subtle block text-xs">
                  {compassPoint(pass.riseAzDeg)} → {compassPoint(pass.setAzDeg)}{' '}
                  · {formatDuration(pass.setMs - pass.riseMs)}
                </span>
              </span>
              <Badge
                color={
                  pass.visibility === 'visible'
                    ? 'success'
                    : pass.visibility === 'daylight'
                      ? 'warning'
                      : 'gray'
                }
              >
                {pass.visibility === 'shadow'
                  ? 'In shadow'
                  : pass.visibility === 'daylight'
                    ? 'Daylight'
                    : 'Visible'}
              </Badge>
            </ListBoxItem>
          ))}
        </ListBox>
      )}
    </section>
  )
}
