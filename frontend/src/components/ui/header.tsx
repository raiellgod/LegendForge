"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Bell, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "./button"
import { authClient } from "@/lib/auth-client"

type HeaderUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

type SiteHeaderProps = {
  variant?: "login" | "register" | "private"
  user?: HeaderUser | null
}

export function SiteHeader({ variant = "login", user }: SiteHeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "LF"

  async function handleLogout() {
    await authClient.signOut()
    router.push("/")
  }

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
      

      {variant === "login" && (
        <Link href="/login">
          <Button className="h-[45px] w-[170px] text-xs">Login</Button>
        </Link>
      )}

      {variant === "register" && (
        <Link href="/register">
          <Button className="h-[45px] w-[170px] text-xs">Registrar</Button>
        </Link>
      )}

      {variant === "private" && (
        <div className="flex items-center gap-6 text-forge-purple">
          <button type="button" aria-label="Notificações">
            <Bell size={22} />
          </button>

          <button type="button" aria-label="Mensagens">
            <Mail size={22} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-sm font-bold text-forge-gold"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Usuário"}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-44 rounded-xl border-2 border-forge-purple bg-forge-parchment p-3 text-sm font-bold text-forge-purple shadow-[8px_8px_0px_rgba(0,0,0,0.35)]">
                <Link
                  href="/account"
                  className="block rounded-lg px-3 py-2 hover:bg-forge-purple hover:text-forge-gold"
                >
                  Minha conta
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left hover:bg-forge-purple hover:text-forge-gold"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}