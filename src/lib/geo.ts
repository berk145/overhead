export const normalizeLon = (lon: number): number => ((((lon + 180) % 360) + 360) % 360) - 180
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180
  const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)))
}
const POINTS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'] as const
export const compassPoint = (azDeg: number): (typeof POINTS)[number] => { const point = POINTS[Math.round((((azDeg % 360) + 360) % 360) / 22.5) % 16]; if (!point) throw new Error(`Invalid azimuth: ${azDeg}`); return point }
