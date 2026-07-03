import Link from "next/link";

import type {
  Campaign,
  CampaignParticipant,
  User,
} from "../types/game-table-types";

import {
  getDisplayName,
  getInitials,
  getParticipantDisplayName,
  getParticipantInitials,
} from "../utils/user-utils";

type TableSettingsPanelProps = {
  campaign: Campaign;
  user: User;
  approvedParticipants: CampaignParticipant[];
  approvedGms: CampaignParticipant[];
  approvedPlayers: CampaignParticipant[];
  isOwner: boolean;
  isGM: boolean;
  canManageCampaignInsideTable: boolean;
  canAssumeGm: boolean;
  isAssumingGm: boolean;
  onAssumeGm: () => void;
  onOpenExitModal: () => void;
  onOpenCharacterCreationMenu: () => void;
};

export function TableSettingsPanel({
  campaign,
  user,
  approvedParticipants,
  approvedGms,
  approvedPlayers,
  isOwner,
  isGM,
  canManageCampaignInsideTable,
  canAssumeGm,
  isAssumingGm,
  onAssumeGm,
  onOpenExitModal,
  onOpenCharacterCreationMenu,
}: TableSettingsPanelProps) {
  return (
    <section>
      <h2 className="text-base font-black text-forge-gold">Mesa</h2>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
          Campanha
        </p>

        <h3 className="mt-2 text-lg font-black text-white">{campaign.name}</h3>

        <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
          {campaign.description || "Sem descrição cadastrada."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
          <div className="rounded-lg border border-white/10 bg-black/25 p-3">
            <p className="text-white/35">Participantes</p>
            <p className="mt-1 text-forge-gold">{approvedParticipants.length}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/25 p-3">
            <p className="text-white/35">Visibilidade</p>
            <p className="mt-1 text-forge-gold">
              {campaign.isPublic ? "Pública" : "Privada"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
          Você
        </p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-forge-gold bg-forge-purple text-sm font-black text-forge-gold">
            {user.image ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.image})` }}
                aria-hidden="true"
              />
            ) : (
              getInitials(user)
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {getDisplayName(user)}
            </p>

            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-forge-gold">
              {isGM ? "Mestre" : "Jogador"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
          Participantes
        </p>

        <div className="mt-4 space-y-3">
          {approvedGms.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg border border-forge-gold/25 bg-forge-gold/10 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-forge-gold bg-forge-purple text-xs font-black text-forge-gold">
                {participant.user.image ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${participant.user.image})`,
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  getParticipantInitials(participant)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">
                  {getParticipantDisplayName(participant)}
                </p>

                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold">
                  Mestre
                </p>
              </div>
            </div>
          ))}

          {approvedPlayers.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 text-xs font-black text-white/65">
                {participant.user.image ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${participant.user.image})`,
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  getParticipantInitials(participant)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">
                  {getParticipantDisplayName(participant)}
                </p>

                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                  Jogador
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onOpenCharacterCreationMenu}
          className="w-full rounded-xl border border-forge-gold/50 bg-forge-purple px-4 py-3 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63]"
        >
          + Criar
        </button>

        {canAssumeGm ? (
          <button
            type="button"
            onClick={onAssumeGm}
            disabled={isAssumingGm}
            className="w-full rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAssumingGm ? "Assumindo..." : "Assumir como mestre"}
          </button>
        ) : null}

        {canManageCampaignInsideTable ? (
          <Link
            href={`/campaigns/${campaign.id}/edit`}
            className="block w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center text-sm font-black text-white/75 transition hover:border-forge-gold/60 hover:text-forge-gold"
          >
            Editar campanha
          </Link>
        ) : null}

        <button
          type="button"
          onClick={onOpenExitModal}
          className="w-full rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20"
        >
          Sair da mesa
        </button>
      </div>

      {isOwner ? (
        <p className="mt-4 rounded-xl border border-forge-gold/20 bg-forge-gold/10 p-3 text-xs font-semibold leading-relaxed text-forge-gold/80">
          Você é o dono desta campanha. Algumas ações administrativas completas
          ainda ficam na página de edição.
        </p>
      ) : null}
    </section>
  );
}