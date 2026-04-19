'use client'

import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = ['Services', 'Products', 'Portfolio', 'Philosophy']

export const Navbar = () => {
  const [showSymbol, setShowSymbol] = useState(false)
  const [squished, setSquished]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const scrolledRef                 = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const shouldSwitch = window.scrollY > 40
      if (shouldSwitch === scrolledRef.current) return
      scrolledRef.current = shouldSwitch
      setSquished(true)
      const t = setTimeout(() => {
        setShowSymbol(shouldSwitch)
        setSquished(false)
      }, 180)
      return () => clearTimeout(t)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className="nav-bar">
        {/* Logo block — always dark, left edge */}
        <div className="nav-logo-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showSymbol ? '/symbol-white.svg' : '/full-white.svg'}
            alt="BLT DFRNT"
            className={`nav-logo${squished ? ' nav-logo--squished' : ''}`}
          />
        </div>

        {/* Nav items — absolutely centered, desktop only */}
        <div className="nav-items">
          {NAV_ITEMS.map(item => (
            <a key={item} href="#" className="nav-item">{item}</a>
          ))}
        </div>

        {/* Right group — pushes to right edge */}
        <div className="nav-right">
          <a href="#" className="nav-blueprint">Blueprint</a>
          <a href="#" className="nav-cta">Contact Us</a>
          <ThemeToggle />
          <button
            type="button"
            className={`nav-burger${menuOpen ? ' nav-burger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
          </button>
        </div>
      </nav>

      {/* Full-page overlay — mobile only */}
      <div className={`nav-overlay${menuOpen ? ' nav-overlay--open' : ''}`}>
        <div className="nav-overlay-items">
          {NAV_ITEMS.map(item => (
            <a
              key={item}
              href="#"
              className="nav-overlay-item"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <a href="#" className="nav-overlay-blueprint" onClick={() => setMenuOpen(false)}>
            Blueprint
          </a>
          <a href="#" className="nav-overlay-cta" onClick={() => setMenuOpen(false)}>
            Contact Us
          </a>
        </div>
      </div>
    </>
  )
}
