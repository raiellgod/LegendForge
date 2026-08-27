import Image from "next/image";
import { useMemo, useState } from "react";

import type {
  SystemLibrary,
  SystemLibraryCharacterTemplate,
  SystemLibraryCreatureTemplate,
  SystemLibraryEquipment,
  SystemLibraryNpcTemplate,
  SystemLibrarySpell,
} from "@/features/game-table/types/game-table-types";

type SystemLibraryModalProps = {
  library: SystemLibrary | null;
  isLoading: boolean;
  error: string | null;
  isGM: boolean;
  importingCharacterTemplateId: string | null;
  importingNpcTemplateId: string | null;
  importingCreatureTemplateId: string | null;
  importMessage: string;
  importError: string;
  onImportCharacterTemplate: (templateId: string) => Promise<void>;
  onImportNpcTemplate: (templateId: string) => Promise<void>;
  onImportCreatureTemplate: (templateId: string) => Promise<void>;
  onClose: () => void;
};

function getEquipmentSummary(item: SystemLibraryEquipment) {
  const summaryParts = [
    getEquipmentCategoryLabel(item.category),
    item.damageFormula ? `Dano ${item.damageFormula}` : null,
    typeof item.defense === "number" ? `Defesa +${item.defense}` : null,
    item.cost,
  ].filter(Boolean);

  return summaryParts.join(" · ");
}

function getAttackTypeLabel(attackType: string) {
  const labels: Record<string, string> = {
    NONE: "Sem ataque",
    MELEE: "Corpo a corpo",
    RANGED: "À distância",
    THROWN: "Arremesso",
  };

  return labels[attackType] ?? attackType;
}

function getWeaponGroupLabel(weaponGroup: string | null) {
  if (!weaponGroup) {
    return "—";
  }

  const labels: Record<string, string> = {
    SIMPLE: "Simples",
    MARTIAL: "Marcial",
    IMPROVISED: "Improvisada",
    NATURAL: "Natural",
    TECH: "Tecnológica",
    RELIC: "Relíquia",
  };

  return labels[weaponGroup] ?? weaponGroup;
}

function getEquipmentRangeLabel(item: SystemLibraryEquipment) {
  if (item.normalRange === null && item.longRange === null) {
    return "—";
  }

  if (item.normalRange !== null && item.longRange !== null) {
    return `${item.normalRange} / ${item.longRange} m`;
  }

  return `${item.normalRange ?? item.longRange} m`;
}

function getSpellLevelLabel(level: number) {
  return level === 0 ? "Truque" : `Nível ${level}`;
}

function getSpellSchoolLabel(school: string) {
  const labels: Record<string, string> = {
    ABJURATION: "Abjuração",
    CONJURATION: "Conjuração",
    DIVINATION: "Adivinhação",
    ENCHANTMENT: "Encantamento",
    EVOCATION: "Evocação",
    ILLUSION: "Ilusão",
    NECROMANCY: "Necromancia",
    TRANSMUTATION: "Transmutação",
  };

  return labels[school] ?? school;
}

function getSpellSummary(spell: SystemLibrarySpell) {
  return [
    getSpellLevelLabel(spell.level),
    getSpellSchoolLabel(spell.school),
    spell.castingTime,
    spell.range,
  ]
    .filter(Boolean)
    .join(" · ");
}

