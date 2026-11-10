'use client'
import { Panel } from '@/components/molecules/Panel'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { isSimulated } from '@/lib/propagation/sim-clock'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { formatTime } from '@/lib/format'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
export function LiveClock() {
  const now = useFrameClock(1)
  const clock = useAppStore(
    useShallow((s) => ({
      baseRealMs: s.baseRealMs,
      baseSimMs: s.baseSimMs,
      speed: s.speed,
    })),
  )
  const [realNow, setRealNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setRealNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const speed = clock.speed
  const setSpeed = useAppStore((s) => s.setSpeed)
  const reset = useAppStore((s) => s.resetClock)
  return (
    <Panel floating className="p-2 text-xs">
      <button onClick={reset} className="block min-h-10 font-mono lg:min-h-7">
        {isSimulated(clock, realNow) ? 'Simulated' : 'Real time'} ·{' '}
        {formatTime(now, { timeZone: 'UTC', seconds: true })} UTC
      </button>
      <div className="flex gap-1">
        {[1, 10, 60].map((n) => (
          <button
            key={n}
            onClick={() => setSpeed(n)}
            aria-pressed={speed === n}
            className={cn(
              'min-h-10 min-w-10 rounded-md px-2.5 font-medium lg:min-h-7 lg:min-w-0',
              speed === n ? 'bg-accent-soft text-fg' : 'text-fg-subtle',
            )}
          >
            {n}×
          </button>
        ))}
      </div>
    </Panel>
  )
}
