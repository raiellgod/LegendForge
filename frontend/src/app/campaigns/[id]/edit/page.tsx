"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  systemId: string | null;
  isActive: boolean;
};

async function getCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`http://localhost:8081/campaigns/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar campanha");
  }

  const data = await response.json();

  return data.campaign;
}

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

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [systems, setSystems] = useState<GameSystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState("");

  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        const [campaign, systems] = await Promise.all([
          getCampaign(params.id),
          getSystems(),
        ]);

        setCampaign(campaign);
        setDescription(campaign.description ?? "");
        setCoverImage(campaign.coverImage);
        setSystems(systems);

        if (campaign.systemId) {
          setSelectedSystemId(campaign.systemId);
        } else if (systems[0]) {
          setSelectedSystemId(systems[0].id);
        }
      } catch (error) {
        console.error(error);
        router.push("/campaigns");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [params.id, router]);

  async function updateCampaignCover(image: string | null) {
    if (!campaign) {
      return;
    }

    setSavingImage(true);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coverImage: image,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar imagem");
      }

      const data = await response.json();

      setCampaign(data.campaign);
      setCoverImage(data.campaign.coverImage);
      setImageModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingImage(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result as string;
      updateCampaignCover(image);
    };

    reader.readAsDataURL(file);
  }

  async function handleSystemChange(systemId: string) {
    if (!campaign) {
      return;
    }

    if (campaign.systemId) {
      return;
    }

    setSelectedSystemId(systemId);
    setSavingSystem(true);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar sistema");
      }

      const data = await response.json();

      setCampaign(data.campaign);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSystem(false);
    }
  }

  async function handleSaveDescription() {
    if (!campaign) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: description.trim() || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar descrição");
      }

      const data = await response.json();

      setCampaign(data.campaign);
      setDescription(data.campaign.description ?? "");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSaveDescription() {
    if (!campaign) {
      return;
    }

    setSavingDescription(true);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: description.trim() || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar descrição");
      }

      const data = await response.json();

      setCampaign(data.campaign);
      setDescription(data.campaign.description ?? "");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingDescription(false);
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

  if (!user || !campaign) {
    return null;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR")
    : "10/04/2026";

  const userInitial =
    user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader variant="private" user={user} />

      <section className="relative z-10 grid min-h-screen grid-cols-[2fr_1fr] gap-10 px-[9%] pt-[115px]">
        <div className="max-w-[800px] text-forge-purple">
          {/* TODO: Revisar o tamanho e proporção da imagem de capa.
              A versão atual usa um placeholder simples para validar o fluxo de upload.
              Mais tarde, ajustar para seguir o layout final do Figma e definir melhor
              responsividade, crop, preview e armazenamento real da imagem. */}
          <div className="relative mb-4 h-[170px] w-full overflow-hidden rounded-sm bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-700">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={campaign.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-forge-gold/80">
                Imagem de capa
              </div>
            )}

            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="absolute right-4 top-4 z-20 rounded-md bg-forge-parchment px-4 py-2 text-xs font-bold text-forge-purple shadow-md hover:bg-forge-gold"
            >
              {coverImage ? "Alternar Imagem" : "Adicionar capa"}
            </button>

            {imageModalOpen && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35">
                <div className="relative w-[280px] rounded-md bg-forge-parchment p-5 text-center text-forge-purple shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(false)}
                    className="absolute right-3 top-2 text-lg font-bold text-forge-purple hover:text-red-700"
                  >
                    ×
                  </button>

                  <h2 className="mb-2 text-lg font-bold">Adicione uma capa</h2>

                  <p className="mb-1 text-[10px] font-semibold">
                    Tamanho recomendado: 1600 x 800 pixels
                  </p>

                  <p className="mb-3 text-[10px] font-semibold">
                    (JPG, PNG, GIF)
                  </p>

                  <p className="mb-3 text-xs font-bold">ou</p>

                  <label className="mx-auto flex h-[34px] w-[160px] cursor-pointer items-center justify-center rounded-md bg-forge-purple text-xs font-bold text-forge-gold hover:bg-[#3f0b61]">
                    {savingImage ? "Carregando..." : "Carregar imagem"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif"
                      onChange={handleImageChange}
                      disabled={savingImage}
                      className="hidden"
                    />
                  </label>

                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => updateCampaignCover(null)}
                      disabled={savingImage}
                      className="mt-3 text-[10px] font-bold text-red-700 hover:underline"
                    >
                      Remover imagem atual
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-none">
            {campaign.name}
          </h1>

          <div className="mb-6 flex w-full max-w-[720px] items-center justify-between">
            <Link href={`/campaigns/${campaign.id}/play`}>
              <Button className="h-[42px] w-[145px] rounded-[10px] text-xl">
                iniciar jogo
              </Button>
            </Link>

            <div className="flex items-center gap-5">
              <Button
                type="button"
                variant="outline"
                className="h-[42px] w-auto whitespace-nowrap rounded-[10px] px-5 text-sm"
              >
                Conteúdo
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-[42px] w-auto whitespace-nowrap rounded-[10px] px-5 text-sm"
              >
                Procurar por jogadores
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-[42px] w-auto whitespace-nowrap rounded-[10px] px-5 text-sm"
              >
                Configurações
              </Button>
            </div>
          </div>

          <Link
            href={`/campaigns/${campaign.id}/play`}
            className="mb-3 block text-xs font-bold text-forge-purple hover:underline"
          >
            iniciar como jogador
          </Link>

          <div className="mb-4 h-px w-full bg-forge-purple/50" />

          <div className="mb-4 flex items-center gap-4 text-xs font-bold">
            <span>jogando</span>

            <select
              aria-label="Sistema de jogo"
              value={selectedSystemId}
              onChange={(event) => handleSystemChange(event.target.value)}
              disabled={
                savingSystem ||
                systems.length === 0 ||
                Boolean(campaign.systemId)
              }
              className="h-[28px] w-[240px] rounded-md border border-forge-gold bg-forge-parchment px-3 text-xs font-bold text-forge-purple outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>

            {savingSystem && (
              <span className="text-[10px] font-bold text-forge-purple">
                Salvando sistema...
              </span>
            )}

            {campaign.systemId && !savingSystem && (
              <span className="text-[10px] font-bold text-forge-purple/70">
                Sistema definido
              </span>
            )}
          </div>

          <div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Adicione uma descrição para o jogo aqui ..."
              className="min-h-[85px] w-full resize-none border-y border-forge-purple/50 bg-transparent py-3 text-sm font-semibold text-forge-purple outline-none placeholder:text-forge-purple/70"
            />

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDescription}
                disabled={savingDescription}
                className="h-[36px] w-auto whitespace-nowrap rounded-[10px] px-5 text-xs"
              >
                {savingDescription ? "Salvando..." : "Salvar descrição"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="pt-1">
          <div className="rounded-md border border-forge-gold/70 bg-forge-parchment/20 p-5 text-forge-purple shadow-[8px_8px_0_rgba(0,0,0,0.20)] backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-bold uppercase">Forjado por</h2>

            <div className="flex items-start gap-4">
              <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-xl font-bold text-forge-gold">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "Usuário"}
                    width={76}
                    height={76}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div className="pt-1">
                <h3 className="text-2xl font-bold">{user.name ?? "Usuário"}</h3>

                <p className="mt-3 text-xs font-bold">
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
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

// TODO: Revisar o tamanho e proporção da imagem de capa.
// A versão atual usa um placeholder simples para validar o fluxo de upload.
// Mais tarde, ajustar para seguir o layout final do Figma e definir melhor
// responsividade, crop, preview e armazenamento real da imagem.
