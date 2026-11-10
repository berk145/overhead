'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Preference = 'light' | 'dark' | 'system'
type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; preference: Preference; setPreference: (value: Preference) => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference>('system')
  const [theme, setTheme] = useState<Theme>(() => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('overhead:theme')
    // The saved preference is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === 'light' || stored === 'dark' || stored === 'system') setPreference(stored)
    setReady(true)
  }, [])
  useEffect(() => {
    if (!ready) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
      setTheme(next)
      document.documentElement.dataset.theme = next
      window.dispatchEvent(new CustomEvent('themechange', { detail: next }))
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference, ready])
  const update = (value: Preference) => { localStorage.setItem('overhead:theme', value); setPreference(value) }
  return <ThemeContext.Provider value={{ theme, preference, setPreference: update }}>{children}</ThemeContext.Provider>
}
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme requires ThemeProvider')
  return context
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}
