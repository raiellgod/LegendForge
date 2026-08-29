"use client";

import type { CharacterBuilderOptions } from "@/features/character-builder/types/character-builder-types";
import type { NpcSheetDraft } from "@/features/game-table/types/game-table-types";

import { NpcCreatureSheetBuilderFields } from "./NpcCreatureSheetBuilderFields";

export function createEmptyNpcSheetDraft(): NpcSheetDraft {
  return {
    name: "",
    initials: "",
    description: "",
    location: "TABLE",
    size: "MEDIUM",
    ancestryId: "",
    subAncestryId: "",
    backgroundId: "",
    classes: [],
    role: "",
    faction: "",
    personality: "",
    motivation: "",
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

type NpcCreationModalProps = {
  isOpen: boolean;
  draft: NpcSheetDraft;
  options: CharacterBuilderOptions;
  isSaving: boolean;
  error: string | null;
  onChangeDraft: (draft: NpcSheetDraft) => void;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

export function NpcCreationModal({
  isOpen,
  draft,
  options,
  isSaving,
  error,
  onChangeDraft,
  onSubmit,
  onClose,
}: NpcCreationModalProps) {
  if (!isOpen) {
    return null;
  }

  const canSubmit = Boolean(draft.name.trim()) && !isSaving;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 px-4 py-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-forge-gold/35 bg-[#18091f] shadow-[-12px_12px_0_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-4 border-b border-forge-gold/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forge-gold/70">
              5.12.21 · Builder completo
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-100">
              Criar NPC da campanha
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/45">
              Crie o CampaignActor e a NpcSheet completa na mesma operação.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-black text-white/50 hover:border-forge-gold/50 hover:text-forge-gold"
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
            kind="NPC"
            draft={draft}
            skills={options.skills}
            languages={options.languages}
            equipment={options.equipment}
            spells={options.spells}
            onChangeDraft={(nextDraft) =>
              onChangeDraft(nextDraft as NpcSheetDraft)
            }
          />

          <section className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
                  Origem e treinamento · opcional
                </p>
                <p className="mt-1 text-xs font-semibold text-white/35">
                  Use estes campos quando o NPC seguir ancestralidade,
                  antecedente e classes do sistema. O statblock continua sendo
                  a fonte mecânica final.
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-black uppercase text-white/30">
                Não obrigatório
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  Ancestralidade
                </span>
                <select
                  value={draft.ancestryId}
                  onChange={(event) => {
                    const ancestryId = event.target.value;
                    const currentSubAncestry = (
                      options.subAncestries ?? []
                    ).find((entry) => entry.id === draft.subAncestryId);

                    onChangeDraft({
                      ...draft,
                      ancestryId,
                      subAncestryId:
                        currentSubAncestry?.ancestryId === ancestryId
                          ? draft.subAncestryId
                          : "",
                    });
                  }}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
                >
                  <option value="">Sem ancestralidade</option>
                  {options.ancestries.map((ancestry) => (
                    <option key={ancestry.id} value={ancestry.id}>
                      {ancestry.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  Sub-ancestralidade
                </span>
                <select
                  value={draft.subAncestryId}
                  disabled={!draft.ancestryId}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      subAncestryId: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60 disabled:opacity-40"
                >
                  <option value="">Sem sub-ancestralidade</option>
                  {(options.subAncestries ?? [])
                    .filter(
                      (subAncestry) =>
                        subAncestry.ancestryId === draft.ancestryId,
                    )
                    .map((subAncestry) => (
                      <option key={subAncestry.id} value={subAncestry.id}>
                        {subAncestry.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                  Antecedente
                </span>
                <select
                  value={draft.backgroundId}
                  onChange={(event) =>
                    onChangeDraft({
                      ...draft,
                      backgroundId: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
                >
                  <option value="">Sem antecedente</option>
                  {options.backgrounds.map((background) => (
                    <option key={background.id} value={background.id}>
                      {background.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                    Classes / subclasses
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-white/25">
                    Opcional. A soma dos níveis não pode ultrapassar 20.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextClass = options.classes.find(
                      (classOption) =>
                        !draft.classes.some(
                          (entry) => entry.classId === classOption.id,
                        ),
                    );

                    if (!nextClass) {
                      return;
                    }

                    onChangeDraft({
                      ...draft,
                      classes: [
                        ...draft.classes,
                        {
                          classId: nextClass.id,
                          subclassId: "",
                          level: 1,
                          isPrimary: draft.classes.length === 0,
                        },
                      ],
                    });
                  }}
                  className="rounded-lg border border-forge-gold/30 px-3 py-2 text-[10px] font-black text-forge-gold hover:bg-forge-purple/30"
                >
                  + Adicionar classe
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {draft.classes.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs font-semibold text-white/25">
                    Nenhuma classe definida. O NPC funcionará apenas pelo
                    statblock.
                  </p>
                ) : (
                  draft.classes.map((classEntry, index) => {
                    const selectedClass = options.classes.find(
                      (classOption) =>
                        classOption.id === classEntry.classId,
                    );

                    const subclassSelectionLevel =
                      selectedClass?.subclassSelectionLevel ?? null;

                    const canSelectSubclass =
                      subclassSelectionLevel !== null &&
                      classEntry.level >= subclassSelectionLevel;

                    return (
                      <div
                        key={`${classEntry.classId}-${index}`}
                        className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_1fr_100px_auto_auto]"
                      >
                        <select
                          value={classEntry.classId}
                          onChange={(event) => {
                            const classes = [...draft.classes];
                            classes[index] = {
                              ...classEntry,
                              classId: event.target.value,
                              subclassId: "",
                            };
                            onChangeDraft({ ...draft, classes });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
                        >
                          {options.classes.map((classOption) => (
                            <option
                              key={classOption.id}
                              value={classOption.id}
                              disabled={draft.classes.some(
                                (entry, currentIndex) =>
                                  currentIndex !== index &&
                                  entry.classId === classOption.id,
                              )}
                            >
                              {classOption.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={canSelectSubclass ? classEntry.subclassId : ""}
                          disabled={!canSelectSubclass}
                          onChange={(event) => {
                            const classes = [...draft.classes];
                            classes[index] = {
                              ...classEntry,
                              subclassId: event.target.value,
                            };
                            onChangeDraft({ ...draft, classes });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <option value="">
                            {subclassSelectionLevel === null
                              ? "Classe sem seleção de subclasse"
                              : canSelectSubclass
                                ? "Sem subclasse"
                                : `Disponível no nível ${subclassSelectionLevel}`}
                          </option>
                          {canSelectSubclass
                            ? (selectedClass?.subclasses ?? []).map(
                                (subclass) => (
                                  <option key={subclass.id} value={subclass.id}>
                                    {subclass.name}
                                  </option>
                                ),
                              )
                            : null}
                        </select>

                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={classEntry.level}
                          onChange={(event) => {
                            const nextLevel = Math.max(
                              1,
                              Math.min(
                                20,
                                Number.parseInt(event.target.value, 10) || 1,
                              ),
                            );

                            const minimumSubclassLevel =
                              selectedClass?.subclassSelectionLevel ?? null;

                            const classes = [...draft.classes];
                            classes[index] = {
                              ...classEntry,
                              level: nextLevel,
                              subclassId:
                                minimumSubclassLevel !== null &&
                                nextLevel >= minimumSubclassLevel
                                  ? classEntry.subclassId
                                  : "",
                            };
                            onChangeDraft({ ...draft, classes });
                          }}
                          className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
                        />

                        <label className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/45">
                          <input
                            type="radio"
                            name="npc-primary-class"
                            checked={classEntry.isPrimary}
                            onChange={() => {
                              onChangeDraft({
                                ...draft,
                                classes: draft.classes.map(
                                  (entry, currentIndex) => ({
                                    ...entry,
                                    isPrimary: currentIndex === index,
                                  }),
                                ),
                              });
                            }}
                          />
                          Principal
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const remaining = draft.classes.filter(
                              (_, currentIndex) => currentIndex !== index,
                            );

                            if (
                              classEntry.isPrimary &&
                              remaining.length > 0
                            ) {
                              remaining[0] = {
                                ...remaining[0],
                                isPrimary: true,
                              };
                            }

                            onChangeDraft({
                              ...draft,
                              classes: remaining,
                            });
                          }}
                          className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-950/30"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
              Perfil do NPC
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["role", "Papel"],
                ["faction", "Facção"],
                ["personality", "Personalidade"],
                ["motivation", "Motivação"],
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
                    value={draft[key as keyof NpcSheetDraft] as string}
                    onChange={(event) =>
                      onChangeDraft({
                        ...draft,
                        [key]: event.target.value,
                      })
                    }
                    className="mt-2 min-h-20 w-full resize-y rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-6 py-4">
          <p className="text-[10px] font-semibold text-white/30">
            O NPC poderá circular entre Mesa e Biblioteca sem perder a NpcSheet.
          </p>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void onSubmit()}
            className="rounded-xl border border-forge-gold bg-forge-purple px-5 py-3 text-sm font-black text-forge-gold transition hover:bg-[#4d0d63] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? "Criando ficha..." : "Criar NPC completo"}
          </button>
        </footer>
      </div>
    </div>
  );
}
