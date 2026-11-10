'use client'
import dynamic from 'next/dynamic'
const OverheadApp = dynamic(
  () => import('./OverheadApp').then((module) => module.OverheadApp),
  { ssr: false },
)
export function ClientApp() {
  return <OverheadApp />
}
