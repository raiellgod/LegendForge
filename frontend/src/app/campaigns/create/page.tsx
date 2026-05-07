"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ParchmentBackground } from "@/components/ui/parchment-background";
import { SiteHeader } from "@/components/ui/header";
import { authClient } from "@/lib/auth-client";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Date | string | null;
};

type GameSystem = {
  id: string;
  name: string;
  slug: string | null;
  version: number;
};

async function getSystems(): Promise<GameSystem[]> {
  const response = await fetch("http://localhost:8081/systems", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar sistemas");
  }

  const data = await response.json();

  return data.systems;
}

export default function CreateCampaignPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [systems, setSystems] = useState<GameSystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        const systems = await getSystems();

        setSystems(systems);

        if (systems[0]) {
          setSelectedSystemId(systems[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar página de criação:", error);
        setError("Não foi possível carregar os sistemas de jogo.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

  async function handleCreateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!campaignName.trim()) {
      setError("Digite um nome para o mundo.");
      return;
    }

    if (!selectedSystemId) {
      setError("Escolha um sistema de ficha.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("http://localhost:8081/campaigns", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: campaignName.trim(),
          systemId: selectedSystemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar campanha");
      }

      const data = await response.json();

      router.push(`/campaigns/${data.campaign.id}/edit`);
    } catch (error) {
      console.error(error);
      setError("Não foi possível criar a campanha.");
    } finally {
      setSubmitting(false);
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

          <label htmlFor="systemId" className="sr-only">
            Escolha a ficha de personagem
          </label>

          <select
            id="systemId"
            name="systemId"
            value={selectedSystemId}
            onChange={(event) => setSelectedSystemId(event.target.value)}
            className="h-[46px] w-full rounded-md border border-forge-gold bg-forge-parchment px-5 text-sm font-bold text-forge-purple outline-none focus:border-forge-purple"
          >
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
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
