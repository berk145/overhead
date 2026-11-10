'use client'
import { SearchMd } from '@untitledui/icons'
import type { ChangeEvent, KeyboardEventHandler, ReactNode } from 'react'

export function SearchField({
  value,
  onChange,
  onKeyDown,
  placeholder,
  results,
  loading,
}: {
  value: string
  onChange: (value: string) => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  placeholder: string
  results?: ReactNode
  loading?: boolean
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(event.target.value)
  return (
    <div>
      <div className="relative">
        <SearchMd
          aria-hidden="true"
          className="text-fg-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          aria-label="Search satellites"
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="border-border-strong bg-surface-2 focus:ring-ring text-md min-h-10 w-full rounded-lg border py-2 pr-3 pl-9 outline-none focus:ring-2"
        />
      </div>
      {loading && <span className="text-fg-subtle text-xs">Searching...</span>}
      {results}
    </div>
  )
}
