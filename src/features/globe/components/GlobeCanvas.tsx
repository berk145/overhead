'use client'
import Globe, { type GlobeInstance } from 'globe.gl'
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useTheme, useReducedMotion } from '@/lib/theme'
import { readPalette, cssToRgb01 } from '@/styles/chart-palette'
import {
  GROUP_ORDER,
  type OmmRecordLike,
  type ObserverInput,
} from '@/lib/propagation/types'
import { propagationClient } from '@/lib/propagation/worker-client'
import {
  buildSatrec,
  orbitalElements,
  propagateGeodetic,
} from '@/lib/propagation/satrec'
import { useFrameClock } from '@/lib/propagation/use-frame-clock'
import { simNow } from '@/lib/propagation/sim-clock'
import { useAppStore } from '@/store'
import { nightPolygon } from '@/lib/terminator'
import { footprintPolygon } from '@/lib/footprint'
import { createPointsLayer, fillPositions } from '../lib/points-layer'

type Props = {
  record: OmmRecordLike | null
  observer: ObserverInput & { label: string }
  onUnavailable: () => void
}
export default function GlobeCanvas({
  record,
  observer,
  onUnavailable,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const layerRef = useRef<ReturnType<typeof createPointsLayer> | null>(null)
  const markerRef = useRef<Mesh<SphereGeometry, MeshBasicMaterial> | null>(null)
  const haloRef = useRef<Mesh<RingGeometry, MeshBasicMaterial> | null>(null)
  const { theme } = useTheme()
  const reduced = useReducedMotion()
  const now = useFrameClock(1)
  const built = useMemo(() => (record ? buildSatrec(record) : null), [record])
  const bucket = Math.floor(now / 10_000) * 10_000
  const orbit = useMemo(() => {
    if (!built || !record) return { past: [], future: [] }
    const period = orbitalElements(record).periodMin * 60_000
    const samples = Array.from({ length: 121 }, (_, i) =>
      propagateGeodetic(built.satrec, bucket + ((i - 40) * period) / 120),
    )
    const points = (values: typeof samples) =>
      values
        .filter((p) => p !== null)
        .map((p) => ({ lat: p.latDeg, lng: p.lonDeg, alt: p.altKm / 6371 }))
    return {
      past: points(samples.slice(0, 41)),
      future: points(samples.slice(40)),
    }
  }, [built, record, bucket])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let globe: GlobeInstance
    try {
      globe = new Globe(el, { animateIn: false })
    } catch {
      onUnavailable()
      return
    }
    const layer = createPointsLayer(20000)
    const marker = new Mesh(
      new SphereGeometry(0.65, 12, 8),
      new MeshBasicMaterial(),
    )
    marker.visible = false
    const halo = new Mesh(
      new RingGeometry(0.8, 1.1, 24),
      new MeshBasicMaterial({ side: 2 }),
    )
    halo.visible = false
    const group = new Group()
    group.add(layer.points, marker, halo)
    layerRef.current = layer
    markerRef.current = marker
    haloRef.current = halo
    globeRef.current = globe
    let compact = window.matchMedia('(max-width: 1023px)').matches
    globe
      .width(el.clientWidth)
      .height(el.clientHeight)
      .showAtmosphere(true)
      .customLayerData([{}])
      .customThreeObject(() => group)
      .customThreeObjectUpdate(() => {})
      .polygonGeoJsonGeometry('geometry')
      .polygonAltitude('alt')
      .polygonSideColor(() => 'transparent')
      .polygonStrokeColor(() => 'transparent')
      .polygonsTransitionDuration(0)
      .pathPoints('points')
      .pathPointLat('lat')
      .pathPointLng('lng')
      .pathPointAlt('alt')
      .pathStroke(2.2)
      .pathTransitionDuration(0)
      .labelLat('lat')
      .labelLng('lng')
      .labelAltitude('alt')
      .labelText('text')
      .labelSize(1.6)
      .labelDotRadius(0.5)
      .pointOfView({ lat: 30, lng: 0, altitude: compact ? 2.2 : 1.55 }, 0)
    const controls = globe.controls()
    controls.autoRotate = false
    controls.enableDamping = true
    const resize = new ResizeObserver(() => {
      if (el.clientWidth && el.clientHeight) {
        globe.width(el.clientWidth).height(el.clientHeight)
        const nextCompact = window.matchMedia('(max-width: 1023px)').matches
        if (nextCompact !== compact) {
          compact = nextCompact
          globe.pointOfView(
            { ...globe.pointOfView(), altitude: compact ? 2.2 : 1.55 },
            0,
          )
        }
      }
    })
    resize.observe(el)
    const update = () => {
      const frame = propagationClient.getFrame()
      if (!frame) {
        layer.points.geometry.setDrawRange(0, 0)
        return
      }
      const palette = readPalette()
      const colors = GROUP_ORDER.map((g) => cssToRgb01(palette.groups[g]))
      const count = fillPositions(
        layer.position,
        frame.latLngAlt,
        (lat, lng, alt) => globe.getCoords(lat, lng, alt),
        (source, target) => {
          const index = frame.groupIndex[source] ?? 0
          const rgb = colors[index] ?? [1, 1, 1]
          const dim =
            GROUP_ORDER[index] === 'starlink' || GROUP_ORDER[index] === 'active'
              ? 0.55
              : 1
          layer.color.setXYZ(target, rgb[0] * dim, rgb[1] * dim, rgb[2] * dim)
        },
      )
      layer.color.needsUpdate = true
      layer.points.geometry.setDrawRange(0, count)
    }
    const unsubscribe = propagationClient.subscribe(update)
    update()
    return () => {
      unsubscribe()
      resize.disconnect()
      globe._destructor()
      layer.points.geometry.dispose()
      layer.points.material.dispose()
      halo.geometry.dispose()
      halo.material.dispose()
      haloRef.current = null
      marker.geometry.dispose()
      marker.material.dispose()
      markerRef.current = null
      globeRef.current = null
      layerRef.current = null
    }
  }, [onUnavailable])
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const p = readPalette()
    g.globeImageUrl(
      theme === 'dark'
        ? '/textures/earth-night.jpg'
        : '/textures/earth-day.jpg',
    )
      .backgroundColor(theme === 'dark' ? 'rgba(0, 0, 0, 0)' : p.globeBg)
      .atmosphereColor(p.atmosphere)
      .atmosphereAltitude(theme === 'dark' ? 0.12 : 0.08)
      .polygonCapColor('color')
      .pathColor('color')
      .labelColor('color')
    markerRef.current?.material.color.set(p.orbitSelected)
    haloRef.current?.material.color.set(p.globeBg)
    const f = propagationClient.getFrame(),
      layer = layerRef.current
    if (f && layer) {
      const colors = GROUP_ORDER.map((group) => cssToRgb01(p.groups[group]))
      fillPositions(
        layer.position,
        f.latLngAlt,
        (lat, lng, alt) => g.getCoords(lat, lng, alt),
        (source, target) => {
          const index = f.groupIndex[source] ?? 0
          const rgb = colors[index] ?? [1, 1, 1]
          const dim =
            GROUP_ORDER[index] === 'starlink' || GROUP_ORDER[index] === 'active'
              ? 0.55
              : 1
          layer.color.setXYZ(target, rgb[0] * dim, rgb[1] * dim, rgb[2] * dim)
        },
      )
      layer.color.needsUpdate = true
    }
  }, [theme])
  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) {
      controls.autoRotate = !reduced
      controls.autoRotateSpeed = 0.35
    }
  }, [reduced])
  useEffect(() => {
    const p = readPalette()
    globeRef.current?.pathsData(
      [
        { points: orbit.past, color: p.orbitPast },
        { points: orbit.future, color: p.orbitSelected },
      ].filter((path) => path.points.length > 1),
    )
  }, [orbit, theme])
  useEffect(() => {
    const p = readPalette()
    const position = built && propagateGeodetic(built.satrec, now)
    globeRef.current?.polygonsData([
      { geometry: nightPolygon(bucket), color: p.night, alt: 0.004 },
      ...(position
        ? [
            {
              geometry: footprintPolygon(
                position.latDeg,
                position.lonDeg,
                position.altKm,
              ),
              color: p.footprint,
              alt: 0.006,
            },
          ]
        : []),
    ])
  }, [bucket, built, now, theme])
  useEffect(() => {
    const globe = globeRef.current
    const marker = markerRef.current
    const halo = haloRef.current
    if (!globe || !marker || !halo) return
    let animationFrame = 0
    const update = () => {
      const position =
        built && propagateGeodetic(built.satrec, simNow(useAppStore.getState()))
      marker.visible = Boolean(position)
      halo.visible = Boolean(position)
      if (position) {
        const point = globe.getCoords(
          position.latDeg,
          position.lonDeg,
          position.altKm / 6371,
        )
        marker.position.set(point.x, point.y, point.z)
        halo.position.copy(marker.position)
        halo.quaternion.copy(globe.camera().quaternion)
      }
      animationFrame = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(animationFrame)
  }, [built])
  useEffect(() => {
    const position = built && propagateGeodetic(built.satrec, now)
    const p = readPalette()
    globeRef.current?.labelsData([
      {
        lat: observer.lat,
        lng: observer.lon,
        alt: 0.002,
        text: observer.label,
        color: p.observer,
      },
      ...(position && record
        ? [
            {
              lat: position.latDeg,
              lng: position.lonDeg,
              alt: position.altKm / 6371,
              text: record.OBJECT_NAME,
              color: p.orbitSelected,
            },
          ]
        : []),
    ])
  }, [built, now, observer, record, theme])
  return (
    <div
      ref={ref}
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage:
          theme === 'dark' ? "url('/textures/night-sky.png')" : undefined,
      }}
      role="img"
      aria-label="Globe showing tracked satellites in real time"
    />
  )
}
