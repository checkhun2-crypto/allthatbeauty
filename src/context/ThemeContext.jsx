import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THEME_PALETTE } from '../data/seed'

const ThemeContext = createContext(null)

const STORAGE = 'ol-dat-beauty-academy-theme-v1'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE) || '{}').dark ?? false
    } catch {
      return false
    }
  })
  const [accentId, setAccentId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE) || '{}').accentId ?? 'pink'
    } catch {
      return 'pink'
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ dark, accentId }))
  }, [dark, accentId])

  const accent = useMemo(
    () => THEME_PALETTE.find((t) => t.id === accentId) ?? THEME_PALETTE[0],
    [accentId],
  )

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', accent.hex)
    root.dataset.theme = dark ? 'dark' : 'light'
  }, [accent.hex, dark])

  const value = useMemo(
    () => ({
      dark,
      setDark,
      accentId,
      setAccentId,
      accent,
      palette: THEME_PALETTE,
    }),
    [dark, accentId, accent],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme outside ThemeProvider')
  return ctx
}
