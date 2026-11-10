import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
export function Panel({
  title,
  right,
  children,
  className = '',
  floating = false,
}: {
  title?: string
  right?: ReactNode
  children: ReactNode
  className?: string
  floating?: boolean
}) {
  return (
    <section
      className={cn(
        'border-border rounded-xl border',
        floating
          ? 'bg-surface-overlay shadow-panel backdrop-blur-md'
          : 'bg-surface',
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}
