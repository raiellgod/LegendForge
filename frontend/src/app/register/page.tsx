'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/ui/header'
import { ParchmentBackground } from '@/components/ui/parchment-background'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('Você precisa aceitar os termos para continuar')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    })

    if (error) {
      setError(error.message ?? 'Erro ao criar conta')
      return
    }

    router.push('/campaigns')
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader />

      {/* CONTAINER CENTRAL */}
      <section className="flex min-h-screen items-center justify-center pt-20">
        {/* CARD */}
        <form
          onSubmit={handleRegister}
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
            Registrar
          </h1>

          {/* INPUTS */}
          <div className="flex flex-col gap-7">
            {/* USERNAME */}
            <div className="relative">
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                required
                className="peer w-full border-b-2 border-forge-purple bg-transparent py-2 text-sm font-bold text-forge-purple outline-none placeholder-transparent"
              />
              <label
                htmlFor="name"
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
                Username
              </label>
            </div>

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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full border-b-2 border-forge-purple bg-transparent py-2 text-sm font-bold text-forge-purple outline-none placeholder-transparent"
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
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full border-b-2 border-forge-purple bg-transparent py-2 text-sm font-bold text-forge-purple outline-none placeholder-transparent"
              />
              <label
                htmlFor="confirmPassword"
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
                Confirmar senha
              </label>
            </div>

            {/* CHECKBOX */}
            <label className="flex items-center gap-2 text-[11px] font-bold text-forge-purple">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 accent-forge-purple"
              />
              Li e aceito os Termos de Uso e a Política de Privacidade.
            </label>

            {/* ERRO */}
            {error && (
              <p className="text-center text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            {/* BOTÃO */}
            <Button className="h-[45px] w-full text-sm">Registrar</Button>

            {/* LINK LOGIN */}
            <p className="text-center text-xs font-bold text-forge-purple">
              Já possui conta?{' '}
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}
