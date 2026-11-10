'use client'
import { ChevronDown } from '@untitledui/icons'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AppShell } from '@/components/templates/AppShell'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { ErrorState } from '@/components/molecules/ErrorState'
import { formatRelativeTime, formatUtcClock } from '@/lib/format'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import { SourceCaption } from '@/components/molecules/SourceCaption'
import { LiveIndicator } from '@/components/molecules/LiveIndicator'
import { LocationPill, UrlStateSync } from '@/features/observer'
import {
  PassList,
  PassSettingsPill,
  SkyDome,
  ExportIcsButton,
  usePasses,
} from '@/features/passes'
import { CloudStrip } from '@/features/weather'
import { IssCrossCheck } from '@/features/iss-feed'
import {
  GroupList,
  TrackedList,
  SatelliteSearch,
  SatelliteCard,
  useCatalog,
  useSelectedSatellite,
} from '@/features/satellites'
import { StageSwitch } from './StageSwitch'
import { GroundTrackView } from '@/features/ground-track/components/GroundTrackView'
import {
  propagationClient,
  usePropagationStatus,
} from '@/lib/propagation/worker-client'
import { GROUP_ORDER } from '@/lib/propagation/types'
import { useAppStore } from '@/store'

export function OverheadApp() {
  const [satellitesOpen, setSatellitesOpen] = useState(false)
  const [realNow, setRealNow] = useState(() => Date.now())
  const catalog = useCatalog()
  const id = useAppStore((s) => s.selectedNoradId)
  const observer = useAppStore((s) => s.observer)
  const selectedIndex = useAppStore((s) => s.selectedPassIndex)
  const groups = useAppStore((s) => s.enabledGroups)
  const clock = useAppStore(
    useShallow((s) => ({
      baseRealMs: s.baseRealMs,
      baseSimMs: s.baseSimMs,
      speed: s.speed,
    })),
  )
  const loaded = useRef(new Map<string, unknown>())
  useEffect(() => {
    for (const group of GROUP_ORDER) {
      const data = catalog.loaded[group]
      if (
        groups.includes(group) &&
        data &&
        loaded.current.get(group) !== data
      ) {
        loaded.current.set(group, data)
        propagationClient.load(group, data)
      } else if (!groups.includes(group) && loaded.current.has(group)) {
        loaded.current.delete(group)
        propagationClient.unload(group)
      }
    }
  }, [groups, catalog.loaded])
  useEffect(() => {
    propagationClient.setClock(clock)
  }, [clock])
  const record = catalog.byId.get(id ?? -1) ?? null
  const built = useSelectedSatellite(record)
  const prediction = usePasses(record, built)
  const passes = useMemo(() => prediction.data?.passes ?? [], [prediction.data])
  const pass = selectedIndex === null ? null : (passes[selectedIndex] ?? null)
  const status = usePropagationStatus()
  const now = useFrameClock(1)
  useEffect(() => {
    const timer = setInterval(() => setRealNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const enabledStatuses = catalog.statuses.filter((s) =>
    groups.includes(s.group),
  )
  const data = enabledStatuses.flatMap((s) => (s.data ? [s.data] : []))
  const refreshed = data.length
    ? Math.min(...data.map((item) => item.updatedAt))
    : 0
  const sources = [...new Set(data.map((item) => item.source))]
  const stale = data.some(
    (item) => item.stale || realNow - item.updatedAt >= 6 * 60 * 60_000,
  )
  const catalogLoading = enabledStatuses.some((s) => s.status === 'pending')
  const catalogError = enabledStatuses.some((s) => s.status === 'error')
  const missingSelection = id !== null && !record
  const failed =
    enabledStatuses.length > 0 &&
    enabledStatuses.every((s) => s.status === 'error')
  const isLive =
    status === 'live' &&
    !stale &&
    !catalogError &&
    data.length === enabledStatuses.length &&
    realNow - refreshed < 6 * 60 * 60_000
  const liveState = failed ? 'error' : isLive ? 'live' : 'stale'
  const refreshLabel = refreshed
    ? `data updated ${formatRelativeTime(refreshed, realNow)}`
    : 'awaiting data'
  const handleRetry = () => {
    for (const group of enabledStatuses) void group.refetch?.()
  }
  const header = (
    <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-2">
      <div className="mr-2 text-base font-semibold tracking-tight">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="mr-2 inline-block align-[-4px]"
        >
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="var(--color-brand-400)"
            strokeWidth="2"
          />
          <circle cx="16" cy="5" r="2.5" fill="var(--color-brand-400)" />
        </svg>
        Overhead
      </div>
      <div className="order-2 min-w-0 flex-1 lg:order-none lg:flex-none">
        <LocationPill />
      </div>
      <div className="order-last w-full lg:order-none lg:w-auto">
        <PassSettingsPill />
      </div>
      <div className="ml-auto hidden lg:block">
        <LiveIndicator
          state={liveState}
          clock={formatUtcClock(now)}
          label={refreshLabel}
        />
      </div>
      <div className="order-1 lg:order-none">
        <ThemeToggle />
      </div>
    </div>
  )
  const left = (
    <>
      <div className="p-4">
        <SatelliteSearch catalog={catalog} />
        <div className="mt-5">
          <GroupList catalog={catalog} />
        </div>
      </div>
      {failed && (
        <ErrorState
          message="CelesTrak data is unavailable"
          onRetry={handleRetry}
        />
      )}
      <TrackedList catalog={catalog} />
      <div className="border-border border-t p-4">
        <SourceCaption
          sources={[...sources, 'Open-Meteo', 'wheretheiss.at']}
          refreshedAt={refreshed}
          stale={stale}
          now={realNow}
        />
      </div>
    </>
  )
  const right = (
    <>
      {record && (
        <SatelliteCard
          record={record}
          group={catalog.groupOf.get(record.NORAD_CAT_ID)}
          issCrossCheck={
            record.NORAD_CAT_ID === 25544 && built ? (
              <IssCrossCheck satrec={built.satrec} />
            ) : undefined
          }
        />
      )}
      <PassList
        passes={passes}
        loading={
          prediction.isLoading ||
          (missingSelection && catalogLoading) ||
          (!!record && prediction.isPending && status !== 'error')
        }
        error={
          prediction.data?.error ??
          (prediction.isError || (missingSelection && catalogError)
            ? 'unavailable'
            : missingSelection && !catalogLoading
              ? 'not-loaded'
              : undefined)
        }
      />
      <div className="hidden lg:block">
        <CloudStrip pass={pass} />
        <div className="px-4 pb-4">
          <ExportIcsButton
            passes={passes}
            satelliteName={record?.OBJECT_NAME ?? 'Satellite'}
          />
        </div>
        <div className="px-4 pb-4">
          <SourceCaption
            sources={[...sources, 'Open-Meteo', 'wheretheiss.at']}
            refreshedAt={refreshed}
            stale={stale}
            now={realNow}
          />
        </div>
      </div>
    </>
  )
  const drawer = (
    <>
      <div className="grid gap-4 p-4 lg:h-full lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.25fr)]">
        <div className="min-h-[280px] lg:min-h-0">
          <SkyDome pass={pass} />
        </div>
        <div className="flex min-h-[220px] flex-col lg:min-h-0">
          <p className="label-caps mb-1">Ground track · next 3 orbits</p>
          <GroundTrackView record={record} observer={observer} />
        </div>
      </div>
      <div className="lg:hidden">
        <CloudStrip pass={pass} />
        <div className="p-4">
          <ExportIcsButton
            passes={passes}
            satelliteName={record?.OBJECT_NAME ?? 'Satellite'}
          />
          <SourceCaption
            sources={[...sources, 'Open-Meteo', 'wheretheiss.at']}
            refreshedAt={refreshed}
            stale={stale}
            now={realNow}
          />
        </div>
      </div>
    </>
  )
  return (
    <div className="[&>div>aside:first-of-type]:order-0 lg:[&>div>aside:first-of-type]:order-none">
      <Suspense fallback={null}>
        <UrlStateSync />
      </Suspense>
      <AppShell
        header={header}
        left={
          <>
            <button
              type="button"
              className="border-border flex min-h-11 w-full items-center justify-between border-b px-4 text-left text-sm font-semibold lg:hidden"
              aria-expanded={satellitesOpen}
              aria-controls="satellite-list"
              onClick={() => setSatellitesOpen((open) => !open)}
            >
              Satellites · {catalog.records.length.toLocaleString()}
              <ChevronDown
                aria-hidden="true"
                className={
                  satellitesOpen
                    ? 'size-4 rotate-180 transition-transform'
                    : 'size-4 transition-transform'
                }
              />
            </button>
            <div
              id="satellite-list"
              className={satellitesOpen ? 'block' : 'hidden lg:block'}
            >
              {left}
            </div>
          </>
        }
        stage={<StageSwitch record={record} observer={observer} pass={pass} />}
        right={right}
        drawer={drawer}
      />
    </div>
  )
}
