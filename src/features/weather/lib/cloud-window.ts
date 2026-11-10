import type { CloudForecast } from '../api/schema'
export type CloudBar = {
  hourMs: number
  cover: number | null
  isPassHour: boolean
}
export function cloudWindow(f: CloudForecast, peakMs: number): CloudBar[] {
  const passHourMs = Math.floor(peakMs / 3_600_000) * 3_600_000
  const index = new Map(
    f.hourly.time.map((t, i) => [Date.parse(t.endsWith('Z') ? t : `${t}Z`), i]),
  )
  return Array.from({ length: 6 }, (_, n) => {
    const hourMs = passHourMs + (n - 2) * 3_600_000
    const i = index.get(hourMs)
    return {
      hourMs,
      cover: i === undefined ? null : (f.hourly.cloud_cover[i] ?? null),
      isPassHour: n === 2,
    }
  })
}
