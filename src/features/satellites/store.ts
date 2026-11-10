import type { StateCreator } from 'zustand'
import type { GroupId } from '@/lib/propagation/types'
export type { GroupId } from '@/lib/propagation/types'
export type SatellitesSlice = {
  enabledGroups: GroupId[]
  selectedNoradId: number | null
  searchQuery: string
  setGroupEnabled: (g: GroupId, on: boolean) => void
  selectSatellite: (id: number | null) => void
  setSearchQuery: (q: string) => void
}
export const createSatellitesSlice: StateCreator<
  SatellitesSlice,
  [],
  [],
  SatellitesSlice
> = (set) => ({
  enabledGroups: ['stations', 'visual'],
  selectedNoradId: 25544,
  searchQuery: '',
  setGroupEnabled: (g, on) =>
    set((s) => ({
      enabledGroups: on
        ? s.enabledGroups.includes(g)
          ? s.enabledGroups
          : [...s.enabledGroups, g]
        : s.enabledGroups.filter((x) => x !== g),
    })),
  selectSatellite: (id) => set({ selectedNoradId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
})
