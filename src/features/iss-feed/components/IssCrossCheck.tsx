'use client'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { SatRec } from 'satellite.js'
import { formatNumber } from '@/lib/format'
import { propagateGeodetic } from '@/lib/propagation/satrec'
import { issLiveOptions } from '../api/queries'
import { crossCheck } from '../lib/cross-check'
export function IssCrossCheck({ satrec }: { satrec: SatRec }) {
  const query = useQuery(issLiveOptions(true))
  const [now, setNow] = useState(0)
  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])
  if (query.isError)
    return <p className="text-fg-subtle text-xs">wheretheiss.at: unavailable</p>
  if (!query.data)
    return <p className="text-fg-subtle text-xs">Checking ISS position...</p>
  const ours = propagateGeodetic(satrec, query.data.timestamp * 1000)
  if (!ours) return null
  const check = crossCheck(ours, query.data, now || query.dataUpdatedAt)
  const color =
    check.groundKm < 25
      ? 'text-success-600 dark:text-success-500'
      : check.groundKm < 100
        ? 'text-warning-600 dark:text-warning-500'
        : 'text-error-600 dark:text-error-500'
  return (
    <p className="text-fg-muted flex flex-wrap items-center gap-x-1.5 text-xs">
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-1.5 shrink-0 rounded-full bg-current',
          color,
        )}
      />
      <span>wheretheiss.at</span>
      <span className="font-mono">
        Δ {formatNumber(check.groundKm, 1)} km ground
      </span>{' '}
      ·
      <span className="font-mono">
        {check.altKm >= 0 ? '+' : ''}
        {formatNumber(check.altKm, 1)} km alt
      </span>{' '}
      ·<span className="font-mono">{formatNumber(check.ageS)} s</span>
    </p>
  )
}
