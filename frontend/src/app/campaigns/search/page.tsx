"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

type PublicCampaign = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  ownerId: string;
  systemId: string | null;
  inviteCode: string | null;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  system: {
    id: string;
    name: string;
    slug: string | null;
    version: number;
  } | null;
  playersCount: number;
  maxPlayers: number;
  availableSlots: number;
  isFull: boolean;
  canJoin: boolean;
  nextSession: {
    scheduledAt: string | null;
  } | null;
};

async function getPublicCampaigns(search?: string): Promise<PublicCampaign[]> {
  const query = search?.trim();

  const url = query
    ? `http://localhost:8081/campaigns/public?q=${encodeURIComponent(query)}`
    : "http://localhost:8081/campaigns/public";

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar aventuras públicas");
  }

  const data = await response.json();

  return data.campaigns;
}

function getDateLabel(date: string | null | undefined) {
  if (!date) {
    return "Não marcada";
  }

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDateTimeLabel(date: string | null | undefined) {
  if (!date) {
    return "Não marcada";
  }

  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitial(name?: string | null) {
  return name?.[0]?.toUpperCase() ?? "U";
}

export default function SearchCampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [search, setSearch] = useState("");
  const [inviteCode, setInviteCode] = useState(
    () => searchParams.get("inviteCode") ?? "",
  );

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [joiningCampaignId, setJoiningCampaignId] = useState<string | null>(
    null,
  );
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const campaignsPerPage = 5;

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        const campaigns = await getPublicCampaigns();
        setCampaigns(campaigns);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar as aventuras públicas.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

  const totalPages = Math.max(
    Math.ceil(campaigns.length / campaignsPerPage),
    1,
  );

  const visibleCampaigns = useMemo(() => {
    const start = (currentPage - 1) * campaignsPerPage;
    const end = start + campaignsPerPage;

    return campaigns.slice(start, end);
  }, [campaigns, currentPage]);

  async function handleSearchCampaigns(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSearching(true);
    setError("");
    setCurrentPage(1);

    try {
      const campaigns = await getPublicCampaigns(search);
      setCampaigns(campaigns);
    } catch (error) {
      console.error(error);
      setError("Erro ao pesquisar aventuras.");
    } finally {
      setSearching(false);
    }
  }

  async function handleJoinCampaign(campaignId: string) {
    setJoiningCampaignId(campaignId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:8081/campaigns/join", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Erro ao solicitar entrada");
      }

      setSuccessMessage(
        "Solicitação enviada ao forjador da campanha. Aguarde a aprovação para entrar na aventura.",
      );

      setCampaigns((currentCampaigns) =>
        currentCampaigns.filter((campaign) => campaign.id !== campaignId),
      );
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar entrada na aventura.",
      );
    } finally {
      setJoiningCampaignId(null);
    }
  }

  async function handleJoinByInviteCode(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const code = inviteCode.trim();

    if (!code) {
      setError("Digite um código de convite.");
      return;
    }

    setJoiningByCode(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8081/campaigns/join", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: code,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Código inválido ou aventura fechada");
      }

      router.push("/campaigns");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar usando este código.",
      );
    } finally {
      setJoiningByCode(false);
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

      <section className="relative z-10 min-h-screen px-[8%] pb-20 pt-[120px] text-forge-purple">
        <div className="mb-10 max-w-[980px]">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-forge-purple/70">
            Salão de Aventuras
          </p>

          <h1 className="text-5xl font-bold leading-none">Buscar aventura</h1>

          <p className="mt-4 max-w-[680px] text-sm font-semibold leading-relaxed">
            Encontre mundos abertos para participar ou use um código de convite
            enviado por um mestre.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-[1.2fr_0.8fr] gap-8">
          <form
            onSubmit={handleSearchCampaigns}
            className="rounded-md border border-forge-gold/70 bg-forge-parchment/35 p-6 shadow-[-8px_8px_0_rgba(0,0,0,0.25)] backdrop-blur-sm"
          >
            <h2 className="mb-4 text-xl font-bold">Jogos abertos</h2>

            <label
              htmlFor="campaignSearch"
              className="mb-2 block text-xs font-bold uppercase"
            >
              Buscar por nome ou descrição
            </label>

            <div className="flex gap-4">
              <input
                id="campaignSearch"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ex: Negrum Alvor, terror, fantasia..."
                className="h-[46px] flex-1 rounded-md border border-forge-purple bg-forge-parchment px-4 text-sm font-bold text-forge-purple outline-none placeholder:text-forge-purple/50 focus:border-forge-gold"
              />

              <Button
                type="submit"
                disabled={searching}
                className="h-[46px] w-[170px] rounded-[10px] text-sm"
              >
                {searching ? "Buscando..." : "Encontrar"}
              </Button>
            </div>

            <p className="mt-4 text-xs font-semibold text-forge-purple/70">
              As aventuras abaixo são campanhas públicas com vagas disponíveis
              ou lotadas, conforme definido pelo forjador.
            </p>
          </form>

          <form
            onSubmit={handleJoinByInviteCode}
            className="rounded-md border border-forge-purple/70 bg-zinc-950/80 p-6 text-white shadow-[-8px_8px_0_rgba(0,0,0,0.30)] backdrop-blur-sm"
          >
            <h2 className="mb-4 text-xl font-bold">Entrar por convite</h2>

            <label
              htmlFor="inviteCode"
              className="mb-2 block text-xs font-bold uppercase text-white/80"
            >
              Código da aventura
            </label>

            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Ex: 782e31c0"
              className="mb-4 h-[46px] w-full rounded-md border border-white/60 bg-black/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-forge-gold"
            />

            {inviteCode && (
              <p className="mb-4 text-xs font-semibold text-forge-gold">
                Código detectado. Clique em “Usar convite” para entrar na
                aventura.
              </p>
            )}

            <Button
              type="submit"
              disabled={joiningByCode}
              className="h-[46px] w-full rounded-[10px] text-sm"
            >
              {joiningByCode ? "Entrando..." : "Usar convite"}
            </Button>
          </form>
        </div>

        {error && (
          <div className="mb-8 rounded-md border border-red-700 bg-red-950/70 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-8 rounded-md border border-emerald-700 bg-emerald-950/70 px-4 py-3 text-sm font-bold text-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Aventuras abertas</h2>
            <p className="mt-2 text-sm font-semibold text-forge-purple/70">
              {campaigns.length}{" "}
              {campaigns.length === 1
                ? "campanha encontrada"
                : "campanhas encontradas"}
            </p>
          </div>

          <Link
            href="/campaigns"
            className="text-sm font-bold text-forge-purple hover:underline"
          >
            Voltar para minhas aventuras
          </Link>
        </div>

        {visibleCampaigns.length === 0 ? (
          <div className="rounded-md border border-forge-purple/50 bg-forge-parchment/35 p-8 text-center shadow-[-8px_8px_0_rgba(0,0,0,0.20)]">
            <h3 className="text-2xl font-bold">Nenhuma aventura encontrada</h3>
            <p className="mt-3 text-sm font-semibold">
              Tente outro termo de busca ou entre usando um código de convite.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleCampaigns.map((campaign) => {
              const ownerInitial = getInitial(campaign.owner.name);
              const isJoining = joiningCampaignId === campaign.id;

              return (
                <article
                  key={campaign.id}
                  className="grid grid-cols-[230px_1fr_300px] gap-6 rounded-md border border-forge-purple/60 bg-zinc-950/85 p-5 text-white shadow-[-10px_10px_0_rgba(0,0,0,0.28)] backdrop-blur-sm"
                >
                  <div className="overflow-hidden rounded-md border border-forge-gold/60 bg-forge-purple/40">
                    <div className="relative h-[145px] w-full">
                      {campaign.coverImage ? (
                        <Image
                          src={campaign.coverImage}
                          alt={campaign.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-800 text-sm font-bold text-forge-gold">
                          Sem capa
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-xl font-bold text-forge-gold">
                        {campaign.owner.image ? (
                          <Image
                            src={campaign.owner.image}
                            alt={campaign.owner.name}
                            width={68}
                            height={68}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          ownerInitial
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-white/60">
                          Forjado por
                        </p>

                        <h3 className="text-xl font-bold text-white">
                          {campaign.owner.name}
                        </h3>

                        <p className="text-xs font-semibold text-forge-gold">
                          Grátis | Assinatura padrão
                        </p>
                      </div>
                    </div>

                    <h2 className="truncate text-2xl font-bold text-purple-300">
                      {campaign.name}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm font-semibold leading-relaxed text-white/85">
                      {campaign.description ??
                        "Esta aventura ainda não possui uma descrição pública."}
                    </p>

                    <p className="mt-4 text-xs font-semibold text-white/50">
                      Publicada em {getDateLabel(campaign.createdAt)}
                    </p>
                  </div>

                  <div className="border-l border-white/15 pl-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase text-white">
                        Role Playing Game
                      </span>

                      <span
                        className={`rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${
                          campaign.isFull ? "bg-red-700" : "bg-purple-700"
                        }`}
                      >
                        {campaign.isFull ? "Lotada" : "Aceita jogadores"}
                      </span>
                    </div>

                    <dl className="space-y-2 text-sm font-bold">
                      <div>
                        <dt className="text-white/50">Sistema</dt>
                        <dd>
                          {campaign.system?.name ?? "Sistema não definido"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-white/50">Jogadores</dt>
                        <dd>
                          {campaign.playersCount}/{campaign.maxPlayers}{" "}
                          <span className="text-white/50">
                            ({campaign.availableSlots} vagas abertas)
                          </span>
                        </dd>
                      </div>

                      <div>
                        <dt className="text-white/50">Próxima sessão</dt>
                        <dd>
                          {getDateTimeLabel(campaign.nextSession?.scheduledAt)}
                        </dd>
                      </div>
                    </dl>

                    <Button
                      type="button"
                      disabled={!campaign.canJoin || isJoining}
                      onClick={() => handleJoinCampaign(campaign.id)}
                      className="mt-5 h-[46px] w-full rounded-[10px] text-sm"
                    >
                      {campaign.isFull
                        ? "Campanha lotada"
                        : isJoining
                          ? "Entrando..."
                          : "Solicitar entrada"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              className="h-10 w-10 rounded border border-forge-purple bg-forge-parchment/60 text-sm font-bold text-forge-purple disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded border text-sm font-bold ${
                    currentPage === page
                      ? "border-forge-gold bg-forge-purple text-forge-gold"
                      : "border-forge-purple bg-forge-parchment/60 text-forge-purple"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              className="h-10 w-10 rounded border border-forge-purple bg-forge-parchment/60 text-sm font-bold text-forge-purple disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
