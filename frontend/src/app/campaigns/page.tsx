"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  nextSession: {
    scheduledAt: string;
  } | null;
};

async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch("http://localhost:8081/campaigns", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar campanhas");
  }

  const data = await response.json();

  return data.campaigns;
}

function getNextSessionLabel(nextSession: Campaign["nextSession"]) {
  if (!nextSession) {
    return "Not Scheduled";
  }

  return new Date(nextSession.scheduledAt).toLocaleDateString("pt-BR");
}

export default function CampaignsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        const campaigns = await getCampaigns();
        setCampaigns(campaigns);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

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

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR")
    : "10/04/2026";

  const userInitial =
    user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  const hasCampaigns = campaigns.length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader variant="private" user={user} />

      <section className="relative z-10 min-h-screen px-[12%] pt-[120px]">
        {!hasCampaigns ? (
          <div className="flex w-[420px] flex-col gap-8 pt-[70px]">
            <Link href="/campaigns/create">
              <Button className="h-[72px] w-full text-base">
                Iniciar uma nova aventura
                <span className="ml-5">→</span>
              </Button>
            </Link>

            <Link href="/campaigns/search">
              <Button className="h-[72px] w-full text-base">
                Buscar uma aventura
                <span className="ml-5">↪</span>
              </Button>
            </Link>

            <Link href="/about">
              <Button className="h-[72px] w-full text-base">Conheça-nos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_360px] gap-16">
            <div>
              <div className="mb-14 flex justify-end gap-4 pr-4">
                <Link href="/campaigns/create">
                  <Button className="h-[52px] w-[150px] text-sm">
                    Criar aventura
                  </Button>
                </Link>

                <Link href="/campaigns/search">
                  <Button className="h-[52px] w-[150px] text-sm">
                    Buscar aventura
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6">
                {campaigns.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="w-[150px] rounded-xl bg-zinc-900 p-3 text-forge-gold shadow-[10px_10px_0_rgba(0,0,0,0.35)]"
                  >
                    <div className="mb-3 flex h-[70px] items-center justify-center overflow-hidden rounded bg-zinc-300">
                      {campaign.coverImage ? (
                        <Image
                          src={campaign.coverImage}
                          alt={campaign.name}
                          width={150}
                          height={70}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <h2 className="text-[10px] font-bold text-forge-gold">
                      Nome do mundo
                    </h2>

                    <p className="text-[10px] text-zinc-100">{campaign.name}</p>

                    <p className="text-[10px] text-zinc-100">
                      {getNextSessionLabel(campaign.nextSession)}
                    </p>

                    <Link
                      href={`/campaigns/${campaign.id}/play`}
                      className="mt-1 block text-xs text-forge-gold hover:underline"
                    >
                      Launch Game
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <aside className="flex items-start gap-5 pt-4">
              <div className="flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-2xl font-bold text-forge-gold">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "Usuário"}
                    width={90}
                    height={90}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div className="pt-2 text-forge-purple">
                <h1 className="text-3xl font-bold">{user.name ?? "Usuário"}</h1>

                <p className="mt-4 text-xs font-bold">
                  Tipo de assina. /{" "}
                  <Link
                    href="/account"
                    className="text-red-700 hover:underline"
                  >
                    Gerenciar assinatura
                  </Link>
                </p>

                <p className="mt-5 text-[10px] font-bold">
                  Membro desde: {memberSince}
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
