'use client'

import { useEffect, useRef } from 'react'

function isClickable(el: Element | null): boolean {
  if (!el || el === document.body) return false
  const tag = el.tagName.toLowerCase()
  if (['a', 'button', 'input', 'select', 'textarea', 'label'].includes(tag)) return true
  if (el.getAttribute('role') === 'button') return true
  return isClickable(el.parentElement)
}

export const CrosshairCursor = () => {
  const hRef    = useRef<HTMLDivElement>(null)
  const vRef    = useRef<HTMLDivElement>(null)
  const plusRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (hRef.current)    hRef.current.style.transform    = `translateY(${y}px)`
      if (vRef.current)    vRef.current.style.transform    = `translateX(${x}px)`
      if (plusRef.current) plusRef.current.style.transform = `translate(${x}px, ${y}px)`
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${x}px, ${y}px)`
      const clicking = isClickable(e.target as Element)
      if (plusRef.current) plusRef.current.style.opacity = clicking ? '0' : '1'
      if (dotRef.current)  dotRef.current.style.opacity  = clicking ? '1' : '0'
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div ref={hRef}    className="cursor-h" />
      <div ref={vRef}    className="cursor-v" />
      <div ref={plusRef} className="cursor-plus">
        <div className="cursor-plus-h" />
        <div className="cursor-plus-v" />
      </div>
      <div ref={dotRef}  className="cursor-dot" />
    </>
  )
}
