import type { ReactNode } from 'react'
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="p-4 text-sm"><p>{title}</p>{description && <p className="mt-1 text-fg-muted">{description}</p>}{action}</div> }
