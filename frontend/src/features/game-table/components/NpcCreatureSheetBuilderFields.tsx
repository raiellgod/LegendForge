"use client";

import { useState } from "react";

import type {
  CreatureSheetDraft,
  NpcCreatureActionDraft,
  NpcCreatureAttackDraft,
  NpcCreatureDefenseDraft,
  NpcCreatureMagicalAbilityDraft,
  NpcCreatureMultiattackDraft,
  NpcCreatureSenseDraft,
  NpcCreatureTraitDraft,
  NpcSheetDraft,
} from "@/features/game-table/types/game-table-types";

import type { CharacterBuilderOptions } from "@/features/character-builder/types/character-builder-types";

type AnySheetDraft = NpcSheetDraft | CreatureSheetDraft;

type NpcCreatureSheetBuilderFieldsProps = {
  kind: "NPC" | "CREATURE";
  draft: AnySheetDraft;
  skills: CharacterBuilderOptions["skills"];
  languages: CharacterBuilderOptions["languages"];
  equipment: CharacterBuilderOptions["equipment"];
  spells: CharacterBuilderOptions["spells"];
  onChangeDraft: (draft: AnySheetDraft) => void;
};

const ATTRIBUTE_FIELDS = [
  ["strength", "FOR"],
  ["dexterity", "DES"],
  ["constitution", "CON"],
  ["intelligence", "INT"],
  ["wisdom", "SAB"],
  ["charisma", "CAR"],
] as const;

const SIZE_OPTIONS = [
  ["TINY", "Minúsculo"],
  ["SMALL", "Pequeno"],
  ["MEDIUM", "Médio"],
  ["LARGE", "Grande"],
  ["HUGE", "Enorme"],
  ["GARGANTUAN", "Colossal"],
] as const;

