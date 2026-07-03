import type {
  CampaignActor,
  SceneToken,
} from "@/features/game-table/types/game-table-types";

import {
  getCharacterTypeStyles,
} from "@/features/game-table/utils/actor-utils";

type TokenSizeOption = {
  id: string;
  label: string;
  description: string;
  gridSize: number;
};

type ActorActionModalProps = {
  actor: CampaignActor;
  isGM: boolean;
  canOpenSheet: boolean;
  canCreateToken: boolean;
  sceneTokens: SceneToken[];
  tokenSizeOptions: readonly TokenSizeOption[];
  onOpenSheet: () => void;
  onAddToken: () => void | Promise<void>;
  onRemoveToken: (tokenId: string) => void | Promise<void>;
  onChangeTokenSize: (gridSize: number) => void | Promise<void>;
  onReturnToLibrary: () => void | Promise<void>;
  onClose: () => void;
};

const TOKEN_GRID_SIZE_IN_PIXELS = 40;

function getTokenSizeInPixels(gridSize: number) {
  return gridSize * TOKEN_GRID_SIZE_IN_PIXELS;
}

function isLibraryCompatibleActor(actor: CampaignActor) {
  return actor.type === "NPC" || actor.type === "CREATURE";
}

function isPlayerCharacterActor(actor: CampaignActor) {
  return actor.type === "PLAYER_CHARACTER";
}

export function ActorActionModal({
  actor,
  isGM,
  canOpenSheet,
  canCreateToken,
  sceneTokens,
  tokenSizeOptions,
  onOpenSheet,
  onAddToken,
  onRemoveToken,
  onChangeTokenSize,
  onReturnToLibrary,
  onClose,
}: ActorActionModalProps) {
  const canUseLibrary = isGM && isLibraryCompatibleActor(actor);
  const actorLifecycleDescription =
    actor.type === "PLAYER_CHARACTER"
      ? "Personagem de jogador"
      : actor.type === "NPC"
        ? "NPC da campanha"
        : "Criatura ou inimigo";

  const hasAnyAction = canOpenSheet || canCreateToken || canUseLibrary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-forge-gold/40 bg-[#120816] p-5 shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-base font-black shadow-[-4px_4px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                actor.type,
              )}`}
            >
              {actor.portraitUrl ? (
                <span
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${actor.portraitUrl})`,
                  }}
                  aria-hidden="true"
                />
              ) : (
                actor.initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black text-forge-gold">
                {actor.name}
              </p>

              <p className="mt-2 line-clamp-3 text-[11px] font-semibold leading-relaxed text-white/45">
                {actorLifecycleDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar ações do personagem"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-xs font-semibold leading-relaxed text-white/55">
          {actor.description ?? "Sem descrição cadastrada."}
        </p>

        <div className="mt-5 space-y-2">
          {canOpenSheet ? (
            <button
              type="button"
              onClick={onOpenSheet}
              className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-black text-purple-100 transition hover:border-forge-gold hover:text-forge-gold"
            >
              Abrir ficha
            </button>
          ) : null}

          {canCreateToken ? (
            <button
              type="button"
              onClick={onAddToken}
              className="w-full rounded-lg border border-forge-gold bg-forge-purple px-4 py-3 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63]"
            >
              Adicionar token à cena
            </button>
          ) : null}

          {canUseLibrary ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                  Biblioteca
                </p>

                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                  NPC/Criatura
                </span>
              </div>

              <button
                type="button"
                onClick={onReturnToLibrary}
                className="mt-3 w-full rounded-lg border border-forge-gold/50 px-4 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
              >
                Devolver para biblioteca
              </button>
            </div>
          ) : null}

          {isGM && isPlayerCharacterActor(actor) ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Personagem de jogador
              </p>

              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-white/45">
                Personagens de jogador não voltam para a biblioteca.
              </p>
            </div>
          ) : null}

          {!hasAnyAction ? (
            <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-xs font-semibold text-white/55">
                Você pode ver que este personagem está na mesa, mas não possui
                ações disponíveis para ele.
              </p>
            </div>
          ) : null}
        </div>

        {isGM ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                Tokens na cena
              </p>

              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/45">
                {sceneTokens.length}
              </span>
            </div>

            {sceneTokens.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-white/45">
                Nenhum token deste personagem está na cena.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {sceneTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-white">
                        {token.name} #{index + 1}
                      </p>

                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                        x {token.x} · y {token.y}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await onRemoveToken(token.id);
                      }}
                      className="shrink-0 rounded-md border border-red-500/40 px-2 py-1 text-[9px] font-black text-red-300 transition hover:bg-red-950/40"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {isGM && sceneTokens.length > 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              Tamanho do token
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {tokenSizeOptions.map((option) => {
                const sizeInPixels = getTokenSizeInPixels(option.gridSize);
                const isSelected = sceneTokens.some(
                  (token) =>
                    token.width === sizeInPixels &&
                    token.height === sizeInPixels,
                );

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChangeTokenSize(option.gridSize)}
                    title={option.description}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-forge-gold bg-forge-gold/10 text-forge-gold"
                        : "border-white/10 bg-black/30 text-white/65 hover:border-forge-gold/60 hover:text-forge-gold"
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-[0.12em]">
                      {option.label}
                    </span>

                    <span className="mt-1 block text-[10px] font-bold text-white/40">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}