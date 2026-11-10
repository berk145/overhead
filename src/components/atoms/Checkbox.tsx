'use client'
import { Check } from '@untitledui/icons'
import type { ReactNode } from 'react'
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps,
} from 'react-aria-components'
export function Checkbox({
  children,
  ...props
}: Omit<CheckboxProps, 'children'> & { children: ReactNode }) {
  return (
    <AriaCheckbox
      {...props}
      className="group flex cursor-pointer items-center gap-2 text-sm"
    >
      <span
        aria-hidden
        className="border-border-strong group-data-[selected]:border-accent group-data-[selected]:bg-accent group-data-[selected]:text-accent-fg flex size-4 items-center justify-center rounded border"
      >
        <Check
          className="hidden size-3 group-data-[selected]:block"
          strokeWidth={3}
        />
      </span>
      {children}
    </AriaCheckbox>
  )
}
