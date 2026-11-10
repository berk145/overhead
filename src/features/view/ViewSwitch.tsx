'use client'
import { Panel } from '@/components/molecules/Panel'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { ViewMode } from './store'
export function ViewSwitch({ unavailable = false }: { unavailable?: boolean }) {
  const view = useAppStore((s) => s.viewMode)
  const set = useAppStore((s) => s.setViewMode)
  return (
    <div role="group" aria-label="View">
      <Panel floating className="flex p-1">
        {(
          [
            ['globe', '3D globe'],
            ['track', '2D track'],
            ['sky', 'Sky'],
          ] satisfies [ViewMode, string][]
        )
          .filter(([id]) => !unavailable || id !== 'globe')
          .map(([id, label]) => (
            <button
              key={id}
              onClick={() => set(id)}
              aria-pressed={view === id}
              className={cn(
                'min-h-10 rounded-md px-2.5 text-xs font-medium lg:min-h-7',
                id === 'sky' && 'hidden lg:block',
                view === id ? 'bg-accent-soft text-fg' : 'text-fg-subtle',
              )}
            >
              {label}
            </button>
          ))}
      </Panel>
    </div>
  )
}
