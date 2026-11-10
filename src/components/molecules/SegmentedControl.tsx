'use client'
import { cn } from '@/lib/utils'
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'normal',
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  size?: 'small' | 'normal'
}) {
  return (
    <div
      role="group"
      className="border-border bg-surface-2 inline-flex rounded-lg border p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3',
            size === 'small' ? 'py-1 text-xs' : 'py-2 text-sm',
            value === option.value
              ? 'bg-surface text-fg shadow-sm'
              : 'text-fg-muted',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
