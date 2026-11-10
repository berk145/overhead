'use client'
import type { ReactNode } from 'react'
import { Switch, type SwitchProps } from 'react-aria-components'
export function Toggle({
  children,
  ...props
}: Omit<SwitchProps, 'children'> & { children: ReactNode }) {
  return (
    <Switch
      {...props}
      className="group inline-flex cursor-pointer items-center gap-2 text-sm"
    >
      <span className="bg-surface-2 group-data-[selected]:bg-accent h-6 w-10 rounded-full p-1">
        <span className="bg-fg block size-4 rounded-full transition-transform group-data-[selected]:translate-x-4" />
      </span>
      {children}
    </Switch>
  )
}
