"use client";

import type { CharacterBuilderOptions } from "@/features/character-builder/types/character-builder-types";
import type { CreatureSheetDraft } from "@/features/game-table/types/game-table-types";

import { NpcCreatureSheetBuilderFields } from "./NpcCreatureSheetBuilderFields";

export function createEmptyCreatureSheetDraft(): CreatureSheetDraft {
  return {
    name: "",
    initials: "",
    description: "",
    location: "TABLE",
    size: "MEDIUM",
    creatureType: "",
    habitat: "",
    behavior: "",
    tactics: "",
    lore: "",
    notes: "",
    portraitUrl: "",
    tokenImageUrl: "",
    tokenImageFit: "COVER",
    armorClass: 10,
    hitPoints: 10,
    maxHitPoints: 10,
    temporaryHp: 0,
    speed: 30,
    climbSpeed: 0,
    swimSpeed: 0,
    flySpeed: 0,
    burrowSpeed: 0,
    challengeRating: "",
    experienceReward: 0,
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrowKeys: [],
    skillKeys: [],
    expertiseSkillKeys: [],
    skillOverrides: {},
    defenses: [],
    senses: [],
    languageKeys: [],
    traits: [],
    actions: [],
    attacks: [],
    multiattacks: [],
    magicalAbilities: [],
  };
}

type CreatureCreationModalProps = {
  isOpen: boolean;
  draft: CreatureSheetDraft;
  options: CharacterBuilderOptions;
  isSaving: boolean;
  error: string | null;
  onChangeDraft: (draft: CreatureSheetDraft) => void;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

export function CreatureCreationModal({
  isOpen,
  draft,
  options,
  isSaving,
  error,
  onChangeDraft,
  onSubmit,
  onClose,
}: CreatureCreationModalProps) {
  if (!isOpen) {
    return null;
  }

  const canSubmit = Boolean(draft.name.trim()) && !isSaving;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 px-4 py-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-red-400/35 bg-[#18091f] shadow-[-12px_12px_0_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-4 border-b border-red-400/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-200/70">
              5.12.22 · Builder completo
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Criar criatura/inimigo
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/45">
              Crie o CampaignActor e a CreatureSheet completa na mesma operação.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-black text-white/50 hover:border-red-400/50 hover:text-red-200"
          >
            Fechar
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {error ? (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-950/25 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </p>
          ) : null}

          <NpcCreatureSheetBuilderFields
            kind="CREATURE"
            draft={draft}
            skills={options.skills}
            languages={options.languages}
            equipment={options.equipment}
            spells={options.spells}
            onChangeDraft={(nextDraft) =>
              onChangeDraft(nextDraft as CreatureSheetDraft)
            }
          />

          <section className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-200/80">
              Classificação e comportamento
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  Tipo da criatura
                </span>
                <input
                  value={draft.creatureType}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      creatureType: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-400/60"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  Habitat
                </span>
                <input
                  value={draft.habitat}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      habitat: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-400/60"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  CR / desafio
                </span>
                <input
                  value={draft.challengeRating}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      challengeRating: event.target.value,
                    })
                  }
                  placeholder="Ex.: 1/4, 2, 10"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-400/60"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  XP
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.experienceReward}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      experienceReward: Math.max(
                        0,
                        Number.parseInt(event.target.value, 10) || 0,
                      ),
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-400/60"
                />
              </label>

              {[
                ["behavior", "Comportamento"],
                ["tactics", "Táticas"],
                ["lore", "Lore"],
                ["notes", "Notas"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                    {label}
                  </span>
                  <textarea
                    value={draft[key as keyof CreatureSheetDraft] as string}
                    onChange={(event) =>
                      onChangeDraft({
                        ...draft,
                        [key]: event.target.value,
                      })
                    }
                    className="mt-2 min-h-20 w-full resize-y rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-400/60"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-6 py-4">
          <p className="text-[10px] font-semibold text-white/30">
            A CreatureSheet permanece ligada ao ator ao mover entre Biblioteca e Mesa.
          </p>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void onSubmit()}
            className="rounded-xl border border-red-400/60 bg-red-950/30 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? "Criando ficha..." : "Criar criatura completa"}
          </button>
        </footer>
      </div>
    </div>
  );
}