function clampInteger(value: string, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function NpcCreatureSheetBuilderFields({
  kind,
  draft,
  skills,
  languages,
  equipment,
  spells,
  onChangeDraft,
}: NpcCreatureSheetBuilderFieldsProps) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedSpellId, setSelectedSpellId] = useState("");

  const attackEquipment = equipment.filter(
    (item) =>
      item.attackType !== "NONE" &&
      Boolean(item.damageFormula || item.damage),
  );

  function update<K extends keyof AnySheetDraft>(
    key: K,
    value: AnySheetDraft[K],
  ) {
    onChangeDraft({
      ...draft,
      [key]: value,
    } as AnySheetDraft);
  }

  function toggleStringValue(
    key: "savingThrowKeys" | "skillKeys" | "expertiseSkillKeys" | "languageKeys",
    value: string,
  ) {
    const current = draft[key];
    const exists = current.includes(value);

    update(
      key,
      (exists
        ? current.filter((entry) => entry !== value)
        : [...current, value]) as AnySheetDraft[typeof key],
    );
  }

  function addDefense() {
    update("defenses", [
      ...draft.defenses,
      {
        kind: "RESISTANCE",
        damageType: "",
        notes: "",
      } satisfies NpcCreatureDefenseDraft,
    ]);
  }

  function addSense() {
    update("senses", [
      ...draft.senses,
      {
        name: "",
        range: null,
        notes: "",
      } satisfies NpcCreatureSenseDraft,
    ]);
  }

  function addTrait() {
    update("traits", [
      ...draft.traits,
      {
        name: "",
        description: "",
      } satisfies NpcCreatureTraitDraft,
    ]);
  }

  function addAction() {
    update("actions", [
      ...draft.actions,
      {
        kind: "ACTION",
        name: "",
        description: "",
        uses: null,
        maxUses: null,
        recharge: "",
      } satisfies NpcCreatureActionDraft,
    ]);
  }

  function addManualAttack() {
    update("attacks", [
      ...draft.attacks,
      {
        name: "",
        description: "",
        attackType: "MELEE",
        attackAbilityKey: "strength",
        attackBonus: 0,
        damageFormula: "1d6",
        damageBonus: 0,
        damageType: "",
        secondaryDamageFormula: "",
        secondaryDamageType: "",
        normalRange: null,
        longRange: null,
        reach: 1,
        target: "1 alvo",
        saveAbilityKey: "",
        saveDc: null,
        onHit: "",
        notes: "",
      } satisfies NpcCreatureAttackDraft,
    ]);
  }

  function addSystemAttack() {
    const item = attackEquipment.find(
      (currentItem) => currentItem.id === selectedEquipmentId,
    );

    if (!item) {
      return;
    }

    const normalizedAttackType: NpcCreatureAttackDraft["attackType"] =
      item.attackType === "MELEE" ||
      item.attackType === "RANGED" ||
      item.attackType === "THROWN"
        ? item.attackType
        : "OTHER";

    update("attacks", [
      ...draft.attacks,
      {
        name: item.name,
        description: item.description ?? "",
        attackType: normalizedAttackType,
        attackAbilityKey: item.attackAbilityKey ?? "strength",
        attackBonus: item.attackBonus,
        damageFormula: item.damageFormula ?? item.damage ?? "",
        damageBonus: item.damageBonus,
        damageType: item.damageType ?? "",
        secondaryDamageFormula: "",
        secondaryDamageType: "",
        normalRange: item.normalRange,
        longRange: item.longRange,
        reach: normalizedAttackType === "MELEE" ? 1 : null,
        target: "1 alvo",
        saveAbilityKey: "",
        saveDc: null,
        onHit: "",
        notes: item.properties ?? "",
      } satisfies NpcCreatureAttackDraft,
    ]);

    setSelectedEquipmentId("");
  }

  function addMultiattack() {
    update("multiattacks", [
      ...draft.multiattacks,
      {
        name: "Multiataque",
        description: "",
        entries: [],
      } satisfies NpcCreatureMultiattackDraft,
    ]);
  }

  function addManualMagicalAbility() {
    update("magicalAbilities", [
      ...draft.magicalAbilities,
      {
        spellKey: "",
        name: "",
        description: "",
        abilityKey: "",
        attackBonus: null,
        saveDc: null,
        damageFormula: "",
        damageBonus: 0,
        damageType: "",
        range: "",
        target: "",
        uses: null,
        maxUses: null,
        recharge: "",
        isPassive: false,
        notes: "",
      } satisfies NpcCreatureMagicalAbilityDraft,
    ]);
  }

  function addSystemSpell() {
    const spell = spells.find(
      (currentSpell) => currentSpell.id === selectedSpellId,
    );

    if (!spell) {
      return;
    }

    update("magicalAbilities", [
      ...draft.magicalAbilities,
      {
        spellKey: spell.key,
        name: spell.name,
        description: spell.description ?? "",
        abilityKey: "",
        attackBonus: null,
        saveDc: null,
        damageFormula: "",
        damageBonus: 0,
        damageType: "",
        range: spell.range ?? "",
        target: "",
        uses: null,
        maxUses: null,
        recharge: "",
        isPassive: false,
        notes: [
          `Nível ${spell.level}`,
          spell.school,
          spell.castingTime ? `Conjuração: ${spell.castingTime}` : null,
          spell.duration ? `Duração: ${spell.duration}` : null,
          spell.components.length > 0
            ? `Componentes: ${spell.components.join(", ")}`
            : null,
          spell.isRitual ? "Ritual" : null,
          spell.requiresConcentration ? "Concentração" : null,
        ]
          .filter(Boolean)
          .join(" · "),
      } satisfies NpcCreatureMagicalAbilityDraft,
    ]);

    setSelectedSpellId("");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
          Identidade e presença
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome">
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder={kind === "NPC" ? "Ex.: Talia, a informante" : "Ex.: Cão Irradiado Alfa"}
            />
          </Field>

          <Field label="Iniciais">
            <input
              value={draft.initials}
              onChange={(event) =>
                update("initials", event.target.value.toUpperCase().slice(0, 3))
              }
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              maxLength={3}
              placeholder="Opcional"
            />
          </Field>

          <Field label="Descrição" wide>
            <textarea
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-24 resize-y"
              placeholder="Resumo rápido exibido na mesa."
            />
          </Field>

          <Field label="Tamanho">
            <select
              value={draft.size}
              onChange={(event) =>
                update("size", event.target.value as AnySheetDraft["size"])
              }
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
            >
              {SIZE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Local inicial">
            <select
              value={draft.location}
              onChange={(event) =>
                update(
                  "location",
                  event.target.value as AnySheetDraft["location"],
                )
              }
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
            >
              <option value="TABLE">Mesa</option>
              <option value="LIBRARY">Biblioteca da campanha</option>
            </select>
          </Field>

          <Field label="Retrato URL">
            <input
              value={draft.portraitUrl}
              onChange={(event) => update("portraitUrl", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
            />
          </Field>

          <Field label="Token URL">
            <input
              value={draft.tokenImageUrl}
              onChange={(event) => update("tokenImageUrl", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
          Combate
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["armorClass", "CA"],
            ["hitPoints", "PV atual"],
            ["maxHitPoints", "PV máximo"],
            ["temporaryHp", "PV temp."],
            ["speed", "Desloc."],
            ["climbSpeed", "Escalada"],
            ["swimSpeed", "Natação"],
            ["flySpeed", "Voo"],
            ["burrowSpeed", "Escavação"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="number"
                min={0}
                value={draft[key as keyof AnySheetDraft] as number}
                onChange={(event) =>
                  update(
                    key as keyof AnySheetDraft,
                    clampInteger(event.target.value) as never,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
          Atributos e salvaguardas
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ATTRIBUTE_FIELDS.map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-black/25 p-3"
            >
              <p className="text-center text-[10px] font-black text-white/45">
                {label}
              </p>

              <input
                type="number"
                min={1}
                max={30}
                value={draft.attributes[key] ?? 10}
                onChange={(event) =>
                  update("attributes", {
                    ...draft.attributes,
                    [key]: Math.max(
                      1,
                      Math.min(30, clampInteger(event.target.value, 10)),
                    ),
                  })
                }
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-2 py-2 text-center text-sm font-black text-white outline-none focus:border-forge-gold/60"
              />

              <label className="mt-2 flex items-center justify-center gap-2 text-[9px] font-bold text-white/45">
                <input
                  type="checkbox"
                  checked={draft.savingThrowKeys.includes(key)}
                  onChange={() => toggleStringValue("savingThrowKeys", key)}
                />
                Salvaguarda
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
          Perícias e idiomas
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {skills.map((skill) => (
              <div
                key={skill.key}
                className="grid grid-cols-[1fr_auto_auto_70px] items-center gap-2 rounded-lg border border-white/5 px-2 py-2"
              >
                <label className="flex items-center gap-2 text-xs font-bold text-white/65">
                  <input
                    type="checkbox"
                    checked={draft.skillKeys.includes(skill.key)}
                    onChange={() => toggleStringValue("skillKeys", skill.key)}
                  />
                  {skill.name}
                </label>

                <label className="flex items-center gap-1 text-[9px] font-bold text-white/35">
                  <input
                    type="checkbox"
                    disabled={!draft.skillKeys.includes(skill.key)}
                    checked={draft.expertiseSkillKeys.includes(skill.key)}
                    onChange={() =>
                      toggleStringValue("expertiseSkillKeys", skill.key)
                    }
                  />
                  Exp.
                </label>

                <span className="text-[9px] font-black text-white/25">
                  {skill.stat.shortName}
                </span>

                <input
                  type="number"
                  placeholder="fixo"
                  value={draft.skillOverrides[skill.key] ?? ""}
                  onChange={(event) => {
                    const next = { ...draft.skillOverrides };
                    const raw = event.target.value;

                    if (!raw.trim()) {
                      delete next[skill.key];
                    } else {
                      next[skill.key] = clampInteger(raw);
                    }

                    update("skillOverrides", next);
                  }}
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none"
                />
              </div>
            ))}
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {languages.map((language) => (
              <label
                key={language.key}
                className="flex items-center gap-2 rounded-lg border border-white/5 px-2 py-2 text-xs font-bold text-white/65"
              >
                <input
                  type="checkbox"
                  checked={draft.languageKeys.includes(language.key)}
                  onChange={() =>
                    toggleStringValue("languageKeys", language.key)
                  }
                />
                {language.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      <ArraySection
        title="Resistências, imunidades e vulnerabilidades"
        buttonLabel="+ Defesa"
        onAdd={addDefense}
      >
        {draft.defenses.map((defense, index) => (
          <div key={`${index}-${defense.kind}`} className="grid gap-2 md:grid-cols-[160px_1fr_1fr_auto]">
            <select
              value={defense.kind}
              onChange={(event) => {
                const next = [...draft.defenses];
                next[index] = {
                  ...defense,
                  kind: event.target.value as NpcCreatureDefenseDraft["kind"],
                };
                update("defenses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
            >
              <option value="RESISTANCE">Resistência</option>
              <option value="IMMUNITY">Imunidade</option>
              <option value="VULNERABILITY">Vulnerabilidade</option>
            </select>
            <input
              value={defense.damageType}
              onChange={(event) => {
                const next = [...draft.defenses];
                next[index] = { ...defense, damageType: event.target.value };
                update("defenses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="Tipo de dano"
            />
            <input
              value={defense.notes}
              onChange={(event) => {
                const next = [...draft.defenses];
                next[index] = { ...defense, notes: event.target.value };
                update("defenses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="Observação"
            />
            <RemoveButton
              onClick={() =>
                update(
                  "defenses",
                  draft.defenses.filter((_, currentIndex) => currentIndex !== index),
                )
              }
            />
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Sentidos" buttonLabel="+ Sentido" onAdd={addSense}>
        {draft.senses.map((sense, index) => (
          <div key={`${index}-${sense.name}`} className="grid gap-2 md:grid-cols-[1fr_100px_1fr_auto]">
            <input
              value={sense.name}
              onChange={(event) => {
                const next = [...draft.senses];
                next[index] = { ...sense, name: event.target.value };
                update("senses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="Ex.: Visão no escuro"
            />
            <input
              type="number"
              value={sense.range ?? ""}
              onChange={(event) => {
                const next = [...draft.senses];
                next[index] = { ...sense, range: optionalInteger(event.target.value) };
                update("senses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="m"
            />
            <input
              value={sense.notes}
              onChange={(event) => {
                const next = [...draft.senses];
                next[index] = { ...sense, notes: event.target.value };
                update("senses", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="Observação"
            />
            <RemoveButton
              onClick={() =>
                update(
                  "senses",
                  draft.senses.filter((_, currentIndex) => currentIndex !== index),
                )
              }
            />
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Traits / características passivas" buttonLabel="+ Trait" onAdd={addTrait}>
        {draft.traits.map((trait, index) => (
          <div key={`${index}-${trait.name}`} className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
            <input
              value={trait.name}
              onChange={(event) => {
                const next = [...draft.traits];
                next[index] = { ...trait, name: event.target.value };
                update("traits", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              placeholder="Nome"
            />
            <textarea
              value={trait.description}
              onChange={(event) => {
                const next = [...draft.traits];
                next[index] = { ...trait, description: event.target.value };
                update("traits", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-20 resize-y"
              placeholder="Descrição"
            />
            <RemoveButton onClick={() => update("traits", draft.traits.filter((_, i) => i !== index))} />
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Ações / ações bônus / reações" buttonLabel="+ Ação" onAdd={addAction}>
        {draft.actions.map((action, index) => (
          <div key={`${index}-${action.name}`} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="grid gap-2 md:grid-cols-[160px_1fr_auto]">
              <select
                value={action.kind}
                onChange={(event) => {
                  const next = [...draft.actions];
                  next[index] = {
                    ...action,
                    kind: event.target.value as NpcCreatureActionDraft["kind"],
                  };
                  update("actions", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              >
                <option value="ACTION">Ação</option>
                <option value="BONUS_ACTION">Ação bônus</option>
                <option value="REACTION">Reação</option>
              </select>
              <input
                value={action.name}
                onChange={(event) => {
                  const next = [...draft.actions];
                  next[index] = { ...action, name: event.target.value };
                  update("actions", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Nome"
              />
              <RemoveButton onClick={() => update("actions", draft.actions.filter((_, i) => i !== index))} />
            </div>
            <textarea
              value={action.description}
              onChange={(event) => {
                const next = [...draft.actions];
                next[index] = { ...action, description: event.target.value };
                update("actions", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-20 resize-y"
              placeholder="Descrição"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={action.uses ?? ""}
                onChange={(event) => {
                  const next = [...draft.actions];
                  next[index] = { ...action, uses: optionalInteger(event.target.value) };
                  update("actions", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Usos"
              />
              <input
                type="number"
                value={action.maxUses ?? ""}
                onChange={(event) => {
                  const next = [...draft.actions];
                  next[index] = { ...action, maxUses: optionalInteger(event.target.value) };
                  update("actions", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Máx."
              />
              <input
                value={action.recharge}
                onChange={(event) => {
                  const next = [...draft.actions];
                  next[index] = { ...action, recharge: event.target.value };
                  update("actions", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Recarga"
              />
            </div>
          </div>
        ))}
      </ArraySection>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
              Ataques
            </p>
            <p className="mt-1 text-[10px] font-semibold text-white/30">
              Copie um ataque do catálogo do sistema ou crie um ataque manual.
            </p>
          </div>
          <button
            type="button"
            onClick={addManualAttack}
            className="rounded-lg border border-forge-gold/30 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple/30"
          >
            + Ataque manual
          </button>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-forge-gold/15 bg-forge-gold/5 p-3 md:grid-cols-[1fr_auto]">
          <select
            value={selectedEquipmentId}
            onChange={(event) => setSelectedEquipmentId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
          >
            <option value="">Escolher arma/equipamento do sistema...</option>
            {attackEquipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.damageFormula ? ` · ${item.damageFormula}` : ""}
                {item.damageType ? ` ${item.damageType}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedEquipmentId}
            onClick={addSystemAttack}
            className="rounded-lg border border-forge-gold/40 bg-forge-purple/20 px-4 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Do sistema
          </button>
        </div>

        <div className="mt-4 space-y-3">
        {draft.attacks.map((attack, index) => (
          <div key={`${index}-${attack.name}`} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_160px_90px_auto]">
              <input
                value={attack.name}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, name: event.target.value };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Nome do ataque"
              />
              <select
                value={attack.attackType}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = {
                    ...attack,
                    attackType: event.target.value as NpcCreatureAttackDraft["attackType"],
                  };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
              >
                <option value="MELEE">Corpo a corpo</option>
                <option value="RANGED">À distância</option>
                <option value="THROWN">Arremesso</option>
                <option value="MAGIC">Mágico</option>
                <option value="OTHER">Outro</option>
              </select>
              <input
                type="number"
                value={attack.attackBonus}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, attackBonus: clampInteger(event.target.value) };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="+Acerto"
              />
              <RemoveButton onClick={() => update("attacks", draft.attacks.filter((_, i) => i !== index))} />
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <input
                value={attack.damageFormula}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, damageFormula: event.target.value };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Dano ex. 1d8"
              />
              <input
                type="number"
                value={attack.damageBonus}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, damageBonus: clampInteger(event.target.value) };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Bônus dano"
              />
              <input
                value={attack.damageType}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, damageType: event.target.value };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Tipo dano"
              />
              <input
                value={attack.target}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, target: event.target.value };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Alvo"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <input
                type="number"
                value={attack.reach ?? ""}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, reach: optionalInteger(event.target.value) };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Alcance corpo"
              />
              <input
                type="number"
                value={attack.normalRange ?? ""}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, normalRange: optionalInteger(event.target.value) };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Alcance normal"
              />
              <input
                type="number"
                value={attack.longRange ?? ""}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, longRange: optionalInteger(event.target.value) };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Alcance longo"
              />
              <input
                value={attack.attackAbilityKey}
                onChange={(event) => {
                  const next = [...draft.attacks];
                  next[index] = { ...attack, attackAbilityKey: event.target.value };
                  update("attacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Atributo"
              />
            </div>

            <textarea
              value={attack.onHit}
              onChange={(event) => {
                const next = [...draft.attacks];
                next[index] = { ...attack, onHit: event.target.value };
                update("attacks", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-16 resize-y"
              placeholder="Efeito ao acertar"
            />
          </div>
        ))}
        </div>
      </section>

      <ArraySection title="Multiataque" buttonLabel="+ Multiataque" onAdd={addMultiattack}>
        {draft.multiattacks.map((multiattack, index) => (
          <div key={`${index}-${multiattack.name}`} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                value={multiattack.name}
                onChange={(event) => {
                  const next = [...draft.multiattacks];
                  next[index] = { ...multiattack, name: event.target.value };
                  update("multiattacks", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Multiataque"
              />
              <RemoveButton onClick={() => update("multiattacks", draft.multiattacks.filter((_, i) => i !== index))} />
            </div>

            <textarea
              value={multiattack.description}
              onChange={(event) => {
                const next = [...draft.multiattacks];
                next[index] = { ...multiattack, description: event.target.value };
                update("multiattacks", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-16 resize-y"
              placeholder="Descrição"
            />

            <button
              type="button"
              onClick={() => {
                const next = [...draft.multiattacks];
                next[index] = {
                  ...multiattack,
                  entries: [
                    ...multiattack.entries,
                    {
                      targetType: "ATTACK",
                      targetName: "",
                      quantity: 1,
                      notes: "",
                    },
                  ],
                };
                update("multiattacks", next);
              }}
              className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-black text-white/55 hover:border-forge-gold/50 hover:text-forge-gold"
            >
              + Entrada
            </button>

            {multiattack.entries.map((entry, entryIndex) => (
              <div key={entryIndex} className="grid gap-2 md:grid-cols-[130px_1fr_90px_auto]">
                <select
                  value={entry.targetType}
                  onChange={(event) => {
                    const next = [...draft.multiattacks];
                    const entries = [...multiattack.entries];
                    entries[entryIndex] = {
                      ...entry,
                      targetType: event.target.value as "ATTACK" | "ACTION",
                    };
                    next[index] = { ...multiattack, entries };
                    update("multiattacks", next);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                >
                  <option value="ATTACK">Ataque</option>
                  <option value="ACTION">Ação</option>
                </select>
                <input
                  value={entry.targetName}
                  onChange={(event) => {
                    const next = [...draft.multiattacks];
                    const entries = [...multiattack.entries];
                    entries[entryIndex] = { ...entry, targetName: event.target.value };
                    next[index] = { ...multiattack, entries };
                    update("multiattacks", next);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                  placeholder="Nome exato do ataque/ação"
                />
                <input
                  type="number"
                  min={1}
                  value={entry.quantity}
                  onChange={(event) => {
                    const next = [...draft.multiattacks];
                    const entries = [...multiattack.entries];
                    entries[entryIndex] = {
                      ...entry,
                      quantity: Math.max(1, clampInteger(event.target.value, 1)),
                    };
                    next[index] = { ...multiattack, entries };
                    update("multiattacks", next);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                />
                <RemoveButton
                  onClick={() => {
                    const next = [...draft.multiattacks];
                    next[index] = {
                      ...multiattack,
                      entries: multiattack.entries.filter((_, i) => i !== entryIndex),
                    };
                    update("multiattacks", next);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </ArraySection>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
              Magias / habilidades mágicas
            </p>
            <p className="mt-1 text-[10px] font-semibold text-white/30">
              Escolha uma magia já cadastrada no sistema ou crie uma habilidade manual.
            </p>
          </div>
          <button
            type="button"
            onClick={addManualMagicalAbility}
            className="rounded-lg border border-forge-gold/30 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple/30"
          >
            + Habilidade manual
          </button>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-forge-gold/15 bg-forge-gold/5 p-3 md:grid-cols-[1fr_auto]">
          <select
            value={selectedSpellId}
            onChange={(event) => setSelectedSpellId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-forge-gold/60"
          >
            <option value="">Escolher magia do sistema...</option>
            {spells.map((spell) => (
              <option key={spell.id} value={spell.id}>
                {spell.level === 0 ? "Truque" : `Nível ${spell.level}`} · {spell.name} · {spell.school}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedSpellId}
            onClick={addSystemSpell}
            className="rounded-lg border border-forge-gold/40 bg-forge-purple/20 px-4 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Do sistema
          </button>
        </div>

        <div className="mt-4 space-y-3">
        {draft.magicalAbilities.map((ability, index) => (
          <div key={`${index}-${ability.name}`} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={ability.name}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, name: event.target.value };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Nome"
              />
              <input
                value={ability.spellKey}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, spellKey: event.target.value };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="spell key opcional"
              />
              <RemoveButton onClick={() => update("magicalAbilities", draft.magicalAbilities.filter((_, i) => i !== index))} />
            </div>
            <textarea
              value={ability.description}
              onChange={(event) => {
                const next = [...draft.magicalAbilities];
                next[index] = { ...ability, description: event.target.value };
                update("magicalAbilities", next);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60 min-h-20 resize-y"
              placeholder="Descrição"
            />
            <div className="grid gap-2 md:grid-cols-4">
              <input
                type="number"
                value={ability.attackBonus ?? ""}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, attackBonus: optionalInteger(event.target.value) };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="+ ataque"
              />
              <input
                type="number"
                value={ability.saveDc ?? ""}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, saveDc: optionalInteger(event.target.value) };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="CD"
              />
              <input
                value={ability.damageFormula}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, damageFormula: event.target.value };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Dano"
              />
              <input
                value={ability.damageType}
                onChange={(event) => {
                  const next = [...draft.magicalAbilities];
                  next[index] = { ...ability, damageType: event.target.value };
                  update("magicalAbilities", next);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                placeholder="Tipo dano"
              />
            </div>
          </div>
        ))}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "block md:col-span-2" : "block"}>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ArraySection({
  title,
  buttonLabel,
  onAdd,
  children,
}: {
  title: string;
  buttonLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/80">
          {title}
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-forge-gold/30 px-3 py-2 text-[10px] font-black text-forge-gold transition hover:bg-forge-purple/30"
        >
          {buttonLabel}
        </button>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-red-500/30 px-3 py-2 text-[10px] font-black text-red-300 hover:bg-red-950/30"
    >
      ×
    </button>
  );
}
