import { queryOptions } from '@tanstack/react-query'
import { fetchCloudForecast } from './client'
const round2 = (n: number) => Math.round(n * 100) / 100
export const weatherKeys = {
  cloud: (lat: number, lon: number) =>
    ['weather', 'cloud', round2(lat), round2(lon)] as const,
}
export const cloudForecastOptions = (lat: number, lon: number) =>
  queryOptions({
    queryKey: weatherKeys.cloud(lat, lon),
    queryFn: ({ signal }) =>
      fetchCloudForecast(round2(lat), round2(lon), signal),
    staleTime: 1_800_000,
    gcTime: 3_600_000,
  })
