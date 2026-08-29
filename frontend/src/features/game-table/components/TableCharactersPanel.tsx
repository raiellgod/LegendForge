import type { CampaignActor } from "../types/game-table-types";

type TableCharactersPanelProps = {
  isGM: boolean;
  myActors: CampaignActor[];
  otherPlayerActors: CampaignActor[];
  npcActors: CampaignActor[];
  creatureActors: CampaignActor[];
  canCreateTokenForActor: (actor: CampaignActor) => boolean;
  canOpenSheet: (actor: CampaignActor) => boolean;
  onOpenActions: (actor: CampaignActor) => void;
  onOpenLibrary: () => void;
  onOpenSystemLibrary: () => void;
  onOpenCharacterCreationMenu: () => void;
};

type ActorGroupSectionProps = {
  title: string;
  actors: CampaignActor[];
  isGM: boolean;
  canCreateTokenForActor: (actor: CampaignActor) => boolean;
  canOpenSheet: (actor: CampaignActor) => boolean;
  onOpenActions: (actor: CampaignActor) => void;
};

function getCharacterTypeLabel(type: CampaignActor["type"]) {
  if (type === "PLAYER_CHARACTER") {
    return "Personagem";
  }

  if (type === "NPC") {
    return "NPC";
  }

  return "Criatura";
}

function getCharacterTypeStyles(type: CampaignActor["type"]) {
  if (type === "PLAYER_CHARACTER") {
    return "border-forge-gold bg-forge-purple text-forge-gold";
  }

  if (type === "NPC") {
    return "border-purple-300/50 bg-purple-950 text-purple-100";
  }

  return "border-red-400/50 bg-red-950 text-red-100";
}

function ActorGroupSection({
  title,
  actors,
  isGM,
  canCreateTokenForActor,
  canOpenSheet,
  onOpenActions,
}: ActorGroupSectionProps) {
  if (actors.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {title}
      </p>

      <div className="mt-3 space-y-3">
        {actors.map((actor) => {
          const canCreateToken = canCreateTokenForActor(actor);
          const canOpenActorSheet = canOpenSheet(actor);

          return (
            <button
              key={actor.id}
              type="button"
              onClick={() => onOpenActions(actor)}
              className="group w-full rounded-xl border border-white/10 bg-black/30 p-3 text-left transition hover:border-forge-gold/60 hover:bg-forge-purple/20"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-black shadow-[-3px_3px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
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
                      <p className="truncate text-sm font-black text-white group-hover:text-forge-gold">
                        {actor.name}
                      </p>

                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                        {getCharacterTypeLabel(actor.type)}
                      </p>
                    </div>

                    <span className="shrink-0 text-lg font-black text-white/35 transition group-hover:text-forge-gold">
                      ⋯
                    </span>
                  </div>

                  {actor.description ? (
                    <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/50">
                      {actor.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {canOpenActorSheet ? (
                      <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
                        Ficha
                      </span>
                    ) : null}

                    {canCreateToken ? (
                      <span className="rounded-full border border-forge-gold/35 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-forge-gold">
                        Token
                      </span>
                    ) : null}

                    {isGM && actor.type !== "PLAYER_CHARACTER" ? (
                      <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45">
                        Biblioteca
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TableCharactersPanel({
  isGM,
  myActors,
  otherPlayerActors,
  npcActors,
  creatureActors,
  canCreateTokenForActor,
  canOpenSheet,
  onOpenActions,
  onOpenLibrary,
  onOpenSystemLibrary,
  onOpenCharacterCreationMenu,
}: TableCharactersPanelProps) {
  const hasAnyActor =
    myActors.length > 0 ||
    otherPlayerActors.length > 0 ||
    (isGM && npcActors.length > 0) ||
    (isGM && creatureActors.length > 0);

  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-forge-gold">Personagens</h2>
        </div>

        <div className="flex shrink-0 gap-2">
          {isGM ? (
            <>
              <button
                type="button"
                onClick={onOpenLibrary}
                className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                title="Abrir a biblioteca de NPCs e criaturas desta campanha."
              >
                Biblioteca
              </button>

              <button
                type="button"
                onClick={onOpenSystemLibrary}
                className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
                title="Abrir o conteúdo reutilizável do sistema vinculado à campanha."
              >
                Sistema
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={onOpenCharacterCreationMenu}
            className="rounded-lg border border-forge-gold/50 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple"
          >
            {isGM ? "+ Criar" : "+ Personagem"}
          </button>
        </div>
      </div>

      {!hasAnyActor ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-black text-white">
            Nenhum personagem ativo
          </p>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
            {isGM
              ? "Quando fichas forem finalizadas ou atores forem trazidos para a mesa, eles aparecerão aqui."
              : "Clique em + Personagem para criar sua ficha e entrar na campanha."}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          <ActorGroupSection
            title="Meus personagens"
            actors={myActors}
            isGM={isGM}
            canCreateTokenForActor={canCreateTokenForActor}
            canOpenSheet={canOpenSheet}
            onOpenActions={onOpenActions}
          />

          <ActorGroupSection
            title="Players"
            actors={otherPlayerActors}
            isGM={isGM}
            canCreateTokenForActor={canCreateTokenForActor}
            canOpenSheet={canOpenSheet}
            onOpenActions={onOpenActions}
          />

          {isGM ? (
            <ActorGroupSection
              title="NPCs"
              actors={npcActors}
              isGM={isGM}
              canCreateTokenForActor={canCreateTokenForActor}
              canOpenSheet={canOpenSheet}
              onOpenActions={onOpenActions}
            />
          ) : null}

          {isGM ? (
            <ActorGroupSection
              title="Criaturas"
              actors={creatureActors}
              isGM={isGM}
              canCreateTokenForActor={canCreateTokenForActor}
              canOpenSheet={canOpenSheet}
              onOpenActions={onOpenActions}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
