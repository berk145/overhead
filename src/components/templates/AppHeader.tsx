import type { ReactNode } from 'react'
export function AppHeader({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) { return <div className="flex min-h-14 items-center gap-4 px-4"><div>{left}</div><div className="min-w-0 flex-1">{center}</div><div>{right}</div></div> }
