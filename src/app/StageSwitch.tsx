'use client'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import { footprintRadiusKm } from '@/lib/footprint'
import { formatDistance } from '@/lib/format'
import { buildSatrec, propagateGeodetic } from '@/lib/propagation/satrec'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import { useAppStore } from '@/store'
import type {
  OmmRecordLike,
  ObserverInput,
  Pass,
} from '@/lib/propagation/types'
import { GroundTrackView } from '@/features/ground-track/components/GroundTrackView'
import { SkyDome } from '@/features/passes'
import { LiveClock } from '@/features/clock/LiveClock'
import { Panel } from '@/components/molecules/Panel'
import { ViewSwitch } from '@/features/view/ViewSwitch'
const Globe = dynamic(() => import('@/features/globe/components/GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="bg-surface-2 h-full animate-pulse motion-reduce:animate-none" />
  ),
})
export function StageSwitch({
  record,
  observer,
  pass,
}: {
  record: OmmRecordLike | null
  observer: ObserverInput & { label: string }
  pass: Pass | null
}) {
  const view = useAppStore((s) => s.viewMode)
  const groups = useAppStore((s) => s.enabledGroups)
  const now = useFrameClock(1)
  const built = useMemo(() => (record ? buildSatrec(record) : null), [record])
  const position = built && propagateGeodetic(built.satrec, now)
  const [unavailable, setUnavailable] = useState(false)
  const onUnavailable = useCallback(() => setUnavailable(true), [])
  return (
    <div
      className="bg-bg relative h-full overflow-hidden"
      data-testid="main-viz"
    >
      <div className="absolute inset-0" hidden={view !== 'globe'}>
        {unavailable ? (
          <>
            <p className="absolute bottom-2 left-2 z-10 text-xs">
              3D view needs WebGL
            </p>
            <GroundTrackView record={record} observer={observer} />
          </>
        ) : (
          <Globe
            record={record}
            observer={observer}
            onUnavailable={onUnavailable}
          />
        )}
      </div>
      {view === 'track' && (
        <div className="absolute inset-0 p-4 lg:p-6">
          <GroundTrackView record={record} observer={observer} />
        </div>
      )}
      {view === 'sky' && (
        <div className="absolute inset-0 px-8 pt-24 pb-8 lg:pt-16">
          <SkyDome pass={pass} />
        </div>
      )}
      {view === 'globe' && (
        <Panel
          floating
          className="text-fg-muted absolute bottom-3 left-3 max-w-[48%] p-2 text-xs"
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span>
              <span className="bg-orbit-selected mr-1 inline-block h-0.5 w-3 align-middle" />
              Orbit
            </span>
            {groups.map((group) => (
              <span key={group}>
                <span
                  aria-hidden
                  className={`mr-1 inline-block size-2 rounded-full ${group === 'stations' ? 'bg-group-stations' : group === 'visual' ? 'bg-group-visual' : group === 'starlink' ? 'bg-group-starlink' : group === 'gps-ops' ? 'bg-group-gps' : 'bg-group-active'}`}
                />
                {group === 'gps-ops'
                  ? 'GPS'
                  : group[0]?.toUpperCase() + group.slice(1)}
              </span>
            ))}
          </div>
        </Panel>
      )}
      {view === 'globe' && position && (
        <Panel
          floating
          className="text-fg-muted absolute right-3 bottom-3 max-w-[40%] p-2 text-right text-xs"
        >
          <span className="hidden lg:inline">Night side shaded · </span>
          Footprint radius {formatDistance(footprintRadiusKm(position.altKm))}
        </Panel>
      )}
      <div className="absolute top-3 right-3">
        <ViewSwitch unavailable={unavailable} />
      </div>
      <div className="absolute top-3 left-3">
        <LiveClock />
      </div>
    </div>
  )
}
