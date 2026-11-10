import { geocodeResponseSchema } from './schema'
export async function searchCity(query: string, signal?: AbortSignal) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({
    name: query,
    count: '5',
    language: 'en',
    format: 'json',
  }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`)
  return geocodeResponseSchema.parse(await response.json()).results
}
