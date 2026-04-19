import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NorthStarCompass } from '@/components/NorthStarCompass'

export default function Home() {
  return (
    <main className="page-main">

      {/* ── Hero — real CSS grid, elements snap to cells ── */}
      <section className="hero-section">

        {/* Content: spans all cols, rows 1-7 */}
        <div className="hero-content">
          <p className="text-xs font-mono text-[#222] tracking-[0.3em] uppercase">
            Reality By Design
          </p>
          <h1 id="north-star" className="cursor-blink text-[#0d0d0d]">
            BLT DFRNT
          </h1>
          <p className="font-mono text-sm leading-relaxed max-w-md mx-auto text-[#555]">
            Strategy · Branding · Digital Products · Experiences.
            We build things that leave a mark.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg">View Work</Button>
            <Button variant="secondary" size="lg">Get in Touch</Button>
          </div>
        </div>

        {/* Compass: locked into center 3 cols, last row */}
        <div className="hero-compass-cell">
          <NorthStarCompass />
        </div>

      </section>

      {/* ── Below-fold sections placeholder ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
        <p className="text-[10px] font-mono text-[#aaa] uppercase tracking-widest">
          {'// Design System Preview'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          <Card title="Strategy" description="Brand positioning and market fit." measurement="01" interactive>
            <Button variant="ghost" size="sm">Explore →</Button>
          </Card>
          <Card title="Products" description="Apps and digital tools built to ship." measurement="02" interactive>
            <Button variant="ghost" size="sm">Explore →</Button>
          </Card>
          <Card title="Studio" description="Design, motion, and visual systems." measurement="03" interactive>
            <Button variant="ghost" size="sm">Explore →</Button>
          </Card>
        </div>
      </section>

    </main>
  )
}
