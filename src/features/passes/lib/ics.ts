import type { Pass } from '@/lib/propagation/types'
import { compassPoint } from '@/lib/geo'
const CRLF = '\r\n'
const encoder = new TextEncoder()
export const icsDate = (ms: number) =>
  new Date(ms)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
export const escapeText = (text: string) =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
export function foldLine(line: string) {
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const n = encoder.encode(ch).length
    if (bytes + n > (out.length ? 74 : 75)) {
      out.push(current)
      current = ch
      bytes = n
    } else {
      current += ch
      bytes += n
    }
  }
  out.push(current)
  return out.join(`${CRLF} `)
}
const time = (ms: number) => new Date(ms).toISOString().slice(11, 19)
const visibility = (v: Pass['visibility']) => (v === 'shadow' ? 'in shadow' : v)
export function buildIcs({
  passes,
  satelliteName,
  locationLabel,
  nowMs,
}: {
  passes: Pass[]
  satelliteName: string
  locationLabel: string
  nowMs: number
}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Overhead//Satellite passes//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const pass of passes) {
    const summary = `${satelliteName} pass, max ${Math.round(pass.maxElDeg)}° (${visibility(pass.visibility)})`
    const description = [
      `Rise ${time(pass.riseMs)} UTC at ${compassPoint(pass.riseAzDeg)} (${Math.round(pass.riseAzDeg)}°)`,
      `Peak ${time(pass.peakMs)} UTC at ${Math.round(pass.maxElDeg)}° elevation, ${compassPoint(pass.peakAzDeg)}`,
      `Set ${time(pass.setMs)} UTC at ${compassPoint(pass.setAzDeg)} (${Math.round(pass.setAzDeg)}°)`,
      `Visibility: ${visibility(pass.visibility)}`,
      'Predicted by Overhead from CelesTrak GP elements (SGP4).',
    ].join('\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${pass.noradId}-${pass.riseMs}@overhead.app`,
      `DTSTAMP:${icsDate(nowMs)}`,
      `DTSTART:${icsDate(pass.riseMs)}`,
      `DTEND:${icsDate(pass.setMs)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `LOCATION:${escapeText(locationLabel)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-PT10M',
      `DESCRIPTION:${escapeText(summary)}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join(CRLF) + CRLF
}
