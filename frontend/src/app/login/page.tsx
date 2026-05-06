'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/ui/header_register'
import { ParchmentBackground } from '@/components/ui/parchment-background'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setError(error.message ?? 'Erro ao fazer login')
      return
    }

    router.push('/campaigns')
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader />

      {/* CONTAINER */}
      <section className="flex min-h-screen items-center justify-center pt-20">
        {/* CARD */}
        <form
          onSubmit={handleLogin}
          className="
            relative
            w-[400px]
            rounded-[20px]
            border-2 border-forge-purple
            bg-forge-parchment/20
            px-10 pt-10 pb-8
            backdrop-blur-md
            shadow-[-10px_10px_10px_rgba(0,0,0,0.4)]
          "
        >
          {/* BOTÃO FECHAR */}
          <Link
            href="/"
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-forge-purple text-forge-gold transition hover:shadow-gold"
          >
            ✕
          </Link>

          {/* TÍTULO */}
          <h1 className="mb-10 text-center font-medieval text-4xl text-forge-purple">
            Login
          </h1>

          {/* FORM */}
          <div className="flex flex-col gap-7">
            {/* EMAIL */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="peer w-full border-b-2 border-forge-purple bg-transparent py-2 text-sm font-bold text-forge-purple outline-none placeholder-transparent"
              />
              <label
                htmlFor="email"
                className="
absolute left-0 top-2 text-sm font-bold text-forge-purple transition-all

peer-placeholder-shown:top-2
peer-placeholder-shown:text-sm

peer-focus:-top-4
peer-focus:text-xs

peer-not-placeholder-shown:-top-4
peer-not-placeholder-shown:text-xs
"
              >
                Email
              </label>
            </div>

            {/* SENHA */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full border-b-2 border-forge-purple bg-transparent py-2 pr-10 text-sm font-bold text-forge-purple outline-none placeholder-transparent"
              />
              <label
                htmlFor="password"
                className="
absolute left-0 top-2 text-sm font-bold text-forge-purple transition-all

peer-placeholder-shown:top-2
peer-placeholder-shown:text-sm

peer-focus:-top-4
peer-focus:text-xs

peer-not-placeholder-shown:-top-4
peer-not-placeholder-shown:text-xs
"
              >
                Senha
              </label>

              {/* BOTÃO OLHO */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2 text-xs text-forge-purple"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* LEMBRE / ESQUECEU */}
            <div className="flex items-center justify-between text-[11px] font-bold text-forge-purple">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-forge-purple"
                />
                Lembre de mim
              </label>

              <Link href="#" className="hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            {/* ERRO */}
            {error && (
              <p className="text-center text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            {/* BOTÃO */}
            <Button className="h-[45px] w-full text-sm">Login</Button>

            {/* LINK REGISTER */}
            <p className="text-center text-xs font-bold text-forge-purple">
              Não possui uma conta?{' '}
              <Link href="/register" className="hover:underline">
                Registrar-se
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}
