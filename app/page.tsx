import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { NorthStarCompass } from '@/components/NorthStarCompass'
import { SpectralGhost } from '@/components/SpectralGhost'

export default function Home() {
  return (
    <main className="page-main">

      {/* ── Hero ── */}
      <section className="hero-section">

        {/* Ghost box: the hero visual */}
        <div className="hero-content">
          <SpectralGhost />
        </div>

        {/* Compass + scroll indicator */}
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
