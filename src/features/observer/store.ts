import type { StateCreator } from 'zustand'
import type { AppStore } from '@/store'
export type Observer = { lat: number; lon: number; altM: number; label: string }
export type ObserverSlice = {
  observer: Observer
  locationDialogOpen: boolean
  setObserver: (observer: Observer) => void
  setLocationDialogOpen: (open: boolean) => void
}
export const createObserverSlice: StateCreator<
  AppStore,
  [],
  [],
  ObserverSlice
> = (set) => ({
  observer: { lat: 52.37, lon: 4.9, altM: 3, label: 'Amsterdam, Netherlands' },
  locationDialogOpen: false,
  setObserver: (observer) => set({ observer }),
  setLocationDialogOpen: (locationDialogOpen) => set({ locationDialogOpen }),
})
