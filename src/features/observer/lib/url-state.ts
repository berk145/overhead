'use client'
import { useEffect, useRef } from 'react'
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs'
import { useAppStore } from '@/store'
import { GROUP_ORDER } from '@/lib/propagation/types'
import { normalizeLon } from '@/lib/geo'
export const clampLat = (lat: number) => Math.max(-90, Math.min(90, lat))
export const parsers = {
  lat: parseAsFloat.withDefault(52.37),
  lon: parseAsFloat.withDefault(4.9),
  loc: parseAsString.withDefault('Amsterdam, Netherlands'),
  sat: parseAsInteger.withDefault(25544),
  groups: parseAsArrayOf(parseAsStringEnum(GROUP_ORDER)).withDefault([
    'stations',
    'visual',
  ]),
  view: parseAsStringEnum(['globe', 'track', 'sky']).withDefault('globe'),
  minel: parseAsInteger.withDefault(10),
}
export function readUrlState(url: URLSearchParams) {
  const lat =
    parsers.lat.parse(url.get('lat') ?? '') ?? parsers.lat.defaultValue
  const lon =
    parsers.lon.parse(url.get('lon') ?? '') ?? parsers.lon.defaultValue
  return {
    lat: clampLat(Number.isFinite(lat) ? lat : parsers.lat.defaultValue),
    lon: normalizeLon(Number.isFinite(lon) ? lon : parsers.lon.defaultValue),
    loc: parsers.loc.parse(url.get('loc') ?? '') || parsers.loc.defaultValue,
    sat: parsers.sat.parse(url.get('sat') ?? '') ?? parsers.sat.defaultValue,
    groups: url.has('groups')
      ? (parsers.groups.parse(url.get('groups') ?? '') ??
        parsers.groups.defaultValue)
      : parsers.groups.defaultValue,
    view:
      parsers.view.parse(url.get('view') ?? '') ?? parsers.view.defaultValue,
    minel:
      parsers.minel.parse(url.get('minel') ?? '') ?? parsers.minel.defaultValue,
    hasCoordinates: url.has('lat') || url.has('lon'),
  }
}
export function useUrlStateSync() {
  const [, setParams] = useQueryStates(parsers, {
    history: 'replace',
    shallow: true,
  })
  const applyingUrl = useRef(false)
  useEffect(() => {
    function applyUrl() {
      applyingUrl.current = true
      try {
        const params = readUrlState(new URLSearchParams(window.location.search))
        const s = useAppStore.getState()
        s.setObserver({
          lat: params.lat,
          lon: params.lon,
          altM: params.hasCoordinates ? 0 : 3,
          label: params.loc,
        })
        s.selectSatellite(params.sat)
        for (const group of GROUP_ORDER)
          s.setGroupEnabled(group, params.groups.includes(group))
        s.setViewMode(params.view)
        s.setMinElevationDeg(Math.max(0, Math.min(60, params.minel)))
      } finally {
        applyingUrl.current = false
      }
    }
    applyUrl()
    window.addEventListener('popstate', applyUrl)
    const unsubscribe = useAppStore.subscribe((s) => {
      if (applyingUrl.current) return
      void setParams({
        lat: Math.round(s.observer.lat * 100) / 100,
        lon: Math.round(s.observer.lon * 100) / 100,
        loc: s.observer.label,
        sat: s.selectedNoradId,
        groups: s.enabledGroups,
        view: s.viewMode,
        minel: s.minElevationDeg,
      })
    })
    return () => {
      unsubscribe()
      window.removeEventListener('popstate', applyUrl)
    }
  }, [setParams])
}
export function UrlStateSync() {
  useUrlStateSync()
  return null
}
