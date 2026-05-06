import Image from 'next/image'
import { ParchmentBackground } from '@/components/ui/parchment-background'
import { SiteHeader } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <ParchmentBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />

        <section className="flex flex-1 items-center justify-center gap-[120px] px-20 pt-[80px]">
          <div className="flex max-w-[520px] flex-col items-start gap-7">
            <h1 className="font-medieval text-[100px] font-extrabold leading-[1.02] tracking-wide text-forge-purple">
              Forje seus jogos e personagens lendários
            </h1>

            <Link href="/register">
              <Button className="h-[70px] w-[260px] text-base">
                Criar conta gratuita
              </Button>
            </Link>
          </div>

          <Image
            src="/images/logo-lf.png"
            alt="Símbolo LegendForge"
            width={800}
            height={380}
            priority
            className="h-[380px] w-[800px] object-contain"
          />
        </section>
      </div>
    </main>
  )
}
