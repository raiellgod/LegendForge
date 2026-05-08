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
  id: string;
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
  ownerId: string;
  systemId: string | null;
  isActive: boolean;
  isPublic: boolean;
  maxPlayers: number;
  inviteCode: string | null;
};

type CampaignParticipant = {
  id: string;
  campaignId: string;
  userId: string;
  role: "GM" | "PLAYER" | string;
  status: string;
  joinedAt: string;
  removedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
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

async function getCampaignParticipants(
  campaignId: string,
): Promise<CampaignParticipant[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/participants`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar participantes");
  }

  const data = await response.json();

  return data.participants;
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

  const [participants, setParticipants] = useState<CampaignParticipant[]>([]);
  const [participantsSearch, setParticipantsSearch] = useState("");
  const [updatingParticipantId, setUpdatingParticipantId] = useState<
    string | null
  >(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingCampaign, setDeletingCampaign] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsIsPublic, setSettingsIsPublic] = useState(false);
  const [settingsMaxPlayers, setSettingsMaxPlayers] = useState(5);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        const [campaign, systems, participants] = await Promise.all([
          getCampaign(params.id),
          getSystems(),
          getCampaignParticipants(params.id),
        ]);

        setCampaign(campaign);
        setDescription(campaign.description ?? "");
        setCoverImage(campaign.coverImage);
        setSettingsIsPublic(campaign.isPublic ?? false);
        setSettingsMaxPlayers(campaign.maxPlayers ?? 5);
        setSystems(systems);
        setParticipants(participants);

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

  async function reloadParticipants() {
    if (!campaign) {
      return;
    }

    const participants = await getCampaignParticipants(campaign.id);
    setParticipants(participants);
  }

  async function handleChangeParticipantRole(
    participantId: string,
    role: "GM" | "PLAYER",
  ) {
    if (!campaign) {
      return;
    }

    setUpdatingParticipantId(participantId);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/participants/${participantId}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao alterar função do participante");
      }

      await reloadParticipants();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingParticipantId(null);
    }
  }

  async function handleRemoveParticipant(participantId: string) {
    if (!campaign) {
      return;
    }

    const shouldRemove = window.confirm(
      "Tem certeza que deseja remover este jogador da campanha?",
    );

    if (!shouldRemove) {
      return;
    }

    setUpdatingParticipantId(participantId);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/participants/${participantId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao remover participante");
      }

      await reloadParticipants();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingParticipantId(null);
    }
  }

  async function handleCopyInviteLink() {
    if (!campaign?.inviteCode) {
      return;
    }

    const inviteLink = `${window.location.origin}/campaigns/search?inviteCode=${campaign.inviteCode}`;

    await navigator.clipboard.writeText(inviteLink);

    setInviteCopied(true);

    setTimeout(() => {
      setInviteCopied(false);
    }, 2000);
  }

  async function handleCopyInviteCode() {
    if (!campaign?.inviteCode) {
      return;
    }

    await navigator.clipboard.writeText(campaign.inviteCode);

    setInviteCodeCopied(true);

    setTimeout(() => {
      setInviteCodeCopied(false);
    }, 2000);
  }

  async function handleDeleteCampaign() {
    if (!campaign) {
      return;
    }

    if (deleteConfirmation !== campaign.name) {
      return;
    }

    setDeletingCampaign(true);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir campanha");
      }

      router.push("/campaigns");
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingCampaign(false);
    }
  }

  async function handleSaveSettings() {
    if (!campaign) {
      return;
    }

    if (settingsMaxPlayers < 1 || settingsMaxPlayers > 10) {
      return;
    }

    setSavingSettings(true);

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
            isPublic: settingsIsPublic,
            maxPlayers: settingsMaxPlayers,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      const data = await response.json();

      setCampaign(data.campaign);
      setSettingsIsPublic(data.campaign.isPublic);
      setSettingsMaxPlayers(data.campaign.maxPlayers);
      setSettingsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleUpdateParticipantStatus(
    participantId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    if (!campaign) {
      return;
    }

    setUpdatingParticipantId(participantId);

    try {
      const response = await fetch(
        `http://localhost:8081/campaigns/${campaign.id}/participants/${participantId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar solicitação");
      }

      await reloadParticipants();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingParticipantId(null);
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

  const currentUserParticipant = participants.find(
    (participant) => participant.userId === user.id,
  );

  const isOwner = campaign.ownerId === user.id;
  const isGM = currentUserParticipant?.role === "GM";

  const canInvitePlayers = isOwner || isGM;
  const canManageRoles = isOwner;
  const canRemoveParticipants = isOwner || isGM;
  const canDeleteCampaign = isOwner;

  const approvedParticipants = participants.filter(
    (participant) => participant.status === "APPROVED",
  );

  const pendingParticipants = participants.filter(
    (participant) => participant.status === "PENDING",
  );

  const filteredParticipants = approvedParticipants.filter((participant) => {
    const search = participantsSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      participant.user.name.toLowerCase().includes(search) ||
      participant.user.email.toLowerCase().includes(search)
    );
  });

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR")
    : "10/04/2026";

  const userInitial =
    user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  const playersCount = participants.filter(
    (participant) => participant.role === "PLAYER",
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParchmentBackground />
      <SiteHeader variant="private" user={user} />

      <section className="relative z-10 grid min-h-screen grid-cols-[2fr_1fr] gap-10 px-[9%] pt-[115px]">
        <div className="max-w-[800px] text-forge-purple ">
          {/* TODO: Revisar o tamanho e proporção da imagem de capa.
              A versão atual usa um placeholder simples para validar o fluxo de upload.
              Mais tarde, ajustar para seguir o layout final do Figma e definir melhor
              responsividade, crop, preview e armazenamento real da imagem. */}
          <div className="relative mb-4 h-[220px] w-full overflow-hidden rounded-sm bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-700 shadow-[-8px_8px_0_rgba(0,0,0,0.20)]">
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
                onClick={() => setSettingsModalOpen(true)}
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

        <aside className="space-y-5 pt-1">
          <div className="rounded-md border border-forge-gold/70 bg-zinc-950/80 p-5 text-white shadow-[-8px_8px_0_rgba(0,0,0,0.20)] backdrop-blur-sm">
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

                <p className="mt-1 text-xs font-bold">
                  Grátis |{" "}
                  <Link
                    href="/account"
                    className="text-forge-gold hover:underline"
                  >
                    Gerenciar assinatura
                  </Link>
                </p>

                <p className="mt-2 text-sm font-bold">
                  Membro desde: {memberSince}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-forge-purple/80 bg-zinc-900/90 p-5 text-white shadow-[-8px_8px_0_rgba(0,0,0,0.20)] backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold uppercase">Participantes</h2>

              {canInvitePlayers && (
                <Button
                  type="button"
                  onClick={() => setInviteModalOpen(true)}
                  className="h-[42px] w-auto rounded-md px-4 text-sm"
                >
                  Convidar jogadores
                </Button>
              )}
            </div>

            <div className="mb-6 flex gap-3">
              <input
                type="text"
                value={participantsSearch}
                onChange={(event) => setParticipantsSearch(event.target.value)}
                placeholder="Pesquisar jogadores..."
                className="h-[42px] flex-1 rounded-md border border-white/80 bg-black/70 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/50 focus:border-forge-gold"
              />

              <button
                type="button"
                className="flex h-[42px] w-[42px] items-center justify-center rounded-md border border-forge-purple bg-black/50 text-lg font-bold text-white hover:bg-forge-purple"
                aria-label="Ordenar jogadores"
              >
                ≡
              </button>
            </div>

            {canInvitePlayers && pendingParticipants.length > 0 && (
              <div className="mb-6 rounded-md border border-forge-gold/60 bg-black/40 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase text-forge-gold">
                  Solicitações pendentes
                </h3>

                <div className="space-y-3">
                  {pendingParticipants.map((participant) => {
                    const participantInitial =
                      participant.user.name?.[0]?.toUpperCase() ??
                      participant.user.email?.[0]?.toUpperCase() ??
                      "U";

                    const isUpdating = updatingParticipantId === participant.id;

                    return (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-zinc-950/70 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-forge-gold bg-forge-purple text-sm font-bold text-forge-gold">
                            {participant.user.image ? (
                              <Image
                                src={participant.user.image}
                                alt={participant.user.name}
                                width={42}
                                height={42}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              participantInitial
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {participant.user.name}
                            </p>
                            <p className="truncate text-[10px] font-semibold text-white/50">
                              {participant.user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateParticipantStatus(
                                participant.id,
                                "APPROVED",
                              )
                            }
                            className="rounded-md border border-emerald-600 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900 disabled:opacity-50"
                          >
                            Aprovar
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateParticipantStatus(
                                participant.id,
                                "REJECTED",
                              )
                            }
                            className="rounded-md border border-red-700 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-950 disabled:opacity-50"
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-5">
              {filteredParticipants.map((participant) => {
                const participantInitial =
                  participant.user.name?.[0]?.toUpperCase() ??
                  participant.user.email?.[0]?.toUpperCase() ??
                  "U";

                const isUpdating = updatingParticipantId === participant.id;
                const isGM = participant.role === "GM";

                return (
                  <div key={participant.id} className="group relative w-[92px]">
                    <div className="flex flex-col items-center">
                      <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-2 border-forge-gold bg-forge-purple text-xl font-bold text-forge-gold">
                        {participant.user.image ? (
                          <Image
                            src={participant.user.image}
                            alt={participant.user.name}
                            width={72}
                            height={72}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          participantInitial
                        )}
                      </div>

                      <p className="mt-2 max-w-[92px] truncate text-center text-sm font-bold text-purple-300">
                        {participant.user.name}
                      </p>

                      <p className="text-[10px] font-bold uppercase text-forge-gold">
                        {participant.role}
                      </p>
                    </div>

                    <div className="absolute left-1/2 top-[64px] z-20 hidden w-[150px] -translate-x-1/2 rounded border border-black bg-zinc-950 p-2 text-xs font-bold shadow-lg group-hover:block">
                      {canManageRoles && (
                        <>
                          {isGM ? (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleChangeParticipantRole(
                                  participant.id,
                                  "PLAYER",
                                )
                              }
                              className="block w-full rounded px-2 py-1 text-left text-purple-300 hover:bg-zinc-800 disabled:opacity-50"
                            >
                              Remover GM
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleChangeParticipantRole(
                                  participant.id,
                                  "GM",
                                )
                              }
                              className="block w-full rounded px-2 py-1 text-left text-purple-300 hover:bg-zinc-800 disabled:opacity-50"
                            >
                              Promover a GM
                            </button>
                          )}
                        </>
                      )}

                      {canRemoveParticipants && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }
                          className="mt-1 block w-full rounded px-2 py-1 text-left text-red-300 hover:bg-zinc-800 disabled:opacity-50"
                        >
                          Expulsar do jogo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredParticipants.length === 0 && (
              <p className="text-sm font-semibold text-white/60">
                Nenhum jogador encontrado.
              </p>
            )}
          </div>
        </aside>
        <div className="mt-10 flex items-center gap-5">
          <Link href="/campaigns">
            <Button
              type="button"
              variant="outline"
              className="h-[42px] w-auto whitespace-nowrap rounded-[10px] px-5 text-sm"
            >
              Voltar para minhas aventuras
            </Button>
          </Link>
        </div>
      </section>

      {inviteModalOpen && campaign.inviteCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[520px] rounded-md border border-forge-gold bg-zinc-950 p-6 text-white shadow-[-10px_10px_0_rgba(0,0,0,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-forge-gold">
                  Convidar jogadores
                </h2>

                <p className="mt-2 text-sm font-semibold text-white/70">
                  Envie este código ou link para quem você deseja convidar para
                  esta campanha.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-2xl font-bold text-white/70 hover:text-forge-gold"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <label className="mb-2 block text-xs font-bold uppercase text-white/60">
              Código de convite
            </label>

            <div className="mb-5 flex gap-3">
              <div className="flex-1 rounded-md border border-forge-purple bg-black/60 px-4 py-3 text-lg font-bold tracking-[0.25em] text-forge-gold">
                {campaign.inviteCode}
              </div>

              <Button
                type="button"
                onClick={handleCopyInviteCode}
                className="h-auto w-auto rounded-[10px] px-5 text-sm"
              >
                {inviteCodeCopied ? "Copiado!" : "Copiar código"}
              </Button>
            </div>

            <label className="mb-2 block text-xs font-bold uppercase text-white/60">
              Link de convite
            </label>

            <div className="mb-5 break-all rounded-md border border-white/20 bg-black/60 px-4 py-3 text-sm font-semibold text-white/80">
              {`${window.location.origin}/campaigns/search?inviteCode=${campaign.inviteCode}`}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                Fechar
              </Button>

              <Button
                type="button"
                onClick={handleCopyInviteLink}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                {inviteCopied ? "Copiado!" : "Copiar convite"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[520px] rounded-md border border-red-800 bg-zinc-950 p-6 text-white shadow-[-10px_10px_0_rgba(0,0,0,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-red-400">
                  Excluir campanha
                </h2>

                <p className="mt-2 text-sm font-semibold text-white/70">
                  Esta ação é permanente. Todos os dados desta campanha serão
                  removidos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                className="text-2xl font-bold text-white/70 hover:text-red-400"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <p className="mb-3 text-sm font-semibold text-white/80">
              Para confirmar, digite exatamente:
            </p>

            <div className="mb-4 rounded-md border border-red-800 bg-black/60 px-4 py-3 text-sm font-bold text-red-300">
              {campaign.name}
            </div>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Digite o nome da campanha"
              className="mb-5 h-[46px] w-full rounded-md border border-white/30 bg-black/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-red-500"
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                Cancelar
              </Button>

              <button
                type="button"
                disabled={
                  deleteConfirmation !== campaign.name || deletingCampaign
                }
                onClick={handleDeleteCampaign}
                className="h-[42px] rounded-[10px] border-2 border-red-700 bg-red-800 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingCampaign ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[520px] rounded-md border border-red-800 bg-zinc-950 p-6 text-white shadow-[-10px_10px_0_rgba(0,0,0,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-red-400">
                  Excluir campanha
                </h2>

                <p className="mt-2 text-sm font-semibold text-white/70">
                  Esta ação é permanente. Todos os dados desta campanha serão
                  removidos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                className="text-2xl font-bold text-white/70 hover:text-red-400"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <p className="mb-3 text-sm font-semibold text-white/80">
              Para confirmar, digite exatamente o nome desta campanha:
            </p>

            {/* <div className="mb-4 rounded-md border border-red-800 bg-black/60 px-4 py-3 text-sm font-bold text-red-300">
              {campaign.name}
            </div> */}

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Digite o nome da campanha"
              className="mb-5 h-[46px] w-full rounded-md border border-white/30 bg-black/70 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-red-500"
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                Cancelar
              </Button>

              <button
                type="button"
                disabled={
                  deleteConfirmation !== campaign.name || deletingCampaign
                }
                onClick={handleDeleteCampaign}
                className="h-[42px] rounded-[10px] border-2 border-red-700 bg-red-800 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingCampaign ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
      {settingsModalOpen && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[620px] rounded-md border border-forge-gold bg-zinc-950 p-6 text-white shadow-[-10px_10px_0_rgba(0,0,0,0.35)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-forge-gold">
                  Configurações da campanha
                </h2>

                <p className="mt-2 text-sm font-semibold text-white/70">
                  Ajuste as opções principais da aventura.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="text-2xl font-bold text-white/70 hover:text-forge-gold"
                aria-label="Fechar configurações"
              >
                ×
              </button>
            </div>

            <div className="space-y-7">
              <section>
                <h3 className="mb-2 text-sm font-bold uppercase text-white">
                  1. Visibilidade
                </h3>

                <p className="mb-3 text-xs font-semibold text-white/60">
                  Defina se outros jogadores poderão encontrar esta campanha na
                  busca.
                </p>

                <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/20 bg-black/50">
                  <button
                    type="button"
                    onClick={() => setSettingsIsPublic(true)}
                    className={`h-[46px] text-sm font-bold transition ${
                      settingsIsPublic
                        ? "border border-forge-gold bg-forge-purple text-forge-gold"
                        : "text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Pública
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsIsPublic(false)}
                    className={`h-[46px] text-sm font-bold transition ${
                      !settingsIsPublic
                        ? "border border-forge-gold bg-forge-purple text-forge-gold"
                        : "text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Privada
                  </button>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-bold uppercase text-white">
                  2. Limite de jogadores
                </h3>

                <p className="mb-3 text-xs font-semibold text-white/60">
                  Defina o número máximo de jogadores permitidos na campanha.
                </p>

                <input
                  aria-label="Limite de jogadores"
                  type="number"
                  min={1}
                  max={10}
                  value={settingsMaxPlayers}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (Number.isNaN(value)) {
                      setSettingsMaxPlayers(1);
                      return;
                    }

                    setSettingsMaxPlayers(value);
                  }}
                  className="h-[44px] w-[120px] rounded-md border border-white/30 bg-black/70 px-4 text-sm font-bold text-white outline-none focus:border-forge-gold"
                />

                <p className="mt-2 text-[11px] font-semibold text-white/50">
                  Mínimo 1, máximo 10 jogadores.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-bold uppercase text-white">
                  3. Convite
                </h3>

                <p className="mb-3 text-xs font-semibold text-white/60">
                  Use o botão “Convidar jogadores” na lateral para copiar código
                  ou link da campanha.
                </p>

                <div className="rounded-md border border-white/15 bg-black/50 px-4 py-3 text-sm font-bold text-forge-gold">
                  {campaign.inviteCode ?? "Convite indisponível"}
                </div>
              </section>

              <section className="rounded-md border border-red-800 bg-red-950/20 p-4">
                <h3 className="mb-2 text-sm font-bold uppercase text-red-300">
                  4. Zona de perigo
                </h3>

                <p className="mb-4 text-xs font-semibold text-white/60">
                  Ações irreversíveis. Use com cuidado.
                </p>

                {canDeleteCampaign && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSettingsModalOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="h-[42px] w-auto whitespace-nowrap rounded-[10px] border-red-800 px-5 text-sm text-red-300 hover:bg-red-800 hover:text-white"
                  >
                    Excluir campanha
                  </Button>
                )}
              </section>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSettingsIsPublic(campaign.isPublic);
                  setSettingsMaxPlayers(campaign.maxPlayers);
                  setSettingsModalOpen(false);
                }}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                Fechar
              </Button>

              <Button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="h-[42px] w-auto rounded-[10px] px-5 text-sm"
              >
                {savingSettings ? "Salvando..." : "Salvar configurações"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// TODO: Revisar o tamanho e proporção da imagem de capa.
// A versão atual usa um placeholder simples para validar o fluxo de upload.
// Mais tarde, ajustar para seguir o layout final do Figma e definir melhor
// responsividade, crop, preview e armazenamento real da imagem.
