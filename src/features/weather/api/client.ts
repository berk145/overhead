import { cloudForecastSchema } from './schema'
export async function fetchCloudForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal,
) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high',
    forecast_days: '6',
    timezone: 'UTC',
  }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok)
    throw new Error(`Cloud forecast failed (${response.status})`)
  return cloudForecastSchema.parse(await response.json())
}
