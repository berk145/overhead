import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  createSatellitesSlice,
  type SatellitesSlice,
} from '@/features/satellites/store'
import {
  createObserverSlice,
  type ObserverSlice,
} from '@/features/observer/store'
import { createPassesSlice, type PassesSlice } from '@/features/passes/store'
import { createClockSlice, type ClockSlice } from '@/features/clock/store'
import { createViewSlice, type ViewSlice } from '@/features/view/store'
export type AppStore = SatellitesSlice &
  ObserverSlice &
  PassesSlice &
  ClockSlice &
  ViewSlice
export const useAppStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createSatellitesSlice(...args),
      ...createObserverSlice(...args),
      ...createPassesSlice(...args),
      ...createClockSlice(...args),
      ...createViewSlice(...args),
    }),
    { name: 'overhead' },
  ),
)
