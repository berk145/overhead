'use client'
import type { ReactNode } from 'react'
import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components'
export function Tooltip({ children, content }: { children: ReactNode; content: string }) { return <TooltipTrigger>{children}<AriaTooltip className="z-50 rounded-lg bg-fg px-2 py-1 text-xs text-bg shadow-lg">{content}</AriaTooltip></TooltipTrigger> }
