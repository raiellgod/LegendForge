import Image from "next/image";
import { useState } from "react";

import type {
  CharacterAttributeKey,
  CharacterBuilderSkillOption,
  CharacterReadySheet,
} from "@/features/character-builder/types/character-builder-types";

import type { CampaignActor } from "@/features/game-table/types/game-table-types";

import {
  formatSignedNumber,
  getAttributeLabel,
  getAttributeModifier,
  getAttributeShortLabel,
  getAttributeValueFromStats,
  getInitiativeBonus,
  getPassivePerception,
  getProficiencyBonusByLevel,
  getSavingThrowBonus,
  getSkillBonus,
  getSpellAttackBonus,
  getSpellSaveDc,
  getSpellcastingAbilityKey,
  getSpellcastingAbilityModifier,
} from "@/features/character-builder/utils/character-sheet-calculations";
import { getCharacterTypeStyles } from "@/features/game-table/utils/actor-utils";

export type CharacterReadySheetRollRequest =
  | {
      kind: "d20";
      label: string;
      modifier: number;
    }
  | {
      kind: "damage";
      label: string;
      expression: string;
    }
  | {
      kind: "effect";
      label: string;
      description: string;
    };

export type CharacterReadySheetViewProps = {
  actor: CampaignActor;
  characterSheet: CharacterReadySheet | null;
  allSkills: CharacterBuilderSkillOption[];
  isGM: boolean;
  isSavingImages: boolean;
  popoutUrl?: string;
  onSaveImages: (
    characterSheetId: string,
    data: {
      portraitUrl: string | null;
      tokenImageUrl: string | null;
      tokenImageFit: CharacterReadySheet["tokenImageFit"];
    },
  ) => Promise<void>;
  onRollSheetAction: (request: CharacterReadySheetRollRequest) => void;
  onClose: () => void;
};

const READY_SHEET_ATTRIBUTES: Array<{
  key: CharacterAttributeKey;
  label: string;
  shortName: string;
}> = [
  {
    key: "strength",
    label: "Força",
    shortName: "FOR",
  },
  {
    key: "dexterity",
    label: "Destreza",
    shortName: "DES",
  },
  {
    key: "constitution",
    label: "Constituição",
    shortName: "CON",
  },
  {
    key: "intelligence",
    label: "Inteligência",
    shortName: "INT",
  },
  {
    key: "wisdom",
    label: "Sabedoria",
    shortName: "SAB",
  },
  {
    key: "charisma",
    label: "Carisma",
    shortName: "CAR",
  },
];

type ReadySheetTab =
  | "status"
  | "combat"
  | "bag"
  | "spells"
  | "features"
  | "profile"
  | "notes";

type TokenImageFitOption = "FILL" | "COVER" | "CONTAIN";

function SheetTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
        isActive
          ? "border-forge-gold bg-forge-gold text-zinc-950"
          : "border-white/10 bg-black/25 text-white/45 hover:border-forge-gold/50 hover:text-forge-gold",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SheetTextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-xl border border-white/10 bg-black/25 p-2.5">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
      />
    </label>
  );
}

function ImagePreviewBox({
  label,
  imageUrl,
  fallback,
  imageFit,
}: {
  label: string;
  imageUrl: string;
  fallback: string;
  imageFit: TokenImageFitOption;
}) {
  const objectFitClass =
    imageFit === "CONTAIN"
      ? "object-contain"
      : imageFit === "COVER"
        ? "object-cover"
        : "object-fill";

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <div className="mt-2 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-black/35">
        {imageUrl.trim() ? (
          <Image
            src={imageUrl}
            alt={label}
            width={512}
            height={512}
            unoptimized
            className={`h-full w-full ${objectFitClass}`}
          />
        ) : (
          <span className="text-2xl font-black text-forge-gold/70">
            {fallback}
          </span>
        )}
      </div>
    </div>
  );
}

