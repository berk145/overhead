import { queryOptions } from '@tanstack/react-query'
import { fetchIssLive } from './client'
export const issKeys = { live: ['iss', 'live'] as const }
export const issLiveOptions = (enabled: boolean) =>
  queryOptions({
    queryKey: issKeys.live,
    queryFn: ({ signal }) => fetchIssLive(signal),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 4000,
    enabled,
  })
