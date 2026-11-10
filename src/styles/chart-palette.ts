import { color as parseColor } from 'd3'
import type { GroupId } from '@/lib/propagation/types'
export function readPalette(): {
  groups: Record<GroupId, string>
  orbitSelected: string
  orbitPast: string
  observer: string
  footprint: string
  night: string
  globeBg: string
  atmosphere: string
  chartGrid: string
  chartAxis: string
} {
  const style = getComputedStyle(document.documentElement)
  const probe = document.createElement('span')
  probe.hidden = true
  document.documentElement.appendChild(probe)
  const color = (name: string) => {
    const value = style.getPropertyValue(`--color-${name}`).trim()
    if (!value) throw new Error(`--color-${name} is not defined in globals.css`)
    probe.style.color = value
    return normalizeColor(getComputedStyle(probe).color || value)
  }
  try {
    return {
      groups: {
        stations: color('group-stations'),
        visual: color('group-visual'),
        starlink: color('group-starlink'),
        'gps-ops': color('group-gps'),
        active: color('group-active'),
      },
      orbitSelected: color('orbit-selected'),
      orbitPast: color('orbit-past'),
      observer: color('observer'),
      footprint: color('footprint'),
      night: color('night'),
      globeBg: color('globe-bg'),
      atmosphere: color('globe-atmosphere'),
      chartGrid: color('chart-grid'),
      chartAxis: color('chart-axis'),
    }
  } finally {
    probe.remove()
  }
}
export function cssToRgb01(value: string): [number, number, number] {
  const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)
  if (hex?.[1]) {
    const h = hex[1],
      full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [
      number,
      number,
      number,
    ]
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (!rgb) throw new Error(`Unsupported color: ${value}`)
  return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
}

export function normalizeColor(value: string): string {
  const srgb = value.match(
    /^color\(srgb\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)(?:\s*\/\s*([\d.]+))?\)$/i,
  )
  const modernRgb = value.match(
    /^rgba?\(\s*([^,\s]+)\s+([^,\s]+)\s+([^,\s/]+)(?:\s*\/\s*([^\s)]+))?\s*\)$/i,
  )
  const input = srgb
    ? `rgba(${Math.round(Number(srgb[1]) * 255)}, ${Math.round(Number(srgb[2]) * 255)}, ${Math.round(Number(srgb[3]) * 255)}, ${srgb[4] ?? 1})`
    : modernRgb
      ? `rgba(${modernRgb[1]}, ${modernRgb[2]}, ${modernRgb[3]}, ${modernRgb[4] ?? 1})`
      : value
  const color = parseColor(input)
  if (!color) throw new Error(`Unsupported color: ${value}`)
  return color.formatRgb()
}
