import type { StateCreator } from 'zustand'
import type { AppStore } from '@/store'
export type PassesSlice = {
  minElevationDeg: number
  days: number
  selectedPassIndex: number | null
  setMinElevationDeg: (d: number) => void
  selectPass: (i: number | null) => void
}
export const createPassesSlice: StateCreator<AppStore, [], [], PassesSlice> = (
  set,
) => ({
  minElevationDeg: 10,
  days: 5,
  selectedPassIndex: null,
  setMinElevationDeg: (d) =>
    set({ minElevationDeg: Math.max(0, Math.min(60, d)) }),
  selectPass: (selectedPassIndex) => set({ selectedPassIndex }),
})
