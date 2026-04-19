'use client'

import { useEffect, useRef } from 'react'

const DOT = 3
const GAP = 2
const COUNT = 22

class Cluster {
  x = 0; y = 0
  cols = 0; rows = 0
  bitmap: boolean[] = []
  maxOpacity = 0; opacity = 0
  phase: 'fadein' | 'hold' | 'fadeout' = 'fadein'
  holdTime = 0; holdStart = 0
  fadeSpeed = 0

  constructor(w: number, h: number, initial = false) {
    this.spawn(w, h, initial)
  }

  spawn(w: number, h: number, initial = false) {
    const margin = 80
    const side = Math.floor(Math.random() * 4)
    if (side === 0) { this.x = margin + Math.random() * (w - margin * 2); this.y = Math.random() * h * 0.32 }
    else if (side === 1) { this.x = margin + Math.random() * (w - margin * 2); this.y = h * 0.68 + Math.random() * h * 0.32 }
    else if (side === 2) { this.x = Math.random() * w * 0.28; this.y = margin + Math.random() * (h - margin * 2) }
    else { this.x = w * 0.72 + Math.random() * w * 0.28; this.y = margin + Math.random() * (h - margin * 2) }

    this.cols = 3 + Math.floor(Math.random() * 5)
    this.rows = 2 + Math.floor(Math.random() * 4)
    this.bitmap = Array.from({ length: this.cols * this.rows }, () => Math.random() > 0.45)
    this.maxOpacity = 0.1 + Math.random() * 0.16
    this.opacity    = initial ? Math.random() * this.maxOpacity : 0
    this.phase      = initial ? 'hold' : 'fadein'
    this.holdTime   = 2500 + Math.random() * 4000
    this.holdStart  = initial ? Date.now() - Math.random() * this.holdTime : 0
    this.fadeSpeed  = 0.0007 + Math.random() * 0.001
  }

  update(now: number, w: number, h: number) {
    if (this.phase === 'fadein') {
      this.opacity += this.fadeSpeed * 16
      if (this.opacity >= this.maxOpacity) { this.opacity = this.maxOpacity; this.phase = 'hold'; this.holdStart = now }
    } else if (this.phase === 'hold') {
      if (now - this.holdStart > this.holdTime) this.phase = 'fadeout'
    } else {
      this.opacity -= this.fadeSpeed * 16
      if (this.opacity <= 0) { this.opacity = 0; this.spawn(w, h) }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0) return
    ctx.fillStyle = `rgba(13,13,13,${this.opacity.toFixed(3)})`
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.bitmap[r * this.cols + c]) {
          ctx.fillRect(this.x + c * (DOT + GAP), this.y + r * (DOT + GAP), DOT, DOT)
        }
      }
    }
  }
}

export const HeroClusters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number
    let clusters: Cluster[] = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      clusters = Array.from({ length: COUNT }, () => new Cluster(canvas.width, canvas.height, true))
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      clusters.forEach(c => { c.update(now, canvas.width, canvas.height); c.draw(ctx) })
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
