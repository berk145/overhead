'use client'
import { Button as AriaButton, type ButtonProps } from 'react-aria-components'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={
        typeof className === 'function'
          ? (state) =>
              cn(
                'border-border-strong bg-surface text-fg hover:bg-surface-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50',
                className(state),
              )
          : cn(
              'border-border-strong bg-surface text-fg hover:bg-surface-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50',
              className,
            )
      }
    />
  )
}
