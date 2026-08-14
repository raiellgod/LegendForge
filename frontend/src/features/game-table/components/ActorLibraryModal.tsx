import type { CampaignActor } from "@/features/game-table/types/game-table-types";

import {
  getCharacterTypeLabel,
  getCharacterTypeStyles,
} from "@/features/game-table/utils/actor-utils";

type ActorLibraryModalProps = {
  actors: CampaignActor[];
  archivedActors: CampaignActor[];
  onBringToTable: (actor: CampaignActor) => void | Promise<void>;
  onArchive: (actor: CampaignActor) => void | Promise<void>;
  onRestore: (actor: CampaignActor) => void | Promise<void>;
  onClose: () => void;
};

function isLibraryActor(actor: CampaignActor) {
  return (
    actor.location === "LIBRARY" &&
    (actor.type === "NPC" || actor.type === "CREATURE")
  );
}

function isArchivedActor(actor: CampaignActor) {
  return (
    actor.location === "ARCHIVED" &&
    (actor.type === "NPC" || actor.type === "CREATURE")
  );
}

function formatActorDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

export function ActorLibraryModal({
  actors,
  archivedActors,
  onBringToTable,
  onArchive,
  onRestore,
  onClose,
}: ActorLibraryModalProps) {
  const compatibleActors = actors.filter(isLibraryActor);
  const compatibleArchivedActors = archivedActors.filter(isArchivedActor);

  const npcLibraryActors = compatibleActors.filter(
    (actor) => actor.type === "NPC",
  );
  const creatureLibraryActors = compatibleActors.filter(
    (actor) => actor.type === "CREATURE",
  );

  const archivedNpcActors = compatibleArchivedActors.filter(
    (actor) => actor.type === "NPC",
  );
  const archivedCreatureActors = compatibleArchivedActors.filter(
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

            <p
              className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
              title={actor.description || "Sem descrição cadastrada."}
            >
              {actor.description || "Sem descrição cadastrada."}
            </p>

            <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:text-forge-gold">
                Ver detalhes
              </summary>

              <div className="mt-3 space-y-3 text-xs font-semibold leading-relaxed text-white/55">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                      Tipo
                    </p>
                    <p className="mt-1 text-white/70">
                      {getCharacterTypeLabel(actor.type)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                      Estado
                    </p>
                    <p className="mt-1 text-white/70">Biblioteca ativa</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                      Criado em
                    </p>
                    <p className="mt-1 text-white/70">
                      {formatActorDate(actor.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                      Atualizado em
                    </p>
                    <p className="mt-1 text-white/70">
                      {formatActorDate(actor.updatedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                    Descrição completa
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-white/65">
                    {actor.description || "Sem descrição cadastrada."}
                  </p>
                </div>
              </div>
            </details>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onBringToTable(actor)}
                className="rounded-lg border border-forge-gold/50 px-4 py-2 text-[11px] font-black text-forge-gold transition hover:bg-forge-purple"
              >
                Trazer para a mesa
              </button>

              <button
                type="button"
                onClick={() => onArchive(actor)}
                className="rounded-lg border border-white/15 px-4 py-2 text-[11px] font-black text-white/55 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderArchivedActorCard(actor: CampaignActor) {
    return (
      <div
        key={actor.id}
        className="rounded-xl border border-white/10 bg-black/20 p-3 opacity-80"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-black shadow-[-3px_3px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
              actor.type,
            )}`}
          >
            {actor.portraitUrl ? (
              <span
                className="h-full w-full bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${actor.portraitUrl})` }}
                aria-hidden="true"
              />
            ) : (
              actor.initials
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white/75">
                  {actor.name}
                </p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                  {getCharacterTypeLabel(actor.type)}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/35">
                Arquivado
              </span>
            </div>

            <p
              className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/45"
              title={actor.description || "Sem descrição cadastrada."}
            >
              {actor.description || "Sem descrição cadastrada."}
            </p>

            <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/35 transition hover:text-forge-gold">
                Ver detalhes
              </summary>

              <div className="mt-3 space-y-3 text-xs font-semibold leading-relaxed text-white/45">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">
                      Tipo
                    </p>
                    <p className="mt-1 text-white/60">
                      {getCharacterTypeLabel(actor.type)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">
                      Estado
                    </p>
                    <p className="mt-1 text-white/60">Arquivado</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">
                      Criado em
                    </p>
                    <p className="mt-1 text-white/60">
                      {formatActorDate(actor.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">
                      Atualizado em
                    </p>
                    <p className="mt-1 text-white/60">
                      {formatActorDate(actor.updatedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">
                    Descrição completa
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-white/55">
                    {actor.description || "Sem descrição cadastrada."}
                  </p>
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={() => onRestore(actor)}
              className="mt-3 w-full rounded-lg border border-forge-gold/35 px-4 py-2 text-[11px] font-black text-forge-gold/80 transition hover:border-forge-gold/60 hover:bg-forge-purple hover:text-forge-gold"
            >
              Restaurar para a biblioteca
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="flex max-h-[86vh] w-full max-w-2xl flex-col rounded-2xl border border-forge-gold/40 bg-[#120816] shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
              Biblioteca da campanha
            </p>

            <h2 className="mt-1 text-lg font-black text-forge-gold">
              NPCs e criaturas
            </h2>

            <p className="mt-2 max-w-xl text-xs font-semibold leading-relaxed text-white/55">
              Atores em uso ficam na Biblioteca. Atores que você deseja preservar
              sem manter no fluxo normal podem ser arquivados e restaurados depois.
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

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <section>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold">
                  Biblioteca ativa
                </p>
                <p className="mt-1 text-xs font-semibold text-white/40">
                  Prontos para serem enviados à mesa.
                </p>
              </div>

              <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2.5 py-1 text-[10px] font-black text-forge-gold">
                {compatibleActors.length}
              </span>
            </div>

            {compatibleActors.length === 0 ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-black text-white">Biblioteca vazia</p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
                  Nenhum NPC ou criatura está guardado na biblioteca ativa.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      NPCs guardados
                    </p>
                    <span className="text-[10px] font-black text-white/35">
                      {npcLibraryActors.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {npcLibraryActors.length > 0 ? (
                      npcLibraryActors.map(renderLibraryActorCard)
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold text-white/40">
                        Nenhum NPC guardado.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      Criaturas
                    </p>
                    <span className="text-[10px] font-black text-white/35">
                      {creatureLibraryActors.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {creatureLibraryActors.length > 0 ? (
                      creatureLibraryActors.map(renderLibraryActorCard)
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold text-white/40">
                        Nenhuma criatura guardada.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </section>

          <section className="mt-7 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Arquivados
                </p>
                <p className="mt-1 text-xs font-semibold text-white/35">
                  Preservados fora do fluxo normal da campanha.
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black text-white/40">
                {compatibleArchivedActors.length}
              </span>
            </div>

            {compatibleArchivedActors.length === 0 ? (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs font-semibold leading-relaxed text-white/40">
                Nenhum NPC ou criatura arquivado.
              </p>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                    NPCs arquivados · {archivedNpcActors.length}
                  </p>
                  <div className="mt-3 space-y-3">
                    {archivedNpcActors.map(renderArchivedActorCard)}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                    Criaturas arquivadas · {archivedCreatureActors.length}
                  </p>
                  <div className="mt-3 space-y-3">
                    {archivedCreatureActors.map(renderArchivedActorCard)}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <p className="text-[10px] font-semibold leading-relaxed text-white/35">
            Trazer para a mesa muda o ator para TABLE. Arquivar muda para ARCHIVED.
            Restaurar devolve para LIBRARY. Nenhuma dessas ações cria uma ficha nova.
          </p>
        </div>
      </div>
    </div>
  );
}