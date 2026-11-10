import { issPositionSchema } from './schema'
export async function fetchIssLive(signal?: AbortSignal) {
  const response = await fetch(
    'https://api.wheretheiss.at/v1/satellites/25544',
    { signal },
  )
  if (!response.ok) throw new Error(`ISS feed failed (${response.status})`)
  return issPositionSchema.parse(await response.json())
}
