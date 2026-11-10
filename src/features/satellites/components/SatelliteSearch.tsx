'use client'
import type { KeyboardEvent } from 'react'
import { SearchField } from '@/components/molecules/SearchField'
import { useAppStore } from '@/store'
import type { Catalog } from '../types'
import { searchCatalog, sortCatalog } from '../lib/catalog'

export function SatelliteSearch({
  catalog,
}: {
  catalog: Pick<Catalog, 'records' | 'groupOf'>
}) {
  const value = useAppStore((s) => s.searchQuery)
  const onChange = useAppStore((s) => s.setSearchQuery)
  const selectSatellite = useAppStore((s) => s.selectSatellite)
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    const match = searchCatalog(
      sortCatalog(catalog.records, catalog.groupOf),
      value,
      1,
    )[0]
    if (match) selectSatellite(match.NORAD_CAT_ID)
  }
  return (
    <SearchField
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={`Search ${catalog.records.length.toLocaleString()} satellites`}
    />
  )
}
