'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch { /* storage blocked */ }
  }

  return (
    <button
      type="button"
      className="nav-theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="8"    y1="0.5" x2="8"    y2="2.5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8"    y1="13.5" x2="8"   y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="0.5"  y1="8"   x2="2.5"  y2="8"    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="13.5" y1="8"   x2="15.5" y2="8"    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2.64" y1="2.64" x2="4.05" y2="4.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11.95" y1="11.95" x2="13.36" y2="13.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2.64" y1="13.36" x2="4.05" y2="11.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11.95" y1="4.05" x2="13.36" y2="2.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
