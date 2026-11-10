'use client'
import { Check } from '@untitledui/icons'
import { Checkbox } from 'react-aria-components'
import { useAppStore } from '@/store'
import type { CatalogResult } from '../lib/use-catalog'
import type { GroupId } from '@/lib/propagation/types'

const DISPLAY_ORDER: GroupId[] = [
  'stations',
  'visual',
  'starlink',
  'gps-ops',
  'active',
]

const labels = {
  stations: 'Stations',
  visual: 'Visual',
  starlink: 'Starlink',
  'gps-ops': 'GPS operational',
  active: 'Active',
}

export function GroupList({ catalog }: { catalog: CatalogResult }) {
  const enabled = useAppStore((s) => s.enabledGroups)
  const set = useAppStore((s) => s.setGroupEnabled)
  return (
    <section>
      <h2 className="label-caps mb-3">Groups</h2>
      <div className="space-y-1">
        {DISPLAY_ORDER.map((group) => {
          const state = catalog.statuses.find((s) => s.group === group)
          const isEnabled = enabled.includes(group)
          const hasError = isEnabled && state?.status === 'error'
          const count = state?.data
            ? catalog.counts[group].toLocaleString()
            : ''
          const status =
            count || (isEnabled && state?.status === 'pending' ? '…' : '')
          const handleChange = (on: boolean) => set(group, on)
          const handleRetry = () => void state?.refetch?.()
          return (
            <div
              key={group}
              className="flex items-center gap-2 rounded-lg px-1 py-0.5"
            >
              <Checkbox
                isSelected={isEnabled}
                onChange={handleChange}
                className="group data-[focus-visible]:ring-ring text-md flex min-h-10 flex-1 cursor-pointer items-center gap-2 rounded font-medium data-[focus-visible]:ring-2 lg:min-h-8"
              >
                <span
                  aria-hidden
                  className="border-border-strong group-data-[selected]:border-accent group-data-[selected]:bg-accent group-data-[selected]:text-accent-fg flex size-4 items-center justify-center rounded border"
                >
                  {isEnabled && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span>{labels[group]}</span>
              </Checkbox>
              {hasError && (
                <button
                  type="button"
                  className="text-error-600 dark:text-error-500 min-h-10 px-2 text-xs underline"
                  title={
                    state.error instanceof Error
                      ? state.error.message
                      : 'Failed to load group'
                  }
                  aria-label={`Retry ${labels[group]}`}
                  onClick={handleRetry}
                >
                  Retry
                </button>
              )}
              {!hasError && (
                <span className="text-fg-subtle text-right text-xs">
                  <span className="block font-mono">{status}</span>
                  {(group === 'starlink' || group === 'active') && (
                    <span className="text-2xs block">
                      {group === 'starlink' ? '4.7 MB' : '7 MB'}
                    </span>
                  )}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
