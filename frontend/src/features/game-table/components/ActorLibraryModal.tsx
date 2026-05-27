import type { CampaignActor } from "@/features/game-table/types/game-table-types";

import {
  getCharacterTypeLabel,
  getCharacterTypeStyles,
} from "@/features/game-table/utils/actor-utils";

type ActorLibraryModalProps = {
  actors: CampaignActor[];
  onBringToTable: (actor: CampaignActor) => void | Promise<void>;
  onClose: () => void;
};

function isLibraryCompatibleActor(actor: CampaignActor) {
  return actor.type === "NPC" || actor.type === "CREATURE";
}

export function ActorLibraryModal({
  actors,
  onBringToTable,
  onClose,
}: ActorLibraryModalProps) {
  const compatibleActors = actors.filter(isLibraryCompatibleActor);
  const npcLibraryActors = compatibleActors.filter(
    (actor) => actor.type === "NPC",
  );
  const creatureLibraryActors = compatibleActors.filter(
    (actor) => actor.type === "CREATURE",
  );

  function renderLibraryActorCard(actor: CampaignActor) {
    return (
      <div
        key={actor.id}
        className="rounded-xl border border-white/10 bg-black/30 p-3"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-black shadow-[-3px_3px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
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

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {actor.name}
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                  {getCharacterTypeLabel(actor.type)}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/45">
                Biblioteca
              </span>
            </div>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
              {actor.description || "Sem descrição cadastrada."}
            </p>

            <button
              type="button"
              onClick={() => onBringToTable(actor)}
              className="mt-3 w-full rounded-lg border border-forge-gold/50 px-4 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
            >
              Trazer para a mesa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="flex max-h-[82vh] w-full max-w-md flex-col rounded-2xl border border-forge-gold/40 bg-[#120816] shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
              Biblioteca
            </p>

            <h2 className="mt-1 text-lg font-black text-forge-gold">
              Atores guardados
            </h2>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
              NPCs e criaturas guardados na campanha. Personagens de jogadores
              não entram na biblioteca: eles terão fluxo próprio de personagem
              ativo, inativo e remoção segura.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar biblioteca"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {compatibleActors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-black text-white">Biblioteca vazia</p>

              <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                A biblioteca da campanha guarda apenas NPCs e criaturas.
                Personagens de jogadores terão um fluxo próprio de ativação,
                inativação e remoção segura.
              </p>
            </div>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    NPCs guardados
                  </p>

                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/40">
                    {npcLibraryActors.length}
                  </span>
                </div>

                {npcLibraryActors.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {npcLibraryActors.map((actor) =>
                      renderLibraryActorCard(actor),
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhum NPC guardado. Futuramente, NPCs poderão vir de
                    templates prontos ou ser criados pelo mestre.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                    Criaturas e inimigos
                  </p>

                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/40">
                    {creatureLibraryActors.length}
                  </span>
                </div>

                {creatureLibraryActors.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {creatureLibraryActors.map((actor) =>
                      renderLibraryActorCard(actor),
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhuma criatura guardada. Futuramente, criaturas poderão
                    vir do bestiário do sistema ou ser criadas pelo mestre.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <p className="text-[10px] font-semibold leading-relaxed text-white/35">
            Ao trazer um ator para a mesa, a localização dele volta para TABLE.
            Isso não cria ficha nova; apenas reativa o ator na mesa da campanha.
          </p>
        </div>
      </div>
    </div>
  );
}