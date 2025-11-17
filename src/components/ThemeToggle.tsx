'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }
    const stored = localStorage.getItem('arbinote-theme') as 'light' | 'dark' | null
    return stored ?? 'light'
  })

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbinote-theme', nextTheme)
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="px-3 py-1 rounded border border-white/50 text-sm hover:bg-white/10 transition"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}


