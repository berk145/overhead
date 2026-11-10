import type { StateCreator } from 'zustand'
import type { AppStore } from '@/store'
export type ViewMode = 'globe' | 'track' | 'sky'
export type ViewSlice = {
  viewMode: ViewMode
  setViewMode: (view: ViewMode) => void
}
export const createViewSlice: StateCreator<AppStore, [], [], ViewSlice> = (
  set,
) => ({ viewMode: 'globe', setViewMode: (viewMode) => set({ viewMode }) })
