import { queryOptions } from '@tanstack/react-query'
import { searchCity } from './client'
export const geocodeKeys = {
  search: (q: string) => ['geocode', q.trim().toLowerCase()] as const,
}
export const geocodeOptions = (q: string) =>
  queryOptions({
    queryKey: geocodeKeys.search(q),
    queryFn: ({ signal }) => searchCity(q.trim(), signal),
    staleTime: 86_400_000,
    enabled: q.trim().length >= 2,
  })
