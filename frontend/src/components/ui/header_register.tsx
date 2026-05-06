import Image from "next/image"
import Link from "next/link"
import { Button } from "./button"

export function SiteHeader() {
  return (
    <header className="absolute left-0 top-0 z-20 flex h-[80px] w-full items-center justify-between border-2 border-black bg-forge-parchment/20 px-[73px] backdrop-blur-md">
      <Image
        src="/images/logo.png"
        alt="LegendForge"
        width={1275}
        height={80}
        priority
        className="h-[160px] w-[294px] object-contain"
      />

      <Link href="/register">
        <Button className="h-[45px] w-[170px] text-xs">
          Registrar
          </Button>
      </Link>
    </header>
  )
}