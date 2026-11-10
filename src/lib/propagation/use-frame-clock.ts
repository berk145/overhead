import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store'
import { simNow } from './sim-clock'
export function useFrameClock(hz?: number): number {
  const clock = useAppStore(useShallow((s) => ({ baseRealMs: s.baseRealMs, baseSimMs: s.baseSimMs, speed: s.speed })))
  const [now, setNow] = useState(() => simNow(clock))
  useEffect(() => {
    let raf = 0, last = 0
    const minGap = hz ? 1000 / hz : 0
    const loop = (t: number) => { if (t - last >= minGap) { last = t; setNow(simNow(clock)) } raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [clock, hz])
  return now
}
