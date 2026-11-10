import { cn } from '@/lib/utils'
export function LiveIndicator({
  state,
  label,
  clock,
}: {
  state: 'live' | 'stale' | 'error'
  label: string
  clock: string
}) {
  return (
    <span
      data-testid="live-indicator"
      data-state={state}
      className="text-fg-muted inline-flex items-center gap-2 text-xs"
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-full',
          {
            live: 'bg-success-500 ring-success-500/20 ring-4 motion-safe:animate-pulse',
            error: 'bg-error-500',
            stale: 'bg-warning-500',
          }[state],
        )}
      />
      <span role="status">
        {state === 'live' ? 'Live' : state === 'stale' ? 'Stale' : 'Error'}
      </span>
      <span>
        <span className="font-mono">{clock}</span> · {label}
      </span>
    </span>
  )
}
