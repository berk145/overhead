import type { StateCreator } from 'zustand'
import type { AppStore } from '@/store'
import { realTime, withSpeed } from '@/lib/propagation/sim-clock'
import type { SimClock } from '@/lib/propagation/types'
export type ClockSlice = SimClock & {
  setSpeed: (speed: number) => void
  resetClock: () => void
}
export const createClockSlice: StateCreator<AppStore, [], [], ClockSlice> = (
  set,
  get,
) => ({
  ...realTime(),
  setSpeed: (speed) => set(withSpeed(get(), speed)),
  resetClock: () => set(realTime()),
})
