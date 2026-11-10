'use client'
import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { geocodeOptions } from '../api/queries'
import { geolocate } from '../lib/geolocate'
export function LocationDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const observer = useAppStore((s) => s.observer)
  const setObserver = useAppStore((s) => s.setObserver)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [lat, setLat] = useState(String(observer.lat))
  const [lon, setLon] = useState(String(observer.lon))
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(timer)
  }, [query])
  const results = useQuery(geocodeOptions(debounced))
  function choose(location: typeof observer) {
    setObserver(location)
    setError('')
    onClose()
  }
  async function locate() {
    setLocating(true)
    setError('')
    try {
      choose(await geolocate())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not get your location')
    } finally {
      setLocating(false)
    }
  }
  function manual() {
    const a = Number(lat),
      b = Number(lon)
    if (
      !lat.trim() ||
      !lon.trim() ||
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      a < -90 ||
      a > 90 ||
      b < -180 ||
      b > 180
    ) {
      setError(
        'Enter a latitude from -90 to 90 and longitude from -180 to 180.',
      )
      return
    }
    choose({
      lat: Math.round(a * 100) / 100,
      lon: Math.round(b * 100) / 100,
      altM: 0,
      label: 'Custom location',
    })
  }
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-4"
    >
      <Modal className="border-border bg-surface shadow-popover w-full max-w-md rounded-xl border p-6">
        <Dialog className="outline-none">
          <div className="flex items-center justify-between">
            <Heading slot="title" className="text-base font-semibold">
              Observer location
            </Heading>
            <Button
              onPress={onClose}
              aria-label="Close"
              className="text-fg-muted min-h-10 min-w-10 rounded-md px-2"
            >
              ✕
            </Button>
          </div>
          <p className="text-fg-muted mt-2 text-sm">
            Find a city or enter coordinates to predict passes.
          </p>
          <label className="mt-5 block text-sm font-medium">
            Search for a city
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results.data?.[0]) {
                  const r = results.data[0]
                  choose({
                    lat: r.latitude,
                    lon: r.longitude,
                    altM: Math.max(0, Math.round(r.elevation ?? 0)),
                    label: [r.name, r.admin1, r.country]
                      .filter(Boolean)
                      .join(', '),
                  })
                }
              }}
              placeholder="Search cities"
              className="border-border-strong bg-surface-2 focus:ring-ring mt-2 min-h-10 w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
            />
          </label>
          {results.isError && (
            <p className="text-error-600 dark:text-error-500 mt-2 text-sm">
              City search unavailable.
            </p>
          )}
          {results.data && debounced.trim().length >= 2 && (
            <ul className="mt-2 max-h-44 overflow-auto">
              {results.data.length ? (
                results.data.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="hover:bg-surface-2 focus-visible:ring-ring min-h-10 w-full rounded-md px-2 py-2 text-left text-sm focus-visible:ring-2"
                      onClick={() =>
                        choose({
                          lat: r.latitude,
                          lon: r.longitude,
                          altM: Math.max(0, Math.round(r.elevation ?? 0)),
                          label: [r.name, r.admin1, r.country]
                            .filter(Boolean)
                            .join(', '),
                        })
                      }
                    >
                      {[r.name, r.admin1, r.country].filter(Boolean).join(', ')}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-fg-muted px-2 py-2 text-sm">
                  No matching cities
                </li>
              )}
            </ul>
          )}
          <button
            type="button"
            disabled={locating}
            onClick={locate}
            className="border-border-strong mt-4 min-h-10 w-full rounded-md border px-3 py-2 text-sm"
          >
            {locating ? 'Locating...' : 'Use my location'}
          </button>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-sm">
              Latitude
              <input
                type="number"
                min="-90"
                max="90"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="border-border-strong bg-surface-2 mt-1 min-h-10 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Longitude
              <input
                type="number"
                min="-180"
                max="180"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="border-border-strong bg-surface-2 mt-1 min-h-10 w-full rounded-md border px-3 py-2"
              />
            </label>
          </div>
          {error && (
            <p
              role="alert"
              className="text-error-600 dark:text-error-500 mt-3 text-sm"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={manual}
            className="bg-accent text-accent-fg mt-4 min-h-10 w-full rounded-md px-3 py-2 text-sm font-semibold"
          >
            Use coordinates
          </button>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
