import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
export function Badge({
  children,
  color = 'gray',
}: {
  children: ReactNode
  color?: 'gray' | 'success' | 'warning' | 'error'
}) {
  const colors = {
    gray: 'bg-surface-2 text-fg-muted',
    success:
      'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-500',
    warning:
      'bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-500',
    error:
      'bg-error-50 text-error-700 dark:bg-error-500/20 dark:text-error-500',
  }
  return (
    <span
      className={cn(
        'text-2xs inline-flex rounded-full px-2 py-0.5 font-semibold',
        colors[color],
      )}
    >
      {children}
    </span>
  )
}
