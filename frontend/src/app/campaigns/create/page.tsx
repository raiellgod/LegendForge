"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/ui/header";
import { ParchmentBackground } from "@/components/ui/parchment-background";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Date | string | null;
};

type CharacterSheetType = "default";

export default function CreateCampaignPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [sheetType, setSheetType] = useState<CharacterSheetType>("default");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const { data } = await authClient.getSession();

      if (!data?.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadSession();
  }, [router]);

  async function handleCreateCampaign(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (!campaignName.trim()) {
    setError("Digite um nome para o mundo.")
    return
  }

  try {
    setSubmitting(true)
    setError(null)

    const response = await fetch("http://localhost:8081/campaigns", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: campaignName.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar campanha")
    }

    const data = await response.json()

    router.push(`/campaigns/${data.campaign.id}/edit`)
  } catch (error) {
    console.error(error)
    setError("Não foi possível criar a campanha.")
  } finally {
    setSubmitting(false)
  }
}
  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <ParchmentBackground />

        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg font-bold text-forge-purple">Carregando...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader variant="private" user={user} />

      <section className="relative z-10 min-h-screen px-[18%] pt-[125px]">
        <form
          onSubmit={handleCreateCampaign}
          className="w-[800px] text-forge-purple"
        >
          <h1 className="mb-7 text-4xl font-bold">Nomear novo mundo</h1>

          <input
            type="text"
            value={campaignName}
            onChange={(event) => setCampaignName(event.target.value)}
            placeholder="nome do jogo"
            className="mb-5 h-[48px] w-full rounded-md border border-forge-gold bg-forge-parchment px-5 text-base font-bold text-forge-purple outline-none placeholder:text-forge-purple/80 focus:border-forge-purple"
          />

          <Button
            type="submit"
            disabled={submitting}
            className="mb-10 h-[48px] w-full rounded-md text-base"
          >
            {submitting
              ? "Forjando mundo..."
              : "Estou pronto para Forjar meu mundo!"}
          </Button>

          {error && (
            <p className="mb-7 text-base font-bold text-red-700">{error}</p>
          )}

          <div className="mb-10 h-px w-full bg-forge-purple/50" />

          <h2 className="mb-5 text-2xl font-bold">
            Escolha a ficha de personagem
          </h2>

          <p className="mb-5 max-w-[560px] text-sm font-semibold leading-relaxed">
            As fichas oferecem a possibilidade de gerenciar atributos, status,
            magias e itens, tão qual uma ficha de papel. Atualmente temos apenas
            uma possibilidade de ficha.
          </p>

          <label htmlFor="sheetType" className="sr-only">
            Escolha a ficha de personagem
          </label>

          <select
            id="sheetType"
            name="sheetType"
            value={sheetType}
            onChange={(event) =>
              setSheetType(event.target.value as CharacterSheetType)
            }
            className="h-[46px] w-full rounded-md border border-forge-gold bg-forge-parchment px-5 text-sm font-bold text-forge-purple outline-none focus:border-forge-purple"
          >
            <option value="default">Meu sistema</option>
          </select>

          <div className="mt-10">
            <Link
              href="/campaigns"
              className="text-sm font-bold text-forge-purple hover:underline"
            >
              Voltar para minhas aventuras
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

// Esse formulário já cria campanha real usando seu POST /campaigns. Por enquanto o seletor de ficha fica visualmente pronto, mas ainda não envia sheetType para o backend porque seu endpoint de campanha ainda não espera esse campo.
