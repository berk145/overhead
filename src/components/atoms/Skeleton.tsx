import { cn } from '@/lib/utils'
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-2 animate-pulse rounded-lg motion-reduce:animate-none',
        className,
      )}
    />
  )
}