function SystemLibraryEquipmentPreview({
  item,
}: {
  item: SystemLibraryEquipment;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-start gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-forge-purple/30 text-xs font-black uppercase text-forge-gold">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            item.name.slice(0, 2)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {item.name}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                {getEquipmentCategoryLabel(item.category)}
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
              Item
            </span>
          </div>

          <p
            className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
            title={item.description || "Sem descrição cadastrada."}
          >
            {item.description || "Sem descrição cadastrada."}
          </p>

          <p className="mt-2 text-[10px] font-bold leading-relaxed text-forge-gold/70">
            {getEquipmentSummary(item) || "Sem resumo mecânico."}
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-forge-gold">
          Ver detalhes
        </summary>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Categoria
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getEquipmentCategoryLabel(item.category)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Custo
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {item.cost ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Peso
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {item.weight !== null ? `${item.weight} kg` : "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Dano
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {item.damage ?? item.damageFormula ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Defesa
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {typeof item.defense === "number" ? `+${item.defense}` : "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Ataque
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getAttackTypeLabel(item.attackType)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Grupo
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getWeaponGroupLabel(item.weaponGroup)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Alcance
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getEquipmentRangeLabel(item)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Bônus
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              Ataque {item.attackBonus >= 0 ? "+" : ""}
              {item.attackBonus} · Dano {item.damageBonus >= 0 ? "+" : ""}
              {item.damageBonus}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Propriedades
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
              {item.properties ?? "Nenhuma propriedade cadastrada."}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Descrição completa
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
              {item.description ?? "Sem descrição cadastrada."}
            </p>
          </div>
        </div>
      </details>
    </article>
  );
}

function SystemLibrarySpellPreview({
  spell,
}: {
  spell: SystemLibrarySpell;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{spell.name}</p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
            {getSpellLevelLabel(spell.level)} · {getSpellSchoolLabel(spell.school)}
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
          Magia
        </span>
      </div>

      <p
        className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
        title={spell.description || "Sem descrição cadastrada."}
      >
        {spell.description || "Sem descrição cadastrada."}
      </p>

      <p className="mt-2 text-[10px] font-bold leading-relaxed text-forge-gold/70">
        {getSpellSummary(spell)}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/35">
          Componentes:{" "}
          {spell.components.length > 0
            ? spell.components.join(", ")
            : "Nenhum"}
        </span>

        {spell.requiresConcentration ? (
          <span className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-forge-gold">
            Concentração
          </span>
        ) : null}

        {spell.isRitual ? (
          <span className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-forge-gold">
            Ritual
          </span>
        ) : null}
      </div>

      <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-forge-gold">
          Ver detalhes
        </summary>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Nível
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getSpellLevelLabel(spell.level)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Escola
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {getSpellSchoolLabel(spell.school)}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Conjuração
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.castingTime ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Alcance
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.range ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Duração
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.duration ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Componentes
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.components.length > 0
                ? spell.components.join(", ")
                : "Nenhum"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Ritual
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.isRitual ? "Sim" : "Não"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Concentração
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {spell.requiresConcentration ? "Sim" : "Não"}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
            Descrição completa
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
            {spell.description ?? "Sem descrição cadastrada."}
          </p>
        </div>
      </details>
    </article>
  );
}


function SystemLibraryNpcTemplatePreview({
  template,
  isGM,
  isImporting,
  onImport,
}: {
  template: SystemLibraryNpcTemplate;
  isGM: boolean;
  isImporting: boolean;
  onImport: () => Promise<void>;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-start gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-forge-purple/30 text-xs font-black uppercase text-forge-gold">
          {template.portraitUrl ? (
            <Image
              src={template.portraitUrl}
              alt={template.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            template.initials ?? template.name.slice(0, 2)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {template.name}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                Template de NPC
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
              NPC
            </span>
          </div>

          <p
            className="mt-2 line-clamp-3 text-xs font-semibold leading-relaxed text-white/55"
            title={template.description || "Sem descrição cadastrada."}
          >
            {template.description || "Sem descrição cadastrada."}
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-forge-gold">
          Ver detalhes
        </summary>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Tipo
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              Template de NPC
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Key
            </p>
            <p className="mt-1 break-all text-xs font-bold text-white/65">
              {template.key}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Iniciais
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {template.initials ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Ordem
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {template.order}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
            Descrição completa
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
            {template.description ?? "Sem descrição cadastrada."}
          </p>
        </div>

        <p className="mt-3 text-[9px] font-semibold leading-relaxed text-white/25">
          Este template pertence ao sistema. A instância criada na campanha é
          independente e não altera este conteúdo-base.
        </p>
      </details>

      {isGM ? (
        <button
          type="button"
          disabled={isImporting}
          onClick={() => void onImport()}
          className="mt-3 w-full rounded-lg border border-forge-gold/40 bg-forge-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold transition hover:bg-forge-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isImporting ? "Adicionando..." : "Adicionar à campanha"}
        </button>
      ) : null}
    </article>
  );
}

function SystemLibraryCreatureTemplatePreview({
  template,
  isGM,
  isImporting,
  onImport,
}: {
  template: SystemLibraryCreatureTemplate;
  isGM: boolean;
  isImporting: boolean;
  onImport: () => Promise<void>;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-start gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-forge-purple/30 text-xs font-black uppercase text-forge-gold">
          {template.portraitUrl ? (
            <Image
              src={template.portraitUrl}
              alt={template.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            template.initials ?? template.name.slice(0, 2)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {template.name}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                Template de criatura
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
              Criatura
            </span>
          </div>

          <p
            className="mt-2 line-clamp-3 text-xs font-semibold leading-relaxed text-white/55"
            title={template.description || "Sem descrição cadastrada."}
          >
            {template.description || "Sem descrição cadastrada."}
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-forge-gold">
          Ver detalhes
        </summary>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Tipo
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              Template de criatura
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Key
            </p>
            <p className="mt-1 break-all text-xs font-bold text-white/65">
              {template.key}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Iniciais
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {template.initials ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Ordem
            </p>
            <p className="mt-1 text-xs font-bold text-white/65">
              {template.order}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
            Descrição completa
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
            {template.description ?? "Sem descrição cadastrada."}
          </p>
        </div>

        <p className="mt-3 text-[9px] font-semibold leading-relaxed text-white/25">
          Este template pertence ao sistema. A instância criada na campanha é
          independente e não altera este conteúdo-base.
        </p>
      </details>

      {isGM ? (
        <button
          type="button"
          disabled={isImporting}
          onClick={() => void onImport()}
          className="mt-3 w-full rounded-lg border border-forge-gold/40 bg-forge-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold transition hover:bg-forge-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isImporting ? "Adicionando..." : "Adicionar à campanha"}
        </button>
      ) : null}
    </article>
  );
}


function SystemLibraryCharacterTemplatePreview({
  template,
  isGM,
  isImporting,
  onImport,
}: {
  template: SystemLibraryCharacterTemplate;
  isGM: boolean;
  isImporting: boolean;
  onImport: (templateId: string) => Promise<void>;
}) {
  const orderedClasses = [...template.classes].sort(
    (firstClass, secondClass) => firstClass.order - secondClass.order,
  );

  const classSummary =
    orderedClasses.length > 0
      ? orderedClasses
          .map((classEntry) => {
            const subclassLabel = classEntry.subclass
              ? ` — ${classEntry.subclass.name}`
              : "";

            return `${classEntry.characterClass.name} ${classEntry.level}${subclassLabel}`;
          })
          .join(" / ")
      : "Sem classe cadastrada";

  const originSummary = [
    template.ancestry?.name,
    template.subAncestry?.name,
    template.background?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-start gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-forge-purple/30 text-xs font-black uppercase text-forge-gold">
          {template.portraitUrl ? (
            <Image
              src={template.portraitUrl}
              alt={template.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            template.name.slice(0, 2)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {template.name}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                Nível {template.level} · {classSummary}
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/40">
              Personagem
            </span>
          </div>

          <p
            className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-white/55"
            title={template.description || "Sem descrição cadastrada."}
          >
            {template.description || "Sem descrição cadastrada."}
          </p>

          <p className="mt-2 text-[10px] font-bold leading-relaxed text-forge-gold/70">
            {originSummary || "Origem não cadastrada"} · PV {template.maxHitPoints} ·
            CA {template.armorClass} · {template.speed} m
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-white/10 bg-black/25">
        <summary className="cursor-pointer px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold">
          Ver ficha completa do template
        </summary>

        <div className="space-y-4 border-t border-white/10 px-3 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Conceito
              </p>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {template.concept || "—"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Origem
              </p>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {originSummary || "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Classes
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {orderedClasses.map((classEntry) => (
                <span
                  key={classEntry.id}
                  className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-bold text-white/55"
                >
                  {classEntry.characterClass.name} {classEntry.level}
                  {classEntry.subclass ? ` · ${classEntry.subclass.name}` : ""}
                  {classEntry.isPrimary ? " · principal" : ""}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Atributos
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[...template.stats]
                .sort((a, b) => a.stat.name.localeCompare(b.stat.name, "pt-BR"))
                .map((statEntry) => {
                  const resolvedValue =
                    statEntry.overrideValue ??
                    statEntry.baseValue + statEntry.bonusValue;

                  return (
                    <div
                      key={statEntry.id}
                      className="rounded-lg border border-white/10 bg-black/25 px-2 py-2 text-center"
                    >
                      <p className="text-[9px] font-black uppercase text-white/35">
                        {statEntry.stat.shortName}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {resolvedValue}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Perícias
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                {template.skills.length > 0
                  ? template.skills
                      .filter((entry) => entry.isProficient)
                      .map((entry) => entry.skill.name)
                      .join(", ")
                  : "Nenhuma perícia persistida."}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Idiomas
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                {template.languages.length > 0
                  ? template.languages
                      .map((entry) => entry.language.name)
                      .join(", ")
                  : "Nenhum idioma persistido."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Equipamentos
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {template.equipment.length > 0 ? (
                template.equipment.map((entry) => (
                  <span
                    key={entry.id}
                    className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-bold text-white/55"
                  >
                    {entry.quantity}× {entry.equipment.name}
                    {entry.isEquipped ? " · equipado" : ""}
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold text-white/40">
                  Nenhum equipamento persistido.
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              Magias conhecidas
            </p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
              {template.spells.length > 0
                ? template.spells.map((entry) => entry.spell.name).join(", ")
                : "Este template não possui magias conhecidas."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Escolhas de feature
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                {template.featureChoices.length > 0
                  ? template.featureChoices
                      .map(
                        (choice) =>
                          `${choice.choiceGroup.name}: ${choice.feature.name}`,
                      )
                      .join(", ")
                  : "Nenhuma escolha persistida neste nível."}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                Progressão resolvida
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                {template.progressionChoices.length > 0
                  ? `${template.progressionChoices.length} escolha(s) registrada(s).`
                  : "Nenhuma escolha de progressão exigida neste nível."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
              História
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
              {template.backstory || template.description || "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <p className="text-[9px] font-semibold leading-relaxed text-white/25">
              O template permanece somente leitura. Ao adicionar à campanha,
              uma cópia independente de CampaignActor + CharacterSheet é criada.
            </p>

            {isGM ? (
              <button
                type="button"
                disabled={isImporting}
                onClick={() => void onImport(template.id)}
                className="rounded-lg border border-forge-gold/35 bg-forge-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-forge-gold transition hover:bg-forge-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImporting ? "Adicionando..." : "Adicionar à campanha"}
              </button>
            ) : (
              <span className="text-[9px] font-semibold text-white/25">
                Apenas o mestre pode instanciar personagens-template.
              </span>
            )}
          </div>
        </div>
      </details>
    </article>
  );
}

type SystemLibrarySection = "ALL" | "EQUIPMENT" | "SPELLS" | "CHARACTERS" | "NPCS" | "CREATURES";

function getEquipmentCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    WEAPON: "Armas",
    ARMOR: "Proteções",
    SHIELD: "Escudos",
    TOOL: "Ferramentas",
    GEAR: "Equipamentos",
    CONSUMABLE: "Consumíveis",
    RELIC: "Relíquias",
  };

  return labels[category] ?? category;
}

function getSpellLevelFilterLabel(level: number) {
  return level === 0 ? "Truques" : `Nível ${level}`;
}

export function SystemLibraryModal({
  library,
  isLoading,
  error,
  isGM,
  importingCharacterTemplateId,
  importingNpcTemplateId,
  importingCreatureTemplateId,
  importMessage,
  importError,
  onImportCharacterTemplate,
  onImportNpcTemplate,
  onImportCreatureTemplate,
  onClose,
}: SystemLibraryModalProps) {
  const [activeSection, setActiveSection] =
    useState<SystemLibrarySection>("ALL");
  const [equipmentCategory, setEquipmentCategory] = useState("ALL");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [spellSearch, setSpellSearch] = useState("");
  const [spellLevel, setSpellLevel] = useState<number | "ALL">("ALL");

  const equipmentCategories = useMemo(() => {
    if (!library) {
      return [];
    }

    return Array.from(
      new Set(library.equipment.map((item) => item.category)),
    ).sort((firstCategory, secondCategory) =>
      getEquipmentCategoryLabel(firstCategory).localeCompare(
        getEquipmentCategoryLabel(secondCategory),
        "pt-BR",
      ),
    );
  }, [library]);

  const spellLevels = useMemo(() => {
    if (!library) {
      return [];
    }

    return Array.from(new Set(library.spells.map((spell) => spell.level))).sort(
      (firstLevel, secondLevel) => firstLevel - secondLevel,
    );
  }, [library]);

  const filteredEquipment = useMemo(() => {
    if (!library) {
      return [];
    }

    const normalizedSearch = equipmentSearch.trim().toLocaleLowerCase("pt-BR");

    return library.equipment.filter((item) => {
      const matchesCategory =
        equipmentCategory === "ALL" || item.category === equipmentCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        item.name,
        item.key,
        item.description,
        item.properties,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return searchableText.includes(normalizedSearch);
    });
  }, [equipmentCategory, equipmentSearch, library]);

  const filteredSpells = useMemo(() => {
    if (!library) {
      return [];
    }

    const normalizedSearch = spellSearch.trim().toLocaleLowerCase("pt-BR");

    return library.spells.filter((spell) => {
      const matchesLevel =
        spellLevel === "ALL" || spell.level === spellLevel;

      if (!matchesLevel) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        spell.name,
        spell.key,
        spell.description,
        spell.school,
        getSpellSchoolLabel(spell.school),
        spell.castingTime,
        spell.range,
        spell.duration,
        spell.components.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return searchableText.includes(normalizedSearch);
    });
  }, [library, spellLevel, spellSearch]);

  const equipmentPreview = filteredEquipment.slice(0, 6);
  const spellPreview = filteredSpells.slice(0, 6);

  const shouldShowEquipment =
    activeSection === "ALL" || activeSection === "EQUIPMENT";
  const shouldShowSpells =
    activeSection === "ALL" || activeSection === "SPELLS";
  const shouldShowCharacters =
    activeSection === "ALL" || activeSection === "CHARACTERS";
  const shouldShowNpcs =
    activeSection === "ALL" || activeSection === "NPCS";
  const shouldShowCreatures =
    activeSection === "ALL" || activeSection === "CREATURES";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-forge-gold/30 bg-[#140918] shadow-[-8px_8px_0_rgba(0,0,0,0.45)]">
        <header className="border-b border-white/10 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                Biblioteca do sistema
              </p>

              <h2 className="mt-1 text-xl font-black text-forge-gold">
                Conteúdo reutilizável
              </h2>

              <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-white/55">
                Catálogo-base pertencente ao sistema da campanha. Personagens,
                NPCs, criaturas, itens e magias permanecem conteúdo somente
                leitura até serem instanciados na campanha.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-sm font-black text-white/45 transition hover:border-forge-gold/40 hover:text-forge-gold"
              aria-label="Fechar biblioteca do sistema"
              title="Fechar biblioteca do sistema"
            >
              ×
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-8 text-center">
              <p className="text-sm font-black text-white">
                Carregando biblioteca do sistema...
              </p>
              <p className="mt-2 text-xs font-semibold text-white/40">
                Consultando itens e magias vinculados ao sistema da campanha.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-4">
              <p className="text-sm font-black text-red-100">
                Não foi possível carregar a biblioteca.
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-red-100/70">
                {error}
              </p>
            </div>
          ) : library ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-forge-gold/20 bg-forge-gold/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold/70">
                      Sistema atual
                    </p>
                    <p className="mt-1 text-base font-black text-white">
                      {library.system.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/40">
                      Versão {library.system.version}
                      {library.system.slug
                        ? ` · ${library.system.slug}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-forge-gold">
                      {library.summary.equipmentCount} itens
                    </span>
                    <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-forge-gold">
                      {library.summary.spellCount} magias
                    </span>
                    <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-forge-gold">
                      {library.summary.characterTemplateCount} personagens
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                  Categorias da biblioteca
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    {
                      id: "ALL" as const,
                      label: "Tudo",
                      count:
                        library.summary.equipmentCount +
                        library.summary.spellCount +
                        library.summary.characterTemplateCount +
                        library.summary.npcTemplateCount +
                        library.summary.creatureTemplateCount,
                    },
                    {
                      id: "EQUIPMENT" as const,
                      label: "Itens",
                      count: library.summary.equipmentCount,
                    },
                    {
                      id: "SPELLS" as const,
                      label: "Magias",
                      count: library.summary.spellCount,
                    },
                    {
                      id: "CHARACTERS" as const,
                      label: "Personagens",
                      count: library.summary.characterTemplateCount,
                    },
                    {
                      id: "NPCS" as const,
                      label: "NPCs",
                      count: library.summary.npcTemplateCount,
                    },
                    {
                      id: "CREATURES" as const,
                      label: "Criaturas",
                      count: library.summary.creatureTemplateCount,
                    },
                  ].map((section) => {
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={[
                          "rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition",
                          isActive
                            ? "border-forge-gold/50 bg-forge-gold/10 text-forge-gold"
                            : "border-white/10 bg-black/20 text-white/40 hover:border-forge-gold/30 hover:text-forge-gold",
                        ].join(" ")}
                      >
                        {section.label} · {section.count}
                      </button>
                    );
                  })}
                </div>
              </section>

              {importMessage ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-200">
                  {importMessage}
                </div>
              ) : null}

              {importError ? (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">
                  {importError}
                </div>
              ) : null}

              <div
                className={[
                  "grid gap-5",
                  activeSection === "ALL"
                    ? "lg:grid-cols-2"
                    : "grid-cols-1",
                ].join(" ")}
              >
                {shouldShowEquipment ? (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                        Itens
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        Prévia do catálogo de equipamentos do sistema.
                      </p>
                    </div>

                    <span className="text-xs font-black text-white/35">
                      {library.summary.equipmentCount}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label className="block">
                      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                        Buscar item
                      </span>
                      <input
                        type="search"
                        value={equipmentSearch}
                        onChange={(event) => setEquipmentSearch(event.target.value)}
                        placeholder="Nome, key, descrição ou propriedade..."
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-forge-gold/45"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEquipmentCategory("ALL")}
                      className={[
                        "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] transition",
                        equipmentCategory === "ALL"
                          ? "border-forge-gold/40 bg-forge-gold/10 text-forge-gold"
                          : "border-white/10 text-white/35 hover:border-forge-gold/30 hover:text-forge-gold",
                      ].join(" ")}
                    >
                      Todos · {library.equipment.length}
                    </button>

                    {equipmentCategories.map((category) => {
                      const count = library.equipment.filter(
                        (item) => item.category === category,
                      ).length;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setEquipmentCategory(category)}
                          className={[
                            "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] transition",
                            equipmentCategory === category
                              ? "border-forge-gold/40 bg-forge-gold/10 text-forge-gold"
                              : "border-white/10 text-white/35 hover:border-forge-gold/30 hover:text-forge-gold",
                          ].join(" ")}
                        >
                          {getEquipmentCategoryLabel(category)} · {count}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-3">
                    {equipmentPreview.length > 0 ? (
                      equipmentPreview.map((item) => (
                        <SystemLibraryEquipmentPreview
                          key={item.id}
                          item={item}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                        Nenhum item encontrado para os filtros atuais.
                      </div>
                    )}
                  </div>

                  {filteredEquipment.length > equipmentPreview.length ? (
                    <p className="mt-3 text-center text-[10px] font-bold text-white/30">
                      Exibindo {equipmentPreview.length} de{" "}
                      {filteredEquipment.length} nesta categoria. A navegação completa será
                      aprofundada nas próximas etapas da Biblioteca.
                    </p>
                  ) : null}
                  </section>
                ) : null}

                {shouldShowSpells ? (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                        Magias
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        Prévia do grimório reutilizável do sistema.
                      </p>
                    </div>

                    <span className="text-xs font-black text-white/35">
                      {library.summary.spellCount}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label className="block">
                      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
                        Buscar magia
                      </span>
                      <input
                        type="search"
                        value={spellSearch}
                        onChange={(event) => setSpellSearch(event.target.value)}
                        placeholder="Nome, key, escola, descrição ou componente..."
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-forge-gold/45"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSpellLevel("ALL")}
                      className={[
                        "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] transition",
                        spellLevel === "ALL"
                          ? "border-forge-gold/40 bg-forge-gold/10 text-forge-gold"
                          : "border-white/10 text-white/35 hover:border-forge-gold/30 hover:text-forge-gold",
                      ].join(" ")}
                    >
                      Todas · {library.spells.length}
                    </button>

                    {spellLevels.map((level) => {
                      const count = library.spells.filter(
                        (spell) => spell.level === level,
                      ).length;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSpellLevel(level)}
                          className={[
                            "rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] transition",
                            spellLevel === level
                              ? "border-forge-gold/40 bg-forge-gold/10 text-forge-gold"
                              : "border-white/10 text-white/35 hover:border-forge-gold/30 hover:text-forge-gold",
                          ].join(" ")}
                        >
                          {getSpellLevelFilterLabel(level)} · {count}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-3">
                    {spellPreview.length > 0 ? (
                      spellPreview.map((spell) => (
                        <SystemLibrarySpellPreview
                          key={spell.id}
                          spell={spell}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                        Nenhuma magia encontrada para os filtros atuais.
                      </div>
                    )}
                  </div>

                  {filteredSpells.length > spellPreview.length ? (
                    <p className="mt-3 text-center text-[10px] font-bold text-white/30">
                      Exibindo {spellPreview.length} de {filteredSpells.length} nesta categoria.
                      A navegação completa será aprofundada nas próximas etapas
                      da Biblioteca.
                    </p>
                  ) : null}
                  </section>
                ) : null}

                {shouldShowCharacters ? (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                          Personagens
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/40">
                          Fichas-base completas e reutilizáveis do sistema.
                        </p>
                      </div>

                      <span className="text-xs font-black text-white/35">
                        {library.summary.characterTemplateCount}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {library.characterTemplates.length > 0 ? (
                        library.characterTemplates.map((template) => (
                          <SystemLibraryCharacterTemplatePreview
                            key={template.id}
                            template={template}
                            isGM={isGM}
                            isImporting={
                              importingCharacterTemplateId === template.id
                            }
                            onImport={onImportCharacterTemplate}
                          />
                        ))
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                          Nenhum personagem-template cadastrado neste sistema.
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                {shouldShowNpcs ? (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                          NPCs
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/40">
                          Templates reutilizáveis de NPC pertencentes ao sistema.
                        </p>
                      </div>

                      <span className="text-xs font-black text-white/35">
                        {library.summary.npcTemplateCount}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {library.npcTemplates.length > 0 ? (
                        library.npcTemplates.map((template) => (
                          <SystemLibraryNpcTemplatePreview
                            key={template.id}
                            template={template}
                            isGM={isGM}
                            isImporting={importingNpcTemplateId === template.id}
                            onImport={() => onImportNpcTemplate(template.id)}
                          />
                        ))
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                          Nenhum template de NPC cadastrado neste sistema.
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                {shouldShowCreatures ? (
                  <section className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                          Criaturas
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/40">
                          Templates reutilizáveis de criaturas pertencentes ao sistema.
                        </p>
                      </div>

                      <span className="text-xs font-black text-white/35">
                        {library.summary.creatureTemplateCount}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {library.creatureTemplates.length > 0 ? (
                        library.creatureTemplates.map((template) => (
                          <SystemLibraryCreatureTemplatePreview
                            key={template.id}
                            template={template}
                            isGM={isGM}
                            isImporting={
                              importingCreatureTemplateId === template.id
                            }
                            onImport={() =>
                              onImportCreatureTemplate(template.id)
                            }
                          />
                        ))
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-xs font-semibold text-white/40">
                          Nenhum template de criatura cadastrado neste sistema.
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-8 text-center">
              <p className="text-sm font-black text-white">
                Biblioteca ainda não carregada.
              </p>
              <p className="mt-2 text-xs font-semibold text-white/40">
                O conteúdo será carregado a partir do sistema vinculado à
                campanha.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 px-5 py-3">
          <p className="text-[10px] font-semibold leading-relaxed text-white/30">
            A Biblioteca do Sistema é somente leitura nesta fase. Alterações em
            instâncias da campanha não devem modificar o conteúdo-base do
            sistema.
          </p>
        </footer>
      </section>
    </div>
  );
}
