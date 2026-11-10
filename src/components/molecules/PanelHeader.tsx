import type { ReactNode } from 'react'
export function PanelHeader({ title, caption, right }: { title: string; caption?: string; right?: ReactNode }) { return <div className="flex items-center justify-between gap-2"><div><h2 className="text-xs font-semibold uppercase tracking-wider">{title}</h2>{caption && <p className="text-xs text-fg-subtle">{caption}</p>}</div>{right}</div> }
