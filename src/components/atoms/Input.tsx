'use client'
import { Input as AriaInput, type InputProps } from 'react-aria-components'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputProps) {
  return (
    <AriaInput
      {...props}
      className={
        typeof className === 'function'
          ? (state) =>
              cn(
                'border-border-strong bg-surface-2 w-full rounded-lg border px-3 py-2 text-sm',
                className(state),
              )
          : cn(
              'border-border-strong bg-surface-2 w-full rounded-lg border px-3 py-2 text-sm',
              className,
            )
      }
    />
  )
}
