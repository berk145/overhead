'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
export function ChartFrame({
  children,
}: {
  children: (size: { width: number; height: number }) => ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="aspect-square w-full">
      {size > 0 && children({ width: size, height: size })}
    </div>
  )
}