function SheetBox({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2.5 shadow-[-3px_3px_0_rgba(0,0,0,0.22)]">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>

      <p
        className="mt-1 min-w-0 break-words text-xl font-black leading-tight text-forge-gold"
        title={value}
      >
        {value}
      </p>

      {helper ? (
        <p className="mt-0.5 text-[9px] font-semibold leading-relaxed text-white/40">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function CompactAttributePill({
  shortName,
  label,
  value,
}: {
  shortName: string;
  label: string;
  value: number | null;
}) {
  const modifier = getAttributeModifier(value);
  const displayValue = typeof value === "number" ? String(value) : "—";
  const displayModifier =
    typeof value === "number" ? formatSignedNumber(modifier) : "—";

  return (
    <div
      className="rounded-xl border border-forge-gold/20 bg-black/25 px-3 py-2 text-center shadow-[-2px_2px_0_rgba(0,0,0,0.2)]"
      title={`${label}: ${displayValue} (${displayModifier})`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
        {shortName}
      </p>

      <div className="mt-1 flex items-baseline justify-center gap-1.5">
        <span className="text-lg font-black leading-none text-forge-gold">
          {displayValue}
        </span>
        <span className="text-[10px] font-black text-white/45">
          {displayModifier}
        </span>
      </div>
    </div>
  );
}

function CompactInfoPill({
  label,
  value,
  helper,
  onClick,
  title,
}: {
  label: string;
  value: string;
  helper?: string;
  onClick?: () => void;
  title?: string;
}) {
  const content = (
    <>
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>

      <p className="mt-1 min-w-0 break-words text-base font-black leading-tight text-forge-gold">
        {value}
      </p>

      {helper ? (
        <p className="mt-0.5 text-[8px] font-semibold text-white/35">
          {helper}
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left shadow-[-2px_2px_0_rgba(0,0,0,0.2)] transition hover:border-forge-gold/45 hover:bg-forge-gold/10"
        title={title ?? "Rolar esta ação."}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 shadow-[-2px_2px_0_rgba(0,0,0,0.2)]"
      title={title ?? `${label}: ${value}`}
    >
      {content}
    </div>
  );
}

function CompactSavingThrowButton({
  shortName,
  label,
  value,
  isProficient,
  onRoll,
}: {
  shortName: string;
  label: string;
  value: number;
  isProficient: boolean;
  onRoll: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRoll}
      className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-left shadow-[-2px_2px_0_rgba(0,0,0,0.2)] transition hover:border-forge-gold/45 hover:bg-forge-gold/10"
      title={`Rolar teste de resistência de ${label}.`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={[
            "h-2 w-2 shrink-0 rounded-full",
            isProficient ? "bg-forge-gold" : "border border-white/25",
          ].join(" ")}
          aria-hidden="true"
        />

        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45 group-hover:text-forge-gold">
          {shortName}
        </span>
      </span>

      <span className="text-xs font-black text-forge-gold">
        {formatSignedNumber(value)}
      </span>
    </button>
  );
}

function RollableLine({
  label,
  helper,
  value,
  isProficient,
  proficiencyLabel,
  onRoll,
}: {
  label: string;
  helper: string;
  value: number;
  isProficient: boolean;
  proficiencyLabel?: string;
  onRoll?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRoll}
      title="Rolar 1d20 com este modificador."
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-2.5 py-1.5 text-left transition hover:border-forge-gold/45 hover:bg-forge-gold/10"
    >
      <div className="flex min-w-0 items-center gap-2">
        {isProficient ? (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-forge-gold"
            title={proficiencyLabel ?? "Proficiente"}
            aria-label={proficiencyLabel ?? "Proficiente"}
          />
        ) : (
          <span
            className="h-2 w-2 shrink-0 rounded-full border border-white/20"
            title="Não proficiente"
            aria-label="Não proficiente"
          />
        )}

        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-xs font-bold leading-snug text-white/65 group-hover:text-white/85"
            title={label}
          >
            {label}
          </p>

          <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
            {helper}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="min-w-9 text-right text-xs font-black text-forge-gold">
          {formatSignedNumber(value)}
        </span>
      </div>
    </button>
  );
}

function CompactListRow({
  title,
  value,
  helper,
}: {
  title: string;
  value?: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <p
          className="min-w-0 break-words text-xs font-black leading-snug text-white/70"
          title={title}
        >
          {title}
        </p>

        {value ? (
          <span className="shrink-0 text-xs font-black text-forge-gold">
            {value}
          </span>
        ) : null}
      </div>

      {helper ? (
        <p
          className="mt-1 line-clamp-3 text-[10px] font-semibold leading-relaxed text-white/35"
          title={helper}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function getDamageRollExpression(damage: string) {
  const normalizedDamage = damage.toLowerCase().replace(/\s+/g, "");
  const damageExpression = normalizedDamage.match(/\d*d\d+(?:[+-]\d+)?/);

  return damageExpression?.[0] ?? damage;
}

function getFirstDamageExpressionFromText(text: string | null | undefined) {
  if (!text) {
    return null;
  }

  const normalizedText = text.toLowerCase().replace(/\s+/g, "");
  const damageExpression = normalizedText.match(/\d*d\d+(?:[+-]\d+)?/);

  return damageExpression?.[0] ?? null;
}

function getSpellDamageLabelFromText(text: string | null | undefined) {
  if (!text) {
    return null;
  }

  const damageInfo = text.match(/(\d*d\d+(?:[+-]\d+)?)(?:\s+([A-Za-zÀ-ÿ]+))?/i);

  if (!damageInfo) {
    return null;
  }

  const [, formula, damageType] = damageInfo;

  return damageType ? `${formula} ${damageType}` : formula;
}

type SpellSlotRow = {
  level: number;
  total: number;
};

type CharacterReadySheetClass = NonNullable<
  CharacterReadySheet["characterClass"]
>;

type CharacterReadySheetLevelProgression =
  CharacterReadySheetClass["levelProgressions"][number];

function getSpellSlotRowsFromProgression(
  progression: CharacterReadySheetLevelProgression | null | undefined,
): SpellSlotRow[] {
  if (!progression) {
    return [];
  }

  return [
    { level: 1, total: progression.spellSlotsLevel1 },
    { level: 2, total: progression.spellSlotsLevel2 },
    { level: 3, total: progression.spellSlotsLevel3 },
    { level: 4, total: progression.spellSlotsLevel4 },
    { level: 5, total: progression.spellSlotsLevel5 },
    { level: 6, total: progression.spellSlotsLevel6 },
    { level: 7, total: progression.spellSlotsLevel7 },
    { level: 8, total: progression.spellSlotsLevel8 },
    { level: 9, total: progression.spellSlotsLevel9 },
  ].filter((slot) => slot.total > 0);
}

function SpellCard({
  name,
  level,
  school,
  castingTime,
  range,
  duration,
  components,
  description,
  damageLabel,
  isAttackDisabled,
  attackDisabledReason,
  isExpanded,
  onToggleExpanded,
  onRollAttack,
  onRollDamage,
}: {
  name: string;
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string[] | string | null;
  description: string | null;
  damageLabel: string | null;
  isAttackDisabled: boolean;
  attackDisabledReason: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRollAttack: () => void;
  onRollDamage?: () => void;
}) {
  const levelLabel = level === 0 ? "Truque" : `Nível ${level}`;
  const readableDescription =
    description?.trim() || "Sem descrição cadastrada.";
  const readableDamage = damageLabel ?? "—";

  const componentLabel = Array.isArray(components)
    ? components.length > 0
      ? components.join(", ")
      : "—"
    : components?.trim() || "—";

  return (
    <article
      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 transition hover:border-forge-gold/35 hover:bg-forge-gold/5"
      title={readableDescription}
    >
      <div className="grid gap-2 xl:grid-cols-[minmax(160px,1fr)_minmax(0,2fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p
              className="min-w-0 break-words text-sm font-black leading-snug text-forge-gold"
              title={name}
            >
              {name}
            </p>

            <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-0.5 text-[9px] font-black text-forge-gold lg:hidden">
              {levelLabel}
            </span>
          </div>

          <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
            {levelLabel} · {school}
          </p>
        </div>

        <div className="grid gap-1.5 text-[10px] font-semibold text-white/45 md:grid-cols-3">
          <p
            className="rounded-lg border border-forge-gold/15 bg-forge-gold/5 px-2 py-1"
            title={`Dano detectado: ${readableDamage}`}
          >
            <span className="font-black text-white/35">Dano:</span>{" "}
            <span className="font-black text-forge-gold">{readableDamage}</span>
          </p>

          <p className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
            <span className="font-black text-white/35">Conj.:</span>{" "}
            {castingTime ?? "—"}
          </p>

          <p className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
            <span className="font-black text-white/35">Alc.:</span>{" "}
            {range ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            disabled={isAttackDisabled}
            onClick={onRollAttack}
            className={[
              "rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] transition",
              isAttackDisabled
                ? "cursor-not-allowed border-white/5 bg-black/20 text-white/20"
                : "border-white/10 bg-black/35 text-white/45 hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold",
            ].join(" ")}
            title={
              isAttackDisabled
                ? attackDisabledReason
                : `Rolar ataque mágico de ${name}. O bônus usa atributo de conjuração + proficiência.`
            }
          >
            Ataque
          </button>

          {onRollDamage ? (
            <button
              type="button"
              onClick={onRollDamage}
              className="rounded-lg border border-forge-gold/30 bg-forge-gold/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
              title={`Rolar dano de ${name}: ${readableDamage}.`}
            >
              Dano
            </button>
          ) : null}

          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
            title={
              isExpanded
                ? `Ocultar detalhes de ${name}.`
                : `Ver detalhes de ${name}.`
            }
          >
            {isExpanded ? "Ocultar" : "Detalhes"}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="grid gap-2 text-[10px] font-semibold text-white/45 md:grid-cols-2">
            <p>
              <span className="font-black text-white/35">Duração:</span>{" "}
              {duration ?? "—"}
            </p>

            <p>
              <span className="font-black text-white/35">Componentes:</span>{" "}
              {componentLabel}
            </p>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/55">
            {readableDescription}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function EquipmentAttackCard({
  name,
  damageLabel,
  helper,
  isExpanded,
  onToggleExpanded,
  onRollAttack,
  onRollDamage,
}: {
  name: string;
  damageLabel: string;
  helper: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRollAttack: () => void;
  onRollDamage: () => void;
}) {
  return (
    <article
      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 transition hover:border-forge-gold/35 hover:bg-forge-gold/5"
      title={helper}
    >
      <div className="grid gap-2 xl:grid-cols-[minmax(180px,1fr)_160px_auto] xl:items-center">
        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-sm font-black leading-snug text-forge-gold"
            title={name}
          >
            {name}
          </p>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-white/35">
            {helper}
          </p>
        </div>

        <p
          className="rounded-lg border border-forge-gold/15 bg-forge-gold/5 px-2 py-1 text-[10px] font-black text-forge-gold"
          title={`Dano: ${damageLabel}`}
        >
          Dano: {damageLabel}
        </p>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onRollAttack}
            className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
            title={`Rolar ataque básico de ${name}: 1d20 + 0. Bônus real, alvo e comparação com CA entram em micro futura.`}
          >
            Ataque
          </button>

          <button
            type="button"
            onClick={onRollDamage}
            className="rounded-lg border border-forge-gold/30 bg-forge-gold/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
            title={`Rolar dano de ${name}: ${damageLabel}. Use depois que o ataque acertar.`}
          >
            Dano
          </button>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
          >
            {isExpanded ? "Ocultar" : "Detalhes"}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <p className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold leading-relaxed text-white/55">
          {helper}
        </p>
      ) : null}
    </article>
  );
}

function EquipmentListCard({
  title,
  helper,
  value,
  isExpanded,
  onToggleExpanded,
}: {
  title: string;
  helper: string | null;
  value?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <article
      className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 transition hover:border-forge-gold/35 hover:bg-forge-gold/5"
      title={helper ?? title}
    >
      <div className="grid gap-2 xl:grid-cols-[minmax(180px,1fr)_120px_auto] xl:items-center">
        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-sm font-black leading-snug text-white/70"
            title={title}
          >
            {title}
          </p>

          {helper ? (
            <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-white/35">
              {helper}
            </p>
          ) : null}
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-forge-gold xl:text-right">
          {value ?? "Guardado"}
        </p>

        {helper ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="justify-self-start rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold xl:justify-self-end"
          >
            {isExpanded ? "Ocultar" : "Detalhes"}
          </button>
        ) : null}
      </div>

      {helper && isExpanded ? (
        <p className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold leading-relaxed text-white/55">
          {helper}
        </p>
      ) : null}
    </article>
  );
}

function NarrativeField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/60">
        {value?.trim() || "Não informado."}
      </p>
    </div>
  );
}

export function CharacterReadySheetView({
  actor,
  characterSheet,
  allSkills,
  isGM,
  isSavingImages,
  popoutUrl,
  onSaveImages,
  onRollSheetAction,
  onClose,
}: CharacterReadySheetViewProps) {
  const [activeTab, setActiveTab] = useState<ReadySheetTab>("status");
  const [expandedSpellKeys, setExpandedSpellKeys] = useState<string[]>([]);
  const [expandedEquipmentKeys, setExpandedEquipmentKeys] = useState<string[]>(
    [],
  );

  function toggleExpandedSpell(spellKey: string) {
    setExpandedSpellKeys((currentKeys) =>
      currentKeys.includes(spellKey)
        ? currentKeys.filter((currentKey) => currentKey !== spellKey)
        : [...currentKeys, spellKey],
    );
  }

  function toggleExpandedEquipment(equipmentKey: string) {
    setExpandedEquipmentKeys((currentKeys) =>
      currentKeys.includes(equipmentKey)
        ? currentKeys.filter((currentKey) => currentKey !== equipmentKey)
        : [...currentKeys, equipmentKey],
    );
  }

  const [editablePortraitUrl, setEditablePortraitUrl] = useState(
    characterSheet?.portraitUrl ?? actor.portraitUrl ?? "",
  );

  const [editableTokenImageUrl, setEditableTokenImageUrl] = useState(
    characterSheet?.tokenImageUrl ?? "",
  );

  const [editableTokenImageFit, setEditableTokenImageFit] =
    useState<TokenImageFitOption>(characterSheet?.tokenImageFit ?? "FILL");

  const [imageSaveError, setImageSaveError] = useState<string | null>(null);
  const [imageSaveSuccess, setImageSaveSuccess] = useState<string | null>(null);

  function handleOpenPopout() {
    if (!popoutUrl) {
      return;
    }

    window.open(
      popoutUrl,
      `legendforge-sheet-${characterSheet?.id ?? actor.id}`,
      "width=1280,height=860",
    );
  }

  async function handleSaveImages() {
    if (!characterSheet) {
      setImageSaveError("Esta ficha ainda não está carregada.");
      setImageSaveSuccess(null);
      return;
    }

    setImageSaveError(null);
    setImageSaveSuccess(null);

    try {
      await onSaveImages(characterSheet.id, {
        portraitUrl: editablePortraitUrl.trim() || null,
        tokenImageUrl: editableTokenImageUrl.trim() || null,
        tokenImageFit: editableTokenImageFit,
      });

      setImageSaveSuccess("Imagens salvas com sucesso.");
    } catch (error) {
      setImageSaveError(
        error instanceof Error ? error.message : "Erro ao salvar imagens.",
      );
    }
  }

  const sheetStats = characterSheet?.stats ?? [];
  const sheetSkills = characterSheet?.skills ?? [];
  const sheetLevel = characterSheet?.level ?? 1;

  const savingThrows = READY_SHEET_ATTRIBUTES.map((attribute) => {
    const sheetStat = sheetStats.find(
      (currentStat) => currentStat.stat.key === attribute.key,
    );

    const isProficient = Boolean(sheetStat?.isSavingThrowProficient);
    const value = characterSheet
      ? getSavingThrowBonus({
          stats: sheetStats,
          attributeKey: attribute.key,
          level: sheetLevel,
          isProficient,
          bonusValue: sheetStat?.bonusValue ?? 0,
          overrideValue: sheetStat?.overrideValue ?? null,
        })
      : 0;

    return {
      ...attribute,
      value,
      isProficient,
    };
  });

  const sheetSkillsByKey = new Map(
    sheetSkills.map((sheetSkill) => [sheetSkill.skill.key, sheetSkill]),
  );

  const skillSource =
    allSkills.length > 0
      ? allSkills
      : sheetSkills.map((sheetSkill) => ({
          id: sheetSkill.skill.id,
          key: sheetSkill.skill.key,
          name: sheetSkill.skill.name,
          description: sheetSkill.skill.description,
          statId: sheetSkill.skill.stat.id,
          stat: sheetSkill.skill.stat,
        }));

  const sheetSkillRows = skillSource
    .map((skillOption) => {
      const savedSheetSkill = sheetSkillsByKey.get(skillOption.key);
      const expertiseLevel = savedSheetSkill?.expertiseLevel ?? 0;
      const isProficient = Boolean(savedSheetSkill?.isProficient);

      const normalizedSheetSkill = {
        isProficient,
        expertiseLevel,
        bonusValue: savedSheetSkill?.bonusValue ?? 0,
        overrideValue: savedSheetSkill?.overrideValue ?? null,
        skill: {
          key: skillOption.key,
          name: skillOption.name,
          stat: {
            key: skillOption.stat.key,
          },
        },
      };

      return {
        id: skillOption.key,
        name: skillOption.name,
        statShortName: skillOption.stat.shortName,
        isProficient,
        expertiseLevel,
        value: characterSheet
          ? getSkillBonus({
              stats: sheetStats,
              skill: normalizedSheetSkill,
              level: sheetLevel,
            })
          : 0,
      };
    })
    .sort((firstSkill, secondSkill) =>
      firstSkill.name.localeCompare(secondSkill.name, "pt-BR"),
    );

  const skillGroupsByAttribute = READY_SHEET_ATTRIBUTES.map((attribute) => ({
    ...attribute,
    skills: sheetSkillRows.filter(
      (skill) => skill.statShortName === attribute.shortName,
    ),
  })).filter((group) => group.skills.length > 0);

  const attackRows =
    characterSheet?.equipment
      .filter((sheetEquipment) => Boolean(sheetEquipment.equipment.damage))
      .map((sheetEquipment) => {
        const damageLabel = sheetEquipment.equipment.damage ?? "—";
        const damageExpression = getDamageRollExpression(damageLabel);

        return {
          id: sheetEquipment.equipment.key,
          name: sheetEquipment.equipment.name,
          damageLabel,
          damageExpression,
          helper:
            sheetEquipment.equipment.properties ??
            sheetEquipment.equipment.description ??
            "Ataque derivado de equipamento.",
        };
      }) ?? [];

  const equipmentRows =
    characterSheet?.equipment
      .map((sheetEquipment) => ({
        id: sheetEquipment.equipment.key,
        name: sheetEquipment.equipment.name,
        quantity: sheetEquipment.quantity,
        helper:
          sheetEquipment.notes ??
          sheetEquipment.equipment.properties ??
          sheetEquipment.equipment.description ??
          sheetEquipment.source ??
          null,
        isEquipped: sheetEquipment.isEquipped,
      }))
      .sort((firstItem, secondItem) =>
        firstItem.name.localeCompare(secondItem.name, "pt-BR"),
      ) ?? [];

  const startingGold = characterSheet
    ? String(characterSheet.startingGold)
    : "—";

  const spellsByLevel = (characterSheet?.spells ?? []).reduce<
    Record<number, CharacterReadySheet["spells"]>
  >((groups, sheetSpell) => {
    const level = sheetSpell.spell.level;

    return {
      ...groups,
      [level]: [...(groups[level] ?? []), sheetSpell],
    };
  }, {});

  const sortedSpellLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((firstLevel, secondLevel) => firstLevel - secondLevel);

  const cantripSpells = spellsByLevel[0] ?? [];
  const leveledSpellLevels = sortedSpellLevels.filter((level) => level > 0);
  const hasAnyKnownSpell = sortedSpellLevels.length > 0;

  const spellcastingClass = characterSheet?.characterClass?.name ?? "—";

  const spellcastingAbilityKey = getSpellcastingAbilityKey(
    characterSheet?.characterClass?.spellcastingAbilityKey,
  );

  const spellcastingAbilityModifier = characterSheet
    ? getSpellcastingAbilityModifier({
        stats: sheetStats,
        spellcastingAbilityKey,
      })
    : null;

  const spellSaveDcValue = characterSheet
    ? getSpellSaveDc({
        stats: sheetStats,
        level: sheetLevel,
        spellcastingAbilityKey,
      })
    : null;

  const spellAttackBonusValue = characterSheet
    ? getSpellAttackBonus({
        stats: sheetStats,
        level: sheetLevel,
        spellcastingAbilityKey,
      })
    : null;

  const currentLevelProgression =
    characterSheet?.characterClass?.levelProgressions.find(
      (progression) => progression.level === sheetLevel,
    ) ?? null;

  const spellSlotRows = getSpellSlotRowsFromProgression(
    currentLevelProgression,
  );

  const hasSpellSlots = spellSlotRows.length > 0;

  const spellSlotsSummary = hasSpellSlots
    ? spellSlotRows.map((slot) => `N${slot.level}: ${slot.total}`).join(" · ")
    : "Sem espaços";

  const spellcastingAbility = spellcastingAbilityKey
    ? `${getAttributeLabel(spellcastingAbilityKey)} (${getAttributeShortLabel(
        spellcastingAbilityKey,
      )} ${formatSignedNumber(spellcastingAbilityModifier ?? 0)})`
    : "—";

  const spellSaveDc =
    spellSaveDcValue === null ? "—" : String(spellSaveDcValue);

  const spellAttackBonus =
    spellAttackBonusValue === null
      ? "—"
      : formatSignedNumber(spellAttackBonusValue);

  const spellSummaryCards = [
    {
      label: "Classe",
      value: spellcastingClass,
      helper: "conjuradora",
    },
    {
      label: "Habilidade",
      value: spellcastingAbility,
      helper: "atributo",
    },
    {
      label: "CD",
      value: spellSaveDc,
      helper: "magia",
    },
    {
      label: "Ataque",
      value: spellAttackBonus,
      helper: "mágico",
    },
    {
      label: "Espaços",
      value: spellSlotsSummary,
      helper: "por nível",
    },
  ];

  const appearanceRows = [
    {
      label: "Idade",
      value: characterSheet?.age,
    },
    {
      label: "Altura",
      value: characterSheet?.height,
    },
    {
      label: "Peso",
      value: characterSheet?.weight,
    },
    {
      label: "Olhos",
      value: characterSheet?.eyes,
    },
    {
      label: "Pele",
      value: characterSheet?.skin,
    },
    {
      label: "Cabelo",
      value: characterSheet?.hair,
    },
  ];

  const hasAnyAppearanceInfo = appearanceRows.some((row) => row.value?.trim());

  const initiativeBonus = characterSheet
    ? formatSignedNumber(getInitiativeBonus(sheetStats))
    : "—";

  const proficiencyBonus = characterSheet
    ? formatSignedNumber(getProficiencyBonusByLevel(sheetLevel))
    : "—";

  const passivePerception = characterSheet
    ? String(
        getPassivePerception({
          stats: sheetStats,
          skills: sheetSkills,
          level: sheetLevel,
        }),
      )
    : "—";

  const displayName = characterSheet?.name ?? actor.name;
  const classAndLevel = characterSheet?.characterClass
    ? `${characterSheet.characterClass.name} ${characterSheet.level}`
    : "—";

  const ancestryName = characterSheet?.ancestry?.name ?? "—";
  const backgroundName = characterSheet?.background?.name ?? "—";
  const experience = characterSheet ? String(characterSheet.experience) : "—";
  const armorClass = characterSheet ? String(characterSheet.armorClass) : "—";
  const speed = characterSheet ? `${characterSheet.speed}m` : "—";
  const hitPoints = characterSheet ? String(characterSheet.hitPoints) : "—";
  const maxHitPoints = characterSheet
    ? String(characterSheet.maxHitPoints)
    : "—";
  const temporaryHp = characterSheet ? String(characterSheet.temporaryHp) : "—";
  const hitDiceUsed = characterSheet ? String(characterSheet.hitDiceUsed) : "—";
  const deathSaves = characterSheet
    ? `${characterSheet.deathSaveSuccesses} / ${characterSheet.deathSaveFailures}`
    : "— / —";
  const inspiration = characterSheet
    ? characterSheet.inspiration
      ? "Sim"
      : "Não"
    : "—";

  return (
    <div className="flex h-[min(900px,96vh)] w-full max-w-[min(96vw,1400px)] flex-col overflow-hidden rounded-2xl border border-forge-gold/50 bg-[#120816] shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
      <header className="shrink-0 border-b border-forge-gold/25 bg-[#1a0d20] px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {editablePortraitUrl.trim() ? (
              <div
                className="h-12 w-12 shrink-0 rounded-xl border border-forge-gold/40 bg-cover bg-center shadow-[-4px_4px_0_rgba(0,0,0,0.35)] sm:h-14 sm:w-14"
                style={{
                  backgroundImage: `url(${editablePortraitUrl})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-lg font-black shadow-[-4px_4px_0_rgba(0,0,0,0.35)] sm:h-14 sm:w-14 sm:text-xl ${getCharacterTypeStyles(
                  actor.type,
                )}`}
              >
                {actor.initials}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="min-w-0 break-words text-xl font-black leading-tight text-forge-gold sm:text-2xl">
                {displayName}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/50">
                  {classAndLevel}
                </span>

                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/50">
                  {ancestryName}
                </span>

                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/50">
                  {backgroundName}
                </span>

                <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-forge-gold">
                  XP {experience}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {popoutUrl ? (
              <button
                type="button"
                onClick={handleOpenPopout}
                className="rounded-xl border border-forge-gold/30 bg-forge-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
                title="Abrir esta ficha em uma janela separada."
              >
                Abrir em janela
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="text-xl font-black text-white/45 transition hover:text-forge-gold"
              aria-label="Fechar ficha"
              title="Fechar ficha"
            >
              ×
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:grid-cols-6 sm:gap-2">
          {READY_SHEET_ATTRIBUTES.map((attribute) => (
            <CompactAttributePill
              key={attribute.key}
              shortName={attribute.shortName}
              label={attribute.label}
              value={getAttributeValueFromStats(sheetStats, attribute.key)}
            />
          ))}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5 sm:gap-2 xl:grid-cols-10">
          <CompactInfoPill label="CA" value={armorClass} helper="armadura" />

          <CompactInfoPill
            label="Iniciativa"
            value={initiativeBonus}
            helper="rolar"
            onClick={() =>
              onRollSheetAction({
                kind: "d20",
                label: `Iniciativa — ${displayName}`,
                modifier: getInitiativeBonus(sheetStats),
              })
            }
            title="Rolar iniciativa."
          />

          <CompactInfoPill label="Desloc." value={speed} helper="metros" />
          <CompactInfoPill
            label="Prof."
            value={proficiencyBonus}
            helper="nível"
          />
          <CompactInfoPill
            label="Percepção"
            value={passivePerception}
            helper="passiva"
          />
          <CompactInfoPill
            label="PV"
            value={`${hitPoints}/${maxHitPoints}`}
            helper="atual/máx."
          />
          <CompactInfoPill
            label="Temp."
            value={temporaryHp}
            helper="PV temp."
          />
          <CompactInfoPill label="Dados" value={hitDiceUsed} helper="vida" />
          <CompactInfoPill label="Morte" value={deathSaves} helper="testes" />
          <CompactInfoPill label="Insp." value={inspiration} helper="estado" />
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2 xl:grid-cols-6">
          {savingThrows.map((savingThrow) => (
            <CompactSavingThrowButton
              key={savingThrow.key}
              shortName={savingThrow.shortName}
              label={savingThrow.label}
              value={savingThrow.value}
              isProficient={savingThrow.isProficient}
              onRoll={() =>
                onRollSheetAction({
                  kind: "d20",
                  label: `Teste de resistência — ${savingThrow.label}`,
                  modifier: savingThrow.value,
                })
              }
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <SheetTabButton
            label="Ficha/Status"
            isActive={activeTab === "status"}
            onClick={() => setActiveTab("status")}
          />

          <SheetTabButton
            label="Combate"
            isActive={activeTab === "combat"}
            onClick={() => setActiveTab("combat")}
          />

          <SheetTabButton
            label="Bolsa"
            isActive={activeTab === "bag"}
            onClick={() => setActiveTab("bag")}
          />

          <SheetTabButton
            label="Magia"
            isActive={activeTab === "spells"}
            onClick={() => setActiveTab("spells")}
          />

          <SheetTabButton
            label="Features"
            isActive={activeTab === "features"}
            onClick={() => setActiveTab("features")}
          />

          <SheetTabButton
            label="Perfil"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />

          <SheetTabButton
            label="Notas"
            isActive={activeTab === "notes"}
            onClick={() => setActiveTab("notes")}
          />
        </div>
      </header>

      {activeTab === "status" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-3">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Perícias por atributo
                    </p>
                  </div>
                </div>

                {skillGroupsByAttribute.length > 0 ? (
                  <div className="mt-3 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                    {skillGroupsByAttribute.map((group) => (
                      <div
                        key={group.key}
                        className="rounded-2xl border border-white/10 bg-black/20 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div>
                            <p className="text-[10px] font-black text-forge-gold">
                              {group.shortName}
                            </p>

                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                              {group.label}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 grid gap-1.5">
                          {group.skills.map((skill) => (
                            <RollableLine
                              key={skill.id}
                              label={skill.name}
                              helper={skill.statShortName}
                              value={skill.value}
                              isProficient={skill.isProficient}
                              proficiencyLabel={
                                skill.expertiseLevel > 1
                                  ? `Proficiente com especialização x${skill.expertiseLevel}`
                                  : "Proficiente"
                              }
                              onRoll={() =>
                                onRollSheetAction({
                                  kind: "d20",
                                  label: `Perícia — ${skill.name}`,
                                  modifier: skill.value,
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhuma perícia registrada nesta ficha.
                  </p>
                )}
              </section>
            </main>

            <aside className="space-y-3">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Ações rápidas
                </p>

                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
                  Estes botões ficam preparados para a próxima leva de regras da
                  ficha.
                </p>

                <div className="mt-3 grid gap-2">
                  {[
                    "Descanso curto",
                    "Descanso longo",
                    "Aplicar dano",
                    "Aplicar cura",
                  ].map((actionLabel) => (
                    <button
                      key={actionLabel}
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-white/20"
                      title="Ação planejada para micro futura."
                    >
                      {actionLabel}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Próximos blocos
                </p>

                <div className="mt-3 grid gap-1.5">
                  <CompactListRow
                    title="Traços e features"
                    helper="Entram em uma aba própria depois da estrutura base."
                  />

                  <CompactListRow
                    title="Condições e efeitos"
                    helper="Ficam ligados futuramente ao sistema de status."
                  />

                  <CompactListRow
                    title="Defesas e sentidos"
                    helper="Podem virar uma lateral fixa na ficha completa."
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      ) : activeTab === "combat" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Combate
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <SheetBox label="CA" value={armorClass} helper="defesa" />
                  <SheetBox
                    label="Iniciativa"
                    value={initiativeBonus}
                    helper="bônus"
                  />
                  <SheetBox label="Desloc." value={speed} helper="movimento" />
                  <SheetBox
                    label="PV"
                    value={`${hitPoints}/${maxHitPoints}`}
                    helper="atual/máx."
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Ações de combate
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <CompactListRow
                    title="Ataques reais por equipamento"
                    helper="Entram na próxima macro de regras avançadas de equipamento."
                  />
                  <CompactListRow
                    title="Ataque contra CA manual"
                    helper="Preparado para comparar rolagem de ataque contra defesa do alvo."
                  />
                  <CompactListRow
                    title="Condições e efeitos"
                    helper="Fica ligado ao futuro sistema de status."
                  />
                  <CompactListRow
                    title="Ações, bônus e reação"
                    helper="Espaço reservado para economia de ações em combate."
                  />
                </div>
              </section>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Preparação
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">
                  Esta aba separa combate da Ficha/Status para receber ataques,
                  ações e efeitos sem poluir perícias e informações gerais.
                </p>
              </section>
            </aside>
          </div>
        </div>
      ) : activeTab === "bag" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Ataques por equipamento
                </p>

                {attackRows.length > 0 ? (
                  <div className="mt-2 grid gap-2">
                    {attackRows.map((attack, index) => {
                      const attackKey = `attack-${attack.id}-${index}`;

                      return (
                        <EquipmentAttackCard
                          key={attackKey}
                          name={attack.name}
                          damageLabel={attack.damageLabel}
                          helper={attack.helper}
                          isExpanded={expandedEquipmentKeys.includes(attackKey)}
                          onToggleExpanded={() =>
                            toggleExpandedEquipment(attackKey)
                          }
                          onRollAttack={() =>
                            onRollSheetAction({
                              kind: "d20",
                              label: `Ataque básico — ${attack.name}`,
                              modifier: 0,
                            })
                          }
                          onRollDamage={() =>
                            onRollSheetAction({
                              kind: "damage",
                              label: `Dano — ${attack.name}`,
                              expression: attack.damageExpression,
                            })
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhum ataque derivado de equipamento por enquanto.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Equipamentos
                </p>

                {equipmentRows.length > 0 ? (
                  <div className="mt-2 grid gap-2">
                    {equipmentRows.map((item, index) => {
                      const itemKey = `equipment-${item.id}-${index}`;

                      return (
                        <EquipmentListCard
                          key={itemKey}
                          title={`${item.quantity}x ${item.name}`}
                          value={item.isEquipped ? "Equipado" : undefined}
                          helper={item.helper}
                          isExpanded={expandedEquipmentKeys.includes(itemKey)}
                          onToggleExpanded={() =>
                            toggleExpandedEquipment(itemKey)
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhum equipamento registrado nesta ficha.
                  </p>
                )}
              </section>
            </main>

            <aside className="space-y-4">
              <SheetBox label="Moedas" value={startingGold} helper="iniciais" />

              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Bolsa
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">
                  Ataques e itens seguem o mesmo padrão compacto da aba Magia:
                  ações visíveis, detalhes sob demanda.
                </p>
              </section>
            </aside>
          </div>
        </div>
      ) : activeTab === "spells" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                  Página de magias
                </p>

                <h3 className="mt-1 text-xl font-black text-forge-gold">
                  Conjuração
                </h3>
              </div>

              <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-5">
                {spellSummaryCards.map((summaryCard) => (
                  <div
                    key={summaryCard.label}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 shadow-[-3px_3px_0_rgba(0,0,0,0.18)]"
                    title={`${summaryCard.label}: ${summaryCard.value}`}
                  >
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
                      {summaryCard.label}
                    </p>

                    <p className="mt-1 min-w-0 break-words text-sm font-black leading-tight text-forge-gold">
                      {summaryCard.value}
                    </p>

                    <p className="mt-0.5 text-[9px] font-semibold text-white/35">
                      {summaryCard.helper}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-4 space-y-4">
            {hasAnyKnownSpell ? (
              <>
                {cantripSpells.length > 0 ? (
                  <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                        Truques
                      </p>
                    </div>

                    <div className="mt-2 grid gap-2">
                      {cantripSpells.map((sheetSpell) => {
                        const damageExpression =
                          getFirstDamageExpressionFromText(
                            sheetSpell.spell.description,
                          );

                        return (
                          <SpellCard
                            key={sheetSpell.spell.key}
                            name={sheetSpell.spell.name}
                            level={sheetSpell.spell.level}
                            school={sheetSpell.spell.school}
                            castingTime={sheetSpell.spell.castingTime}
                            range={sheetSpell.spell.range}
                            duration={sheetSpell.spell.duration}
                            components={sheetSpell.spell.components}
                            description={sheetSpell.spell.description}
                            damageLabel={getSpellDamageLabelFromText(
                              sheetSpell.spell.description,
                            )}
                            isAttackDisabled={spellAttackBonusValue === null}
                            attackDisabledReason="Esta classe não possui atributo de conjuração. Ataque mágico indisponível."
                            isExpanded={expandedSpellKeys.includes(
                              sheetSpell.spell.key,
                            )}
                            onToggleExpanded={() =>
                              toggleExpandedSpell(sheetSpell.spell.key)
                            }
                            onRollAttack={() => {
                              if (spellAttackBonusValue === null) {
                                return;
                              }

                              onRollSheetAction({
                                kind: "d20",
                                label: `Ataque mágico — ${sheetSpell.spell.name}`,
                                modifier: spellAttackBonusValue,
                              });
                            }}
                            onRollDamage={
                              damageExpression
                                ? () =>
                                    onRollSheetAction({
                                      kind: "damage",
                                      label: `Dano mágico — ${sheetSpell.spell.name}`,
                                      expression: damageExpression,
                                    })
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {leveledSpellLevels.length > 0 ? (
                  <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                        Magias
                      </p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {leveledSpellLevels.map((level) => {
                        const spells = spellsByLevel[level] ?? [];
                        const levelLabel = `Nível ${level}`;

                        return (
                          <div
                            key={level}
                            className="rounded-2xl border border-white/10 bg-black/20 p-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                                {levelLabel}
                              </p>
                            </div>

                            <div className="mt-2 grid gap-2">
                              {spells.map((sheetSpell) => {
                                const damageExpression =
                                  getFirstDamageExpressionFromText(
                                    sheetSpell.spell.description,
                                  );

                                return (
                                  <SpellCard
                                    key={sheetSpell.spell.key}
                                    name={sheetSpell.spell.name}
                                    level={sheetSpell.spell.level}
                                    school={sheetSpell.spell.school}
                                    castingTime={sheetSpell.spell.castingTime}
                                    range={sheetSpell.spell.range}
                                    duration={sheetSpell.spell.duration}
                                    components={sheetSpell.spell.components}
                                    description={sheetSpell.spell.description}
                                    damageLabel={getSpellDamageLabelFromText(
                                      sheetSpell.spell.description,
                                    )}
                                    isAttackDisabled={
                                      spellAttackBonusValue === null
                                    }
                                    attackDisabledReason="Esta classe não possui atributo de conjuração. Ataque mágico indisponível."
                                    isExpanded={expandedSpellKeys.includes(
                                      sheetSpell.spell.key,
                                    )}
                                    onToggleExpanded={() =>
                                      toggleExpandedSpell(sheetSpell.spell.key)
                                    }
                                    onRollAttack={() => {
                                      if (spellAttackBonusValue === null) {
                                        return;
                                      }

                                      onRollSheetAction({
                                        kind: "d20",
                                        label: `Ataque mágico — ${sheetSpell.spell.name}`,
                                        modifier: spellAttackBonusValue,
                                      });
                                    }}
                                    onRollDamage={
                                      damageExpression
                                        ? () =>
                                            onRollSheetAction({
                                              kind: "damage",
                                              label: `Dano mágico — ${sheetSpell.spell.name}`,
                                              expression: damageExpression,
                                            })
                                        : undefined
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </>
            ) : (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-black text-white">
                  Nenhuma magia registrada
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-white/50">
                  Esta ficha ainda não possui truques ou magias escolhidas.
                </p>
              </section>
            )}
          </div>
        </div>
      ) : activeTab === "features" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Features e traços
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <CompactListRow
                    title="Features de classe"
                    helper="Entram quando conectarmos progressão de classe por nível."
                  />
                  <CompactListRow
                    title="Traços de ancestralidade"
                    helper="Espaço para habilidades vindas da ancestralidade."
                  />
                  <CompactListRow
                    title="Benefícios de antecedente"
                    helper="Espaço para recursos narrativos e mecânicos do antecedente."
                  />
                  <CompactListRow
                    title="Proficiências especiais"
                    helper="Futuramente editáveis pelo mestre durante a campanha."
                  />
                </div>
              </section>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Base da ficha
                </p>

                <div className="mt-3 grid gap-1.5">
                  <CompactListRow
                    title={classAndLevel}
                    helper="Classe e nível atuais."
                  />
                  <CompactListRow
                    title={ancestryName}
                    helper="Ancestralidade."
                  />
                  <CompactListRow
                    title={backgroundName}
                    helper="Antecedente."
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      ) : activeTab === "profile" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Imagem e token
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveImages}
                    disabled={isSavingImages || !characterSheet}
                    className="rounded-full border border-forge-gold/30 bg-forge-gold/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSavingImages ? "Salvando..." : "Salvar"}
                  </button>
                </div>

                {imageSaveError ? (
                  <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
                    {imageSaveError}
                  </p>
                ) : null}

                {imageSaveSuccess ? (
                  <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200">
                    {imageSaveSuccess}
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3">
                  <ImagePreviewBox
                    label="Retrato"
                    imageUrl={editablePortraitUrl}
                    fallback={actor.initials}
                    imageFit="COVER"
                  />

                  <ImagePreviewBox
                    label="Token"
                    imageUrl={editableTokenImageUrl}
                    fallback={actor.initials}
                    imageFit={editableTokenImageFit}
                  />

                  <SheetTextInput
                    label="URL do retrato"
                    value={editablePortraitUrl}
                    placeholder="https://..."
                    onChange={setEditablePortraitUrl}
                  />

                  <SheetTextInput
                    label="URL do token"
                    value={editableTokenImageUrl}
                    placeholder="https://..."
                    onChange={setEditableTokenImageUrl}
                  />

                  <label className="block rounded-xl border border-white/10 bg-black/25 p-2.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                      Encaixe do token
                    </span>

                    <select
                      value={editableTokenImageFit}
                      onChange={(event) =>
                        setEditableTokenImageFit(
                          event.target.value as TokenImageFitOption,
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:border-forge-gold/60"
                    >
                      <option value="FILL">Preencher</option>
                      <option value="COVER">Cobrir</option>
                      <option value="CONTAIN">Conter</option>
                    </select>
                  </label>
                </div>
              </section>
            </aside>

            <main className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Personalidade
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <NarrativeField
                    label="Traços de personalidade"
                    value={characterSheet?.personality}
                  />

                  <NarrativeField
                    label="Ideais"
                    value={characterSheet?.ideals}
                  />

                  <NarrativeField
                    label="Ligações"
                    value={characterSheet?.bonds}
                  />

                  <NarrativeField
                    label="Defeitos"
                    value={characterSheet?.flaws}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Aparência
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {appearanceRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl border border-white/10 bg-black/25 p-2.5"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                        {row.label}
                      </p>

                      <p className="mt-2 truncate text-xs font-bold text-white/60">
                        {row.value?.trim() || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {!hasAnyAppearanceInfo ? (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhuma informação física cadastrada.
                  </p>
                ) : null}
              </section>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  História e notas
                </p>

                <div className="mt-3 grid gap-2">
                  <NarrativeField
                    label="História"
                    value={characterSheet?.backstory}
                  />
                  <NarrativeField label="Notas" value={characterSheet?.notes} />
                  {isGM ? (
                    <NarrativeField
                      label="Notas do mestre"
                      value={characterSheet?.gmNotes}
                    />
                  ) : null}
                </div>
              </section>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Notas futuras
                </p>

                <div className="mt-3 grid gap-1.5">
                  <CompactListRow
                    title="Aliados e contatos"
                    helper="Espaço para vínculos importantes da campanha."
                  />
                  <CompactListRow
                    title="Inimigos e ameaças"
                    helper="Espaço para acompanhar conflitos pessoais."
                  />
                  <CompactListRow
                    title="Organizações e objetivos"
                    helper="Espaço para registros de longo prazo."
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
