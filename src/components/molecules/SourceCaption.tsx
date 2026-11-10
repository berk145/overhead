import { formatRelativeTime } from '@/lib/format'
export function SourceCaption({
  sources,
  refreshedAt,
  now,
  stale,
}: {
  sources: string[]
  refreshedAt?: number
  now?: number
  stale?: boolean
}) {
  return (
    <p className="text-fg-subtle text-xs">
      Source: {sources.join(' · ')}
      {stale ? ' · stale' : ''}
      {refreshedAt
        ? ` · data updated ${formatRelativeTime(refreshedAt, now)}`
        : ''}
    </p>
  )
}
