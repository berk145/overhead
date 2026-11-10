'use client'
import { Moon01, Sun } from '@untitledui/icons'
import { useTheme } from '@/lib/theme'
export function ThemeToggle() {
  const { theme, setPreference } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const handleToggle = () => setPreference(next)
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      onClick={handleToggle}
      className="border-border text-fg-muted hover:bg-surface-2 grid size-10 place-items-center rounded-lg border"
    >
      {theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon01 className="size-4" />
      )}
    </button>
  )
}
