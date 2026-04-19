'use client'

import { useEffect, useRef, useState } from 'react'

type Phase = 'hidden' | 'spinning' | 'tracking'

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a
  while (diff > 180)  diff -= 360
  while (diff < -180) diff += 360
  return a + diff * t
}

// ─────────────────────────────────────────────────────────────
// Animated wrapper
// ─────────────────────────────────────────────────────────────
export const NorthStarCompass = () => {
  const [phase, setPhase]       = useState<Phase>('hidden')
  const [rotation, setRotation] = useState(0)
  const compassRef              = useRef<HTMLDivElement>(null)
  const frameRef                = useRef<number>(0)
  const tRef                    = useRef(0)
  const currentRef              = useRef(0)
  const targetRef               = useRef(0)

  // Phase sequencing — shows sooner (1s delay)
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('spinning')
      const t2 = setTimeout(() => setPhase('tracking'), 3000)
      return () => clearTimeout(t2)
    }, 1000)
    return () => clearTimeout(t1)
  }, [])

  // Wild spin
  useEffect(() => {
    if (phase !== 'spinning') return
    cancelAnimationFrame(frameRef.current)
    const animate = () => {
      tRef.current += 0.013
      const t = tRef.current
      const v = Math.sin(t * 2.9) * 110 + Math.sin(t * 6.7) * 55
            + Math.sin(t * 11.3) * 25 + (Math.random() - 0.5) * 5
      currentRef.current = v
      setRotation(v)
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [phase])

  // Cursor tracking
  useEffect(() => {
    if (phase !== 'tracking') return
    cancelAnimationFrame(frameRef.current)
    const onMove = (e: MouseEvent) => {
      if (!compassRef.current) return
      const r = compassRef.current.getBoundingClientRect()
      targetRef.current = Math.atan2(
        e.clientX - (r.left + r.width  / 2),
       -(e.clientY - (r.top  + r.height / 2))
      ) * (180 / Math.PI)
    }
    const loop = () => {
      currentRef.current = lerpAngle(currentRef.current, targetRef.current, 0.05)
      setRotation(currentRef.current)
      frameRef.current = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    frameRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frameRef.current)
    }
  }, [phase])

  return (
    <div style={{
      opacity:    phase === 'hidden' ? 0 : 1,
      transform:  phase === 'hidden' ? 'translateY(10px)' : 'translateY(0)',
      transition: 'opacity 0.9s ease, transform 0.9s ease',
    }}>
      {/* Compass cell — 96×96px, one grid square */}
      <div className="compass-cell">
        <div ref={compassRef} style={{ transform: `rotate(${rotation}deg)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/compass.svg" alt="compass" className="compass-image" />
        </div>
      </div>

      {/* Scroll cell — 96×96px, one grid square directly below */}
      <div
        className="compass-scroll-cell"
        style={{
          opacity:    phase === 'tracking' ? 1 : 0,
          transition: 'opacity 1.2s ease 0.5s',
        }}
      >
        <span className="compass-scroll-label">Scroll</span>
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none" data-scroll-arrow
          style={{ animation: 'scrollBounce 2.4s ease-in-out infinite' }}>
          <line x1="7" y1="0" x2="7" y2="18" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="2,13 7,19 12,13" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  )
}
