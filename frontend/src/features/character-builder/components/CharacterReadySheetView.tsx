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
  getEquipmentAttackAbilityKey,
  getEquipmentAttackBonus,
  getEquipmentDamageExpression,
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
  isConfirmingLevelUp: boolean;
  levelUpError: string | null;
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
  onConfirmLevelUp: (data: { classEntryId?: string }) => Promise<void>;
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
  "status" | "combat" | "bag" | "spells" | "features" | "profile" | "notes";

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

function getNumericValueFromText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value
    .trim()
    .replace(",", ".")
    .match(/\d+(?:\.\d+)?/);

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue[0]);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatCharacterHeight(value: string | null | undefined) {
  const parsedValue = getNumericValueFromText(value);

  if (parsedValue === null) {
    return value?.trim() || "—";
  }

  const heightInMeters = parsedValue > 3 ? parsedValue / 100 : parsedValue;

  return `${heightInMeters.toFixed(2).replace(".", ",")} m`;
}

function formatCharacterWeight(value: string | null | undefined) {
  const parsedValue = getNumericValueFromText(value);

  if (parsedValue === null) {
    return value?.trim() || "—";
  }

  return `${parsedValue.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} kg`;
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

function getSpellSlotSummaryFromProgression(
  progression: CharacterReadySheetLevelProgression | null | undefined,
) {
  const slotRows = getSpellSlotRowsFromProgression(progression);

  if (slotRows.length === 0) {
    return "Sem espaços";
  }

  return slotRows.map((slot) => `N${slot.level}: ${slot.total}`).join(" · ");
}

function getProgressionChangeLabel(
  currentValue: number | null | undefined,
  nextValue: number | null | undefined,
) {
  const current = currentValue ?? 0;
  const next = nextValue ?? 0;

  if (current === next) {
    return String(next);
  }

  return `${current} → ${next}`;
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

function EquipmentImageBadge({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const normalizedImageUrl = imageUrl?.trim() ?? "";
  const shouldShowImage = normalizedImageUrl.length > 0 && !hasImageError;
  const fallbackInitial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forge-gold/25 bg-black/35 shadow-[-2px_2px_0_rgba(0,0,0,0.25)]">
      {shouldShowImage ? (
        <Image
          src={normalizedImageUrl}
          alt={name}
          width={96}
          height={96}
          unoptimized
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-black text-forge-gold/75">
          {fallbackInitial}
        </span>
      )}
    </div>
  );
}

function EquipmentAttackCard({
  name,
  imageUrl,
  attackLabel,
  damageLabel,
  helper,
  isExpanded,
  onToggleExpanded,
  onRollAttack,
  onRollDamage,
}: {
  name: string;
  imageUrl: string | null;
  attackLabel: string;
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
        <div className="flex min-w-0 items-center gap-3">
          <EquipmentImageBadge name={name} imageUrl={imageUrl} />

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
        </div>

        <div className="grid gap-1.5 text-[10px] font-black text-forge-gold sm:grid-cols-2 xl:grid-cols-1">
          <p
            className="rounded-lg border border-forge-gold/15 bg-forge-gold/5 px-2 py-1"
            title={`Ataque: ${attackLabel}`}
          >
            Ataque: {attackLabel}
          </p>

          <p
            className="rounded-lg border border-forge-gold/15 bg-forge-gold/5 px-2 py-1"
            title={`Dano: ${damageLabel}`}
          >
            Dano: {damageLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onRollAttack}
            className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
            title={`Rolar ataque de ${name}: 1d20 ${attackLabel}. Comparação contra CA entra na próxima micro.`}
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
  imageUrl,
  helper,
  value,
  isExpanded,
  onToggleExpanded,
}: {
  title: string;
  imageUrl: string | null;
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
        <div className="flex min-w-0 items-center gap-3">
          <EquipmentImageBadge name={title} imageUrl={imageUrl} />

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

function CharacterClassEntryCard({
  className,
  level,
  subclassName,
  isPrimary,
}: {
  className: string;
  level: number;
  subclassName: string | null;
  isPrimary: boolean;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-sm font-black leading-snug text-forge-gold"
            title={`${className} ${level}`}
          >
            {className} {level}
          </p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
            {subclassName ?? "Sem subclasse"}
          </p>
        </div>

        {isPrimary ? (
          <span className="rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-forge-gold">
            Principal
          </span>
        ) : null}
      </div>
    </article>
  );
}

function FeatureCard({
  name,
  sourceLabel,
  levelLabel,
  description,
}: {
  name: string;
  sourceLabel: string;
  levelLabel: string;
  description: string;
}) {
  return (
    <article
      className="rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-forge-gold/35 hover:bg-forge-gold/5"
      title={description}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-sm font-black leading-snug text-forge-gold"
            title={name}
          >
            {name}
          </p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
            {sourceLabel} · {levelLabel}
          </p>
        </div>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-white/55">
        {description}
      </p>
    </article>
  );
}

function getFeatureSourceLabel(sourceType: string) {
  if (sourceType === "ANCESTRY") {
    return "Ancestralidade";
  }

  if (sourceType === "CLASS") {
    return "Classe";
  }

  if (sourceType === "SUBCLASS") {
    return "Subclasse";
  }

  if (sourceType === "BACKGROUND") {
    return "Antecedente";
  }

  return "Feature";
}

function getCharacterLanguageSourceLabel(source: string | null | undefined) {
  if (source === "ancestry") {
    return "Ancestralidade";
  }

  if (source === "background") {
    return "Antecedente";
  }

  if (source === "builder") {
    return "Escolha extra";
  }

  if (source === "class") {
    return "Classe";
  }

  if (source === "feature") {
    return "Feature";
  }

  if (source === "manual") {
    return "Manual";
  }

  return "Fonte não informada";
}

function formatLanguageKey(languageKey: string) {
  return languageKey
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type LevelUpClassOption = {
  id: string;
  classId: string;
  className: string;
  subclassName: string | null;
  currentClassLevel: number;
  nextClassLevel: number;
  subclassSelectionLevel: number | null;
  isPrimary: boolean;
  isSpellcaster: boolean;
};

function LevelUpPreviewModal({
  characterName,
  className,
  selectedClassOption,
  classOptions,
  levelUpPreview,
  isConfirmingLevelUp,
  levelUpError,
  onSelectClass,
  onConfirmLevelUp,
  onClose,
}: {
  characterName: string;
  className: string;
  selectedClassOption: LevelUpClassOption | null;
  classOptions: LevelUpClassOption[];
  levelUpPreview: CharacterReadySheet["levelUpPreview"] | null | undefined;
  isConfirmingLevelUp: boolean;
  levelUpError: string | null;
  onSelectClass: (classOptionId: string) => void;
  onConfirmLevelUp: (data: { classEntryId?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const currentLevel = levelUpPreview?.currentLevel ?? 1;
  const nextLevel = levelUpPreview?.nextLevel ?? currentLevel + 1;
  const currentProgression = levelUpPreview?.currentProgression ?? null;
  const nextProgression = levelUpPreview?.nextProgression ?? null;

  const proficiencyChange = getProgressionChangeLabel(
    currentProgression?.proficiencyBonus,
    nextProgression?.proficiencyBonus,
  );

  const cantripsChange = getProgressionChangeLabel(
    currentProgression?.cantripsKnown,
    nextProgression?.cantripsKnown,
  );

  const spellsKnownChange = getProgressionChangeLabel(
    currentProgression?.spellsKnown,
    nextProgression?.spellsKnown,
  );

  const spellsPreparedChange = getProgressionChangeLabel(
    currentProgression?.spellsPrepared,
    nextProgression?.spellsPrepared,
  );

  const currentSlots = getSpellSlotSummaryFromProgression(currentProgression);
  const nextSlots = getSpellSlotSummaryFromProgression(nextProgression);

  const slotChange =
    currentSlots === nextSlots ? nextSlots : `${currentSlots} → ${nextSlots}`;

  const newFeatures = levelUpPreview?.newFeatures ?? [];
  const hasNewFeatures = newFeatures.length > 0;

  const canPreviewNextLevel = levelUpPreview?.canPreviewNextLevel ?? false;

  const canConfirmLevelUp =
    canPreviewNextLevel && Boolean(selectedClassOption) && !isConfirmingLevelUp;

  async function handleConfirmLevelUp() {
    if (!selectedClassOption || isConfirmingLevelUp) {
      return;
    }

    await onConfirmLevelUp({
      classEntryId: selectedClassOption.id,
    });
  }

  const selectedSubclassSelectionLevel =
    selectedClassOption?.subclassSelectionLevel ?? null;

  const isSelectedSubclassAlreadyChosen = Boolean(
    selectedClassOption?.subclassName,
  );

  const isSelectedSubclassUnlockedByThisLevel =
    selectedClassOption &&
    typeof selectedSubclassSelectionLevel === "number" &&
    selectedClassOption.nextClassLevel >= selectedSubclassSelectionLevel;

  const selectedSubclassStatusLabel = !selectedClassOption
    ? "Nenhuma classe escolhida"
    : isSelectedSubclassAlreadyChosen
      ? selectedClassOption.subclassName
      : !selectedSubclassSelectionLevel
        ? "Sem regra de subclasse"
        : isSelectedSubclassUnlockedByThisLevel
          ? "Escolha de subclasse pendente"
          : `Disponível no nível ${selectedSubclassSelectionLevel}`;

  const selectedSubclassStatusHelper = !selectedClassOption
    ? "Escolha uma classe para ver a regra de subclasse."
    : isSelectedSubclassAlreadyChosen
      ? `Subclasse atual de ${selectedClassOption.className}.`
      : !selectedSubclassSelectionLevel
        ? "Esta classe ainda não informa nível de escolha de subclasse."
        : isSelectedSubclassUnlockedByThisLevel
          ? "Quando o Level Up real existir, esta etapa deverá permitir escolher uma subclasse para esta classe."
          : `${selectedClassOption.className} ainda não alcança o nível de subclasse neste avanço.`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-forge-gold/45 bg-[#160b1c] p-4 shadow-[-12px_12px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Level Up
            </p>

            <h3 className="mt-1 text-2xl font-black text-forge-gold">
              {characterName}
            </h3>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-white/45">
              Prévia do próximo avanço. Apenas o Mestre pode liberar Level Up.
              Nesta micro, nada é salvo ainda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black text-white/45 transition hover:text-forge-gold"
            aria-label="Fechar Level Up"
            title="Fechar Level Up"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
              Nível atual
            </p>

            <p className="mt-1 text-2xl font-black text-forge-gold">
              {currentLevel}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-white/35">
              nível total do personagem
            </p>
          </div>

          <div className="rounded-xl border border-forge-gold/25 bg-forge-gold/10 p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
              Próximo nível
            </p>

            <p className="mt-1 text-2xl font-black text-forge-gold">
              {nextLevel}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-white/35">
              prévia, sem salvar
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
              Classe escolhida
            </p>

            <p className="mt-1 min-w-0 break-words text-base font-black text-forge-gold">
              {selectedClassOption
                ? `${selectedClassOption.className} ${selectedClassOption.currentClassLevel} → ${selectedClassOption.nextClassLevel}`
                : className}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-white/35">
              nível da classe, não nível total
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-forge-gold/25 bg-black/25 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
            Escolha qual classe receberia o nível
          </p>

          <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
            Nesta micro a escolha é apenas visual. A confirmação real virá
            depois, quando o backend aplicar nível total e nível de classe.
          </p>

          {classOptions.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {classOptions.map((classOption) => {
                const isSelected = selectedClassOption?.id === classOption.id;

                return (
                  <button
                    key={classOption.id}
                    type="button"
                    onClick={() => onSelectClass(classOption.id)}
                    className={[
                      "rounded-xl border p-3 text-left transition",
                      isSelected
                        ? "border-forge-gold bg-forge-gold/10"
                        : "border-white/10 bg-black/25 hover:border-forge-gold/45 hover:bg-forge-gold/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="min-w-0 break-words text-sm font-black text-forge-gold">
                          {classOption.className}{" "}
                          {classOption.currentClassLevel} →{" "}
                          {classOption.nextClassLevel}
                        </p>

                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                          {classOption.subclassName ?? "Sem subclasse"}
                        </p>
                      </div>

                      {classOption.isPrimary ? (
                        <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-forge-gold">
                          Principal
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-[10px] font-semibold leading-relaxed text-white/35">
                      {classOption.isSpellcaster
                        ? "Classe conjuradora. Pode alterar progressão de magias desta classe."
                        : "Classe sem atributo de conjuração configurado."}
                    </p>
                  </button>
                );
              })}

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/5 bg-black/20 p-3 text-left opacity-70"
                title="Adicionar nova classe será liberado em uma micro posterior."
              >
                <p className="text-sm font-black text-white/25">
                  + Adicionar nova classe
                </p>

                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/25">
                  Em breve: escolher uma nova classe para iniciar multiclasse.
                </p>
              </button>
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
              Nenhuma classe vinculada à estrutura nova da ficha.
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              Mudanças do próximo nível
            </p>

            {canPreviewNextLevel ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <CompactListRow
                  title={`Proficiência: ${proficiencyChange}`}
                  helper="Bônus de proficiência da classe/progressão atual."
                />

                <CompactListRow
                  title={`Truques: ${cantripsChange}`}
                  helper="Quantidade de truques conhecidos pela progressão."
                />

                <CompactListRow
                  title={`Magias conhecidas: ${spellsKnownChange}`}
                  helper="Quantidade de magias conhecidas, quando aplicável."
                />

                <CompactListRow
                  title={`Magias preparadas: ${spellsPreparedChange}`}
                  helper="Quantidade de magias preparadas, quando aplicável."
                />

                <CompactListRow title="Espaços de magia" helper={slotChange} />

                <CompactListRow
                  title={`${newFeatures.length} feature(s) nova(s)`}
                  helper={
                    hasNewFeatures
                      ? "Veja a lista abaixo."
                      : "Nenhuma feature nova neste nível."
                  }
                />
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                Não existe progressão cadastrada para o próximo nível desta
                classe. O Level Up real ficará bloqueado até existir progressão.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              Features liberadas neste avanço
            </p>

            {hasNewFeatures ? (
              <div className="mt-3 grid gap-2">
                {newFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    name={feature.name}
                    sourceLabel={getFeatureSourceLabel(feature.sourceType)}
                    levelLabel={
                      feature.level ? `Nível ${feature.level}` : "Sem nível"
                    }
                    description={
                      feature.description?.trim() || "Sem descrição cadastrada."
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                Nenhuma feature nova detectada para o próximo nível.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-forge-gold/25 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              Subclasse da classe escolhida
            </p>

            <p className="mt-2 text-base font-black text-forge-gold">
              {selectedSubclassStatusLabel}
            </p>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-white/45">
              {selectedSubclassStatusHelper}
            </p>
          </div>

          <div className="rounded-xl border border-yellow-400/25 bg-yellow-500/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100/70">
              Observação técnica
            </p>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-yellow-100/70">
              Por enquanto este modal não salva o Level Up. Isso é intencional:
              antes de confirmar level real, precisamos separar nível total do
              personagem e nível de classe para não criar dívida técnica com
              multiclasse.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45 transition hover:border-forge-gold/45 hover:text-forge-gold"
          >
            Fechar
          </button>

          {levelUpError ? (
            <p className="mr-auto rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-100">
              {levelUpError}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!canConfirmLevelUp}
            onClick={handleConfirmLevelUp}
            className={[
              "rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition",
              canConfirmLevelUp
                ? "border-forge-gold bg-forge-gold/10 text-forge-gold hover:bg-forge-gold/20"
                : "cursor-not-allowed border-white/5 bg-black/20 text-white/20",
            ].join(" ")}
            title={
              canConfirmLevelUp
                ? "Confirmar Level Up desta classe."
                : "Não é possível confirmar Level Up agora."
            }
          >
            {isConfirmingLevelUp ? "Confirmando..." : "Confirmar Level Up"}
          </button>
        </div>
      </section>
    </div>
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
  isConfirmingLevelUp,
  levelUpError,
  popoutUrl,
  onSaveImages,
  onRollSheetAction,
  onConfirmLevelUp,
  onClose,
}: CharacterReadySheetViewProps) {
  const [activeTab, setActiveTab] = useState<ReadySheetTab>("status");
  const [expandedSpellKeys, setExpandedSpellKeys] = useState<string[]>([]);
  const [expandedEquipmentKeys, setExpandedEquipmentKeys] = useState<string[]>(
    [],
  );
  const [manualTargetArmorClass, setManualTargetArmorClass] = useState("");
  const [isLevelUpPreviewOpen, setIsLevelUpPreviewOpen] = useState(false);

  const [selectedLevelUpClassOptionId, setSelectedLevelUpClassOptionId] =
    useState<string | null>(null);

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

  const parsedManualTargetArmorClass = Number.parseInt(
    manualTargetArmorClass,
    10,
  );

  const hasManualTargetArmorClass =
    isGM &&
    manualTargetArmorClass.trim().length > 0 &&
    Number.isFinite(parsedManualTargetArmorClass) &&
    parsedManualTargetArmorClass > 0;

  const manualTargetArmorClassLabel = hasManualTargetArmorClass
    ? `CA ${parsedManualTargetArmorClass}`
    : "Sem CA definida";

  function getAttackLabelWithManualTarget(attackName: string) {
    if (!hasManualTargetArmorClass) {
      return `Ataque — ${attackName}`;
    }

    return `Ataque — ${attackName} contra CA ${parsedManualTargetArmorClass}`;
  }

  const attackRows =
    characterSheet?.equipment
      .filter((sheetEquipment) => {
        return (
          Boolean(sheetEquipment.equipment.damage) ||
          Boolean(sheetEquipment.equipment.damageFormula)
        );
      })
      .map((sheetEquipment) => {
        const equipment = sheetEquipment.equipment;

        const attackBonus = getEquipmentAttackBonus({
          stats: sheetStats,
          level: sheetLevel,
          equipment,
          isProficient: true,
        });

        const attackAbilityKey = getEquipmentAttackAbilityKey({
          equipment,
          stats: sheetStats,
        });

        const damageExpression =
          getEquipmentDamageExpression({
            damageFormula: equipment.damageFormula,
            damageFallback: equipment.damage,
            damageBonus: equipment.damageBonus,
          }) ?? getDamageRollExpression(equipment.damage ?? "1d4");

        const damageLabel = [
          equipment.damageFormula ?? equipment.damage ?? "—",
          equipment.damageType,
          equipment.damageBonus
            ? `(${formatSignedNumber(equipment.damageBonus)})`
            : null,
        ]
          .filter(Boolean)
          .join(" ");

        const attackLabel =
          attackBonus === null ? "—" : formatSignedNumber(attackBonus);

        const abilityLabel = attackAbilityKey
          ? `${getAttributeShortLabel(attackAbilityKey)}`
          : "atributo não definido";

        const weaponGroupLabel = equipment.weaponGroup
          ? `Grupo: ${equipment.weaponGroup}`
          : "Grupo não definido";

        const helper = [
          equipment.properties,
          `Atributo: ${abilityLabel}`,
          weaponGroupLabel,
          "Proficiência temporária: sim",
          equipment.description,
        ]
          .filter(Boolean)
          .join(" · ");

        return {
          id: equipment.key,
          name: equipment.name,
          imageUrl: equipment.imageUrl,
          attackBonus,
          attackLabel,
          damageLabel,
          damageExpression,
          helper,
        };
      }) ?? [];

  const equipmentRows =
    characterSheet?.equipment
      .map((sheetEquipment) => ({
        id: sheetEquipment.equipment.key,
        name: sheetEquipment.equipment.name,
        imageUrl: sheetEquipment.equipment.imageUrl,
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

  const classAndLevel = characterSheet?.characterClass
    ? `${characterSheet.characterClass.name} ${characterSheet.level}`
    : "—";

  const sheetClassEntries = characterSheet?.classes ?? [];

  const primarySheetClassEntry =
    sheetClassEntries.find((classEntry) => classEntry.isPrimary) ??
    sheetClassEntries[0] ??
    null;

  const classSummaryLabel =
    sheetClassEntries.length > 0
      ? sheetClassEntries
          .map(
            (classEntry) =>
              `${classEntry.characterClass.name} ${classEntry.level}`,
          )
          .join(" / ")
      : classAndLevel;

  const primaryClassLabel = primarySheetClassEntry
    ? `${primarySheetClassEntry.characterClass.name} ${primarySheetClassEntry.level}`
    : classAndLevel;

  const multiclassStatusLabel =
    sheetClassEntries.length > 1
      ? `${sheetClassEntries.length} classes`
      : "Classe única";

  const multiclassStatusHelper =
    sheetClassEntries.length > 1
      ? "Esta ficha já possui múltiplas classes cadastradas."
      : "Estrutura pronta para receber multiclasse no Level Up.";

  const spellcastingClassEntry =
    sheetClassEntries.find(
      (classEntry) => classEntry.characterClass.spellcastingAbilityKey,
    ) ?? primarySheetClassEntry;

  const spellcastingClass = spellcastingClassEntry
    ? `${spellcastingClassEntry.characterClass.name} ${spellcastingClassEntry.level}`
    : (characterSheet?.characterClass?.name ?? "—");

  const spellcastingClassLevel = spellcastingClassEntry?.level ?? sheetLevel;

  const spellcastingAbilityKey = getSpellcastingAbilityKey(
    spellcastingClassEntry?.characterClass.spellcastingAbilityKey ??
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
    spellcastingClassEntry?.characterClass.levelProgressions.find(
      (progression) => progression.level === spellcastingClassLevel,
    ) ??
    characterSheet?.characterClass?.levelProgressions.find(
      (progression) => progression.level === sheetLevel,
    ) ??
    null;

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
      helper: "conjuradora ativa",
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

  const subclassSelectionLevel =
    characterSheet?.characterClass?.subclassSelectionLevel ?? null;

  const isSubclassChoiceAvailable =
    typeof subclassSelectionLevel === "number" &&
    sheetLevel >= subclassSelectionLevel;

  const subclassStatusLabel = !characterSheet?.characterClass
    ? "Classe não definida"
    : !subclassSelectionLevel
      ? "Esta classe ainda não possui nível de subclasse configurado"
      : characterSheet.subclass
        ? characterSheet.subclass.name
        : isSubclassChoiceAvailable
          ? "Escolha de subclasse pendente"
          : `Disponível no nível ${subclassSelectionLevel}`;

  const subclassStatusHelper = !characterSheet?.characterClass
    ? "Escolha uma classe para liberar progressão."
    : !subclassSelectionLevel
      ? "A classe não informa quando escolhe subclasse."
      : characterSheet.subclass
        ? "Subclasse escolhida para esta ficha."
        : isSubclassChoiceAvailable
          ? "Esta pendência será resolvida no fluxo de Level Up."
          : `A subclasse ainda não está disponível no nível ${sheetLevel}.`;

  const featureRows = [...(characterSheet?.features ?? [])].sort(
    (firstFeature, secondFeature) => {
      const sourceComparison = firstFeature.sourceType.localeCompare(
        secondFeature.sourceType,
        "pt-BR",
      );

      if (sourceComparison !== 0) {
        return sourceComparison;
      }

      const firstLevel = firstFeature.level ?? 0;
      const secondLevel = secondFeature.level ?? 0;

      if (firstLevel !== secondLevel) {
        return firstLevel - secondLevel;
      }

      return firstFeature.name.localeCompare(secondFeature.name, "pt-BR");
    },
  );

  const ancestryFeatureRows = featureRows.filter(
    (feature) => feature.sourceType === "ANCESTRY",
  );

  const classFeatureRows = featureRows.filter(
    (feature) => feature.sourceType === "CLASS",
  );

  const subclassFeatureRows = featureRows.filter(
    (feature) => feature.sourceType === "SUBCLASS",
  );

  const otherFeatureRows = featureRows.filter(
    (feature) =>
      !["ANCESTRY", "CLASS", "SUBCLASS"].includes(feature.sourceType),
  );

  const featureGroups = [
    {
      id: "class",
      title: "Features de classe",
      helper: characterSheet?.characterClass?.name ?? "Classe não definida",
      features: classFeatureRows,
    },
    {
      id: "subclass",
      title: "Features de subclasse",
      helper: characterSheet?.subclass?.name ?? "Subclasse não definida",
      features: subclassFeatureRows,
    },
    {
      id: "ancestry",
      title: "Traços de ancestralidade",
      helper: characterSheet?.ancestry?.name ?? "Ancestralidade não definida",
      features: ancestryFeatureRows,
    },
    {
      id: "other",
      title: "Outras features",
      helper: "Fontes adicionais",
      features: otherFeatureRows,
    },
  ].filter((group) => group.features.length > 0);

  const appearanceRows = [
    {
      label: "Idade",
      value: characterSheet?.age,
    },
    {
      label: "Altura",
      value: formatCharacterHeight(characterSheet?.height),
    },
    {
      label: "Peso",
      value: formatCharacterWeight(characterSheet?.weight),
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

  const ancestryLanguageKeys = characterSheet?.ancestry?.languageKeys ?? [];
  const backgroundLanguageKeys = characterSheet?.background?.languageKeys ?? [];

  const automaticLanguageKeys = Array.from(
    new Set([...ancestryLanguageKeys, ...backgroundLanguageKeys]),
  );

  const savedLanguageRows = characterSheet?.languages ?? [];

  const savedLanguagesByKey = new Map(
    savedLanguageRows.map((sheetLanguage) => [
      sheetLanguage.language.key,
      sheetLanguage,
    ]),
  );

  const automaticLanguageRows = automaticLanguageKeys.map((languageKey) => ({
    key: languageKey,
    name:
      savedLanguagesByKey.get(languageKey)?.language.name ??
      formatLanguageKey(languageKey),
    sourceLabel: ancestryLanguageKeys.includes(languageKey)
      ? "Ancestralidade"
      : "Antecedente",
    description:
      savedLanguagesByKey.get(languageKey)?.language.description ?? null,
  }));

  const chosenLanguageRows = savedLanguageRows
    .filter((sheetLanguage) => sheetLanguage.source === "builder")
    .filter(
      (sheetLanguage) =>
        !automaticLanguageKeys.includes(sheetLanguage.language.key),
    )
    .map((sheetLanguage) => ({
      key: sheetLanguage.language.key,
      name: sheetLanguage.language.name,
      sourceLabel: getCharacterLanguageSourceLabel(sheetLanguage.source),
      description: sheetLanguage.language.description,
    }))
    .sort((firstLanguage, secondLanguage) =>
      firstLanguage.name.localeCompare(secondLanguage.name, "pt-BR"),
    );

  const otherLanguageRows = savedLanguageRows
    .filter((sheetLanguage) => sheetLanguage.source !== "builder")
    .filter(
      (sheetLanguage) =>
        !automaticLanguageKeys.includes(sheetLanguage.language.key),
    )
    .map((sheetLanguage) => ({
      key: sheetLanguage.language.key,
      name: sheetLanguage.language.name,
      sourceLabel: getCharacterLanguageSourceLabel(sheetLanguage.source),
      description: sheetLanguage.language.description,
    }))
    .sort((firstLanguage, secondLanguage) =>
      firstLanguage.name.localeCompare(secondLanguage.name, "pt-BR"),
    );

  const hasAnyLanguage =
    automaticLanguageRows.length > 0 ||
    chosenLanguageRows.length > 0 ||
    otherLanguageRows.length > 0;

  const initiativeBonus = characterSheet
    ? formatSignedNumber(getInitiativeBonus(sheetStats))
    : "—";

  // Multiclasse: proficiência usa o nível total do personagem,
  // não o nível individual de uma classe.
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

  const ancestryName = characterSheet?.ancestry?.name ?? "—";
  const backgroundName = characterSheet?.background?.name ?? "—";
  const armorClass = characterSheet ? String(characterSheet.armorClass) : "—";
  const speed = characterSheet ? String(characterSheet.speed) : "—";
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

  const nextCharacterLevel = sheetLevel + 1;

  const levelUpClassOptions: LevelUpClassOption[] = sheetClassEntries.map(
    (classEntry) => ({
      id: classEntry.id,
      classId: classEntry.classId,
      className: classEntry.characterClass.name,
      subclassName: classEntry.subclass?.name ?? null,
      currentClassLevel: classEntry.level,
      nextClassLevel: classEntry.level + 1,
      subclassSelectionLevel:
        classEntry.characterClass.subclassSelectionLevel ?? null,
      isPrimary: classEntry.isPrimary,
      isSpellcaster: Boolean(classEntry.characterClass.spellcastingAbilityKey),
    }),
  );

  const selectedLevelUpClassOption =
    levelUpClassOptions.find(
      (classOption) => classOption.id === selectedLevelUpClassOptionId,
    ) ??
    levelUpClassOptions.find((classOption) => classOption.isPrimary) ??
    levelUpClassOptions[0] ??
    null;

  const levelUpClassName = selectedLevelUpClassOption
    ? `${selectedLevelUpClassOption.className} ${selectedLevelUpClassOption.currentClassLevel}`
    : classSummaryLabel;

  function handleOpenLevelUpPreview() {
    setSelectedLevelUpClassOptionId(
      selectedLevelUpClassOption?.id ?? levelUpClassOptions[0]?.id ?? null,
    );
    setIsLevelUpPreviewOpen(true);
  }

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

          <CompactInfoPill label="Desloc." value={speed} helper="m" />
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

      {isGM && isLevelUpPreviewOpen ? (
        <LevelUpPreviewModal
          characterName={displayName}
          className={levelUpClassName}
          selectedClassOption={selectedLevelUpClassOption}
          classOptions={levelUpClassOptions}
          levelUpPreview={characterSheet?.levelUpPreview}
          isConfirmingLevelUp={isConfirmingLevelUp}
          levelUpError={levelUpError}
          onSelectClass={setSelectedLevelUpClassOptionId}
          onConfirmLevelUp={onConfirmLevelUp}
          onClose={() => setIsLevelUpPreviewOpen(false)}
        />
      ) : null}

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
                  <SheetBox label="Desloc." value={speed} helper="metros" />
                  <SheetBox
                    label="PV"
                    value={`${hitPoints}/${maxHitPoints}`}
                    helper="atual/máx."
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Ataques equipados
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
                      Ataques calculados a partir do equipamento, atributo,
                      proficiência temporária e bônus do item.
                    </p>
                  </div>
                </div>

                {attackRows.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {attackRows.map((attack, index) => {
                      const attackKey = `combat-attack-${attack.id}-${index}`;

                      return (
                        <EquipmentAttackCard
                          key={attackKey}
                          name={attack.name}
                          imageUrl={attack.imageUrl}
                          attackLabel={attack.attackLabel}
                          damageLabel={attack.damageLabel}
                          helper={attack.helper}
                          isExpanded={expandedEquipmentKeys.includes(attackKey)}
                          onToggleExpanded={() =>
                            toggleExpandedEquipment(attackKey)
                          }
                          onRollAttack={() => {
                            if (attack.attackBonus === null) {
                              return;
                            }

                            onRollSheetAction({
                              kind: "d20",
                              label: getAttackLabelWithManualTarget(
                                attack.name,
                              ),
                              modifier: attack.attackBonus,
                            });
                          }}
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
                  Próximas ações de combate
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <CompactListRow
                    title="Ataque contra CA manual"
                    helper="Preparado para comparar a rolagem de ataque contra a defesa do alvo."
                  />
                  <CompactListRow
                    title="Condições e efeitos"
                    helper="Fica ligado ao futuro sistema de status."
                  />
                  <CompactListRow
                    title="Ações, bônus e reação"
                    helper="Espaço reservado para economia de ações em combate."
                  />
                  <CompactListRow
                    title="Alvos e alcance"
                    helper="Futuramente ligado a tokens, distância, tamanho e linha de visão."
                  />
                </div>
              </section>
            </main>

            <aside className="space-y-4">
              {isGM ? (
                <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Alvo manual do mestre
                  </p>

                  <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">
                    Informe a CA do alvo apenas quando você, como mestre, quiser
                    enviar a rolagem ao chat com a defesa de referência.
                    Jogadores não devem ver nem preencher este valor.
                  </p>

                  <label className="mt-3 block rounded-xl border border-white/10 bg-black/25 p-2.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                      CA do alvo
                    </span>

                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={manualTargetArmorClass}
                      onChange={(event) =>
                        setManualTargetArmorClass(event.target.value)
                      }
                      placeholder="Ex.: 15"
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm font-black text-forge-gold outline-none transition placeholder:text-white/20 focus:border-forge-gold/60"
                    />
                  </label>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
                      Referência atual
                    </p>

                    <p className="mt-1 text-base font-black text-forge-gold">
                      {manualTargetArmorClassLabel}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
                      A comparação ainda é manual. A automação de acerto/erro
                      entra quando o fluxo de ataque puder ler o resultado da
                      rolagem e comparar com a defesa do alvo.
                    </p>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Alvo
                  </p>

                  <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">
                    Você pode rolar ataques normalmente. A defesa exata do alvo
                    é uma informação controlada pelo mestre e será aplicada no
                    fluxo de combate.
                  </p>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
                      Fluxo atual
                    </p>

                    <p className="mt-1 text-base font-black text-forge-gold">
                      Ataque declarado
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
                      O mestre interpreta o resultado contra a defesa do alvo.
                      Depois, isso será automatizado por alvo/token.
                    </p>
                  </div>
                </section>
              )}

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
                          imageUrl={attack.imageUrl}
                          attackLabel={attack.attackLabel}
                          damageLabel={attack.damageLabel}
                          helper={attack.helper}
                          isExpanded={expandedEquipmentKeys.includes(attackKey)}
                          onToggleExpanded={() =>
                            toggleExpandedEquipment(attackKey)
                          }
                          onRollAttack={() => {
                            if (attack.attackBonus === null) {
                              return;
                            }

                            onRollSheetAction({
                              kind: "d20",
                              label: `Ataque — ${attack.name}`,
                              modifier: attack.attackBonus,
                            });
                          }}
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
                          imageUrl={item.imageUrl}
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
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Features e traços
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/35">
                      Recursos vindos da classe, subclasse e ancestralidade do
                      personagem. Nesta primeira versão eles são exibidos como
                      texto mecânico/narrativo.
                    </p>
                  </div>
                </div>

                {featureGroups.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {featureGroups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-2.5"
                      >
                        <div className="border-b border-white/10 pb-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-forge-gold">
                            {group.title}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-white/35">
                            {group.helper}
                          </p>
                        </div>

                        <div className="mt-2 grid gap-2">
                          {group.features.map((feature) => (
                            <FeatureCard
                              key={feature.id}
                              name={feature.name}
                              sourceLabel={getFeatureSourceLabel(
                                feature.sourceType,
                              )}
                              levelLabel={
                                feature.level
                                  ? `Nível ${feature.level}`
                                  : "Sem nível"
                              }
                              description={
                                feature.description?.trim() ||
                                "Sem descrição cadastrada."
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhuma feature disponível para esta ficha no nível atual.
                  </p>
                )}
              </section>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Progressão
                </p>

                <div className="mt-3 grid gap-1.5">
                  <CompactListRow
                    title={`Nível ${sheetLevel}`}
                    helper="Nível total atual do personagem."
                  />

                  <CompactListRow
                    title={`Próximo: nível ${nextCharacterLevel}`}
                    helper="Prévia visual do próximo avanço."
                  />

                  <CompactListRow
                    title={classSummaryLabel}
                    helper={multiclassStatusHelper}
                  />
                </div>

                {isGM ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenLevelUpPreview}
                      className="mt-3 w-full rounded-xl border border-forge-gold/30 bg-forge-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
                    >
                      Level Up
                    </button>

                    <p className="mt-2 text-[10px] font-semibold leading-relaxed text-white/35">
                      Primeira versão visual. A confirmação real entra depois,
                      já respeitando nível de personagem diferente de nível de
                      classe.
                    </p>
                  </>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-[10px] font-semibold leading-relaxed text-white/35">
                    Level Up é liberado pelo Mestre.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Classes da ficha
                </p>

                {sheetClassEntries.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {sheetClassEntries.map((classEntry) => (
                      <CharacterClassEntryCard
                        key={classEntry.id}
                        className={classEntry.characterClass.name}
                        level={classEntry.level}
                        subclassName={classEntry.subclass?.name ?? null}
                        isPrimary={classEntry.isPrimary}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhuma classe vinculada à estrutura nova da ficha.
                  </p>
                )}

                <p className="mt-2 text-[10px] font-semibold leading-relaxed text-white/35">
                  O nível total do personagem continua separado dos níveis de
                  classe. A multiclasse será aplicada por esta lista.
                </p>
              </section>

              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Resumo de origem
                </p>

                <div className="mt-3 grid gap-1.5">
                  <CompactListRow
                    title={primaryClassLabel}
                    helper="Classe principal na estrutura atual da ficha."
                  />

                  <CompactListRow
                    title={multiclassStatusLabel}
                    helper={classSummaryLabel}
                  />

                  <CompactListRow
                    title={subclassStatusLabel}
                    helper={subclassStatusHelper}
                  />

                  <CompactListRow
                    title={ancestryName}
                    helper="Ancestralidade."
                  />

                  <CompactListRow
                    title={`${featureRows.length} feature(s)`}
                    helper="Total disponível para esta ficha."
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Próxima evolução
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-white/45">
                  Depois, algumas features poderão aplicar efeitos mecânicos,
                  usos por descanso, proficiências, bônus e alterações na ficha.
                  Por enquanto, esta aba exibe as features reais do sistema.
                </p>
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

              <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Idiomas
                </p>

                {hasAnyLanguage ? (
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-forge-gold/20 bg-forge-gold/5 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-forge-gold/80">
                        Automáticos
                      </p>

                      {automaticLanguageRows.length > 0 ? (
                        <div className="mt-2 grid gap-2">
                          {automaticLanguageRows.map((language) => (
                            <CompactListRow
                              key={`${language.sourceLabel}-${language.key}`}
                              title={language.name}
                              value={language.sourceLabel}
                              helper={
                                language.description ??
                                "Idioma recebido automaticamente pela origem do personagem."
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                          Nenhum idioma automático cadastrado.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                        Escolhas extras
                      </p>

                      {chosenLanguageRows.length > 0 ? (
                        <div className="mt-2 grid gap-2">
                          {chosenLanguageRows.map((language) => (
                            <CompactListRow
                              key={language.key}
                              title={language.name}
                              value={language.sourceLabel}
                              helper={
                                language.description ??
                                "Idioma escolhido durante a criação da ficha."
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                          Nenhum idioma extra escolhido.
                        </p>
                      )}
                    </div>

                    {otherLanguageRows.length > 0 ? (
                      <div className="rounded-xl border border-white/10 bg-black/25 p-3 lg:col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                          Outras fontes
                        </p>

                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          {otherLanguageRows.map((language) => (
                            <CompactListRow
                              key={language.key}
                              title={language.name}
                              value={language.sourceLabel}
                              helper={
                                language.description ?? "Idioma conhecido."
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                    Nenhum idioma cadastrado para esta ficha.
                  </p>
                )}
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
