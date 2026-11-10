'use client'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { formatDateShort, formatNumber, formatTime } from '@/lib/format'
import type { Pass } from '@/lib/propagation/types'
import { cloudForecastOptions } from '../api/queries'
import { cloudWindow } from '../lib/cloud-window'
export function CloudStrip({ pass }: { pass: Pass | null }) {
  const observer = useAppStore((s) => s.observer)
  const query = useQuery({
    ...cloudForecastOptions(observer.lat, observer.lon),
    enabled: !!pass,
  })
  const handleRetry = () => void query.refetch()
  if (!pass) return null
  return (
    <section className="border-border border-t p-4">
      <h3 className="label-caps">
        Cloud cover · {formatDateShort(pass.peakMs)} pass
      </h3>
      {query.isError && (
        <div className="text-fg-muted mt-3 text-sm">
          <p role="status">Forecast unavailable</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-brand-600 dark:text-brand-300 mt-2 min-h-10 min-w-10 px-1 underline"
          >
            Retry
          </button>
        </div>
      )}
      {!query.isError && !query.data && (
        <p className="text-fg-muted mt-3 text-sm">Loading forecast...</p>
      )}
      {!query.isError && query.data && (
        <div className="mt-4 flex items-end justify-between gap-2">
          {cloudWindow(query.data, pass.peakMs).map((bar) => (
            <div
              key={bar.hourMs}
              className={cn(
                'text-2xs flex flex-1 flex-col items-center gap-1 font-medium',
                bar.isPassHour ? 'text-fg' : 'text-fg-muted',
              )}
            >
              <span>
                {bar.cover === null ? 'n/a' : `${formatNumber(bar.cover)}%`}
              </span>
              <div className="border-border flex h-12 w-full max-w-7 items-end rounded-sm border">
                <div
                  className={cn(
                    'w-full rounded-sm',
                    bar.isPassHour ? 'bg-accent' : 'bg-fg-subtle/50',
                  )}
                  style={{ height: `${bar.cover ?? 0}%` }}
                />
              </div>
              <span className="font-mono">{formatTime(bar.hourMs)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
