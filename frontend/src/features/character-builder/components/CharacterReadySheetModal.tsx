import { useState } from "react";

import type {
  CharacterAttributeKey,
  CharacterBuilderSkillOption,
  CharacterReadySheet,
} from "@/features/character-builder/types/character-builder-types";

import type { CampaignActor } from "@/features/game-table/types/game-table-types";

import {
  formatSignedNumber,
  getAttributeModifier,
  getAttributeValueFromStats,
  getInitiativeBonus,
  getPassivePerception,
  getProficiencyBonusByLevel,
  getSavingThrowBonus,
  getSkillBonus,
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

type CharacterReadySheetModalProps = {
  actor: CampaignActor;
  characterSheet: CharacterReadySheet | null;
  allSkills: CharacterBuilderSkillOption[];
  isGM: boolean;
  isSavingImages: boolean;
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

type ReadySheetTab = "status" | "bag" | "spells" | "profile";

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
          <img
            src={imageUrl}
            alt={label}
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

function RollableSheetBox({
  label,
  value,
  helper,
  onRoll,
}: {
  label: string;
  value: string;
  helper?: string;
  onRoll: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRoll}
      title="Rolar 1d20 com este modificador."
      className="group rounded-xl border border-white/10 bg-black/25 p-2.5 text-left shadow-[-3px_3px_0_rgba(0,0,0,0.22)] transition hover:border-forge-gold/45 hover:bg-forge-gold/10"
    >
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
        <p className="mt-0.5 text-[9px] font-semibold leading-relaxed text-white/40 group-hover:text-forge-gold/75">
          {helper}
        </p>
      ) : null}
    </button>
  );
}

function AttributeCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const modifier = getAttributeModifier(value);
  const displayValue = typeof value === "number" ? String(value) : "—";
  const displayModifier =
    typeof value === "number" ? formatSignedNumber(modifier) : "—";

  return (
    <div className="rounded-xl border border-forge-gold/25 bg-[#1a0d20] p-2.5 text-center shadow-[-3px_3px_0_rgba(0,0,0,0.25)]">
      <p
        className="truncate text-[11px] font-black text-white/70"
        title={label}
      >
        {label}
      </p>

      <div className="mt-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5">
        <p className="text-xl font-black leading-tight text-forge-gold">
          {displayValue}
        </p>
        <p className="text-[9px] font-bold text-white/35">
          mod {displayModifier}
        </p>
      </div>
    </div>
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
        <span className="rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35 group-hover:border-forge-gold/35 group-hover:text-forge-gold">
          d20
        </span>

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

function SpellCard({
  name,
  level,
  school,
  castingTime,
  range,
  duration,
  components,
  description,
  onRollAttack,
  onRollDamage,
  onUseEffect,
}: {
  name: string;
  level: number;
  school: string;
  castingTime: string | null;
  range: string | null;
  duration: string | null;
  components: string[] | string | null;
  description: string | null;
  onRollAttack: () => void;
  onRollDamage?: () => void;
  onUseEffect: () => void;
}) {
  const levelLabel = level === 0 ? "Truque" : `Nível ${level}`;

  const componentLabel = Array.isArray(components)
    ? components.length > 0
      ? components.join(", ")
      : "—"
    : components?.trim() || "—";

  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="min-w-0 break-words text-sm font-black leading-snug text-forge-gold"
            title={name}
          >
            {name}
          </p>

          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
            {levelLabel} · {school}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-forge-gold/25 bg-forge-gold/10 px-2 py-1 text-[10px] font-black text-forge-gold">
          {levelLabel}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-[10px] font-semibold text-white/45 md:grid-cols-2">
        <p>
          <span className="font-black text-white/35">Conjuração:</span>{" "}
          {castingTime ?? "—"}
        </p>

        <p>
          <span className="font-black text-white/35">Alcance:</span>{" "}
          {range ?? "—"}
        </p>

        <p>
          <span className="font-black text-white/35">Duração:</span>{" "}
          {duration ?? "—"}
        </p>

        <p>
          <span className="font-black text-white/35">Componentes:</span>{" "}
          {componentLabel}
        </p>
      </div>

      <p
        className="mt-3 line-clamp-5 text-xs font-semibold leading-relaxed text-white/55"
        title={description ?? "Sem descrição cadastrada."}
      >
        {description ?? "Sem descrição cadastrada."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRollAttack}
          className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
          title={`Rolar ataque mágico básico de ${name}: 1d20 + 0. Bônus real e comparação com CA entram na fase de regras avançadas.`}
        >
          Ataque
        </button>

        {onRollDamage ? (
          <button
            type="button"
            onClick={onRollDamage}
            className="rounded-lg border border-forge-gold/30 bg-forge-gold/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
            title={`Rolar dano detectado na descrição de ${name}. Este cálculo será refinado nas regras avançadas.`}
          >
            Dano
          </button>
        ) : null}

        <button
          type="button"
          onClick={onUseEffect}
          className="rounded-lg border border-purple-300/20 bg-purple-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-purple-200 transition hover:border-purple-300/45 hover:bg-purple-500/20"
          title={`Enviar efeito de ${name} para o chat.`}
        >
          Efeito
        </button>
      </div>
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

export function CharacterReadySheetModal({
  actor,
  characterSheet,
  allSkills,
  isGM,
  isSavingImages,
  onSaveImages,
  onRollSheetAction,
  onClose,
}: CharacterReadySheetModalProps) {
  const [activeTab, setActiveTab] = useState<ReadySheetTab>("status");

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

  const spellcastingClass = characterSheet?.characterClass?.name ?? "—";
  const spellcastingAbility = "—";
  const spellSaveDc = "—";
  const spellAttackBonus = "—";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[min(820px,92vh)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-forge-gold/50 bg-[#120816] shadow-[-14px_14px_0_rgba(0,0,0,0.45)]">
        <header className="flex shrink-0 flex-col gap-3 border-b border-forge-gold/25 bg-[#1a0d20] px-5 py-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            {editablePortraitUrl.trim() ? (
              <div
                className="h-14 w-14 shrink-0 rounded-xl border border-forge-gold/40 bg-cover bg-center shadow-[-4px_4px_0_rgba(0,0,0,0.35)]"
                style={{
                  backgroundImage: `url(${editablePortraitUrl})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-xl font-black shadow-[-4px_4px_0_rgba(0,0,0,0.35)] ${getCharacterTypeStyles(
                  actor.type,
                )}`}
              >
                {actor.initials}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="min-w-0 break-words text-2xl font-black leading-tight text-forge-gold">
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

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SheetTabButton
                  label="Ficha/Status"
                  isActive={activeTab === "status"}
                  onClick={() => setActiveTab("status")}
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
                  label="Perfil"
                  isActive={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-start text-2xl font-black text-white/45 transition hover:text-forge-gold lg:self-auto"
            aria-label="Fechar ficha"
          >
            ×
          </button>
        </header>

        {activeTab === "status" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid gap-3">
              <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Atributos
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {READY_SHEET_ATTRIBUTES.map((attribute) => (
                    <AttributeCard
                      key={attribute.key}
                      label={attribute.label}
                      value={getAttributeValueFromStats(
                        sheetStats,
                        attribute.key,
                      )}
                    />
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-2 lg:grid-cols-3 2xl:grid-cols-6">
                <SheetBox label="CA" value={armorClass} helper="Armadura" />

                <RollableSheetBox
                  label="Iniciativa"
                  value={initiativeBonus}
                  helper="rolar"
                  onRoll={() =>
                    onRollSheetAction({
                      kind: "d20",
                      label: `Iniciativa — ${displayName}`,
                      modifier: getInitiativeBonus(sheetStats),
                    })
                  }
                />

                <SheetBox label="Desloc." value={speed} helper="metros" />

                <SheetBox
                  label="Prof."
                  value={proficiencyBonus}
                  helper="nível"
                />

                <SheetBox
                  label="Percepção"
                  value={passivePerception}
                  helper="passiva"
                />

                <SheetBox
                  label="Inspiração"
                  value={inspiration}
                  helper="estado"
                />
              </section>

              <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <SheetBox label="PV atuais" value={hitPoints} />
                <SheetBox label="PV máximos" value={maxHitPoints} />
                <SheetBox label="PV temporários" value={temporaryHp} />
                <SheetBox label="Dados de vida usados" value={hitDiceUsed} />
                <SheetBox label="Testes contra morte" value={deathSaves} />
              </section>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Testes de resistência
                    </p>
                  </div>

                  <div className="mt-2 grid gap-1.5">
                    {savingThrows.map((savingThrow) => (
                      <RollableLine
                        key={savingThrow.key}
                        label={savingThrow.label}
                        helper={savingThrow.shortName}
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
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Perícias
                    </p>
                  </div>

                  {sheetSkillRows.length > 0 ? (
                    <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                      {sheetSkillRows.map((skill) => (
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
                  ) : (
                    <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                      Nenhuma perícia registrada nesta ficha.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </div>
        ) : activeTab === "bag" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <main className="space-y-4">
                <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Ataques por equipamento
                    </p>
                  </div>

                  {attackRows.length > 0 ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {attackRows.map((attack) => (
                        <div
                          key={attack.id}
                          className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 transition hover:border-forge-gold/35 hover:bg-forge-gold/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className="min-w-0 break-words text-xs font-black leading-snug text-white/70"
                                title={attack.name}
                              >
                                {attack.name}
                              </p>

                              <p
                                className="mt-1 line-clamp-2 text-[10px] font-semibold leading-relaxed text-white/35"
                                title={attack.helper}
                              >
                                {attack.helper}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs font-black text-forge-gold">
                              {attack.damageLabel}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onRollSheetAction({
                                  kind: "d20",
                                  label: `Ataque básico — ${attack.name}`,
                                  modifier: 0,
                                })
                              }
                              className="rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-forge-gold/45 hover:bg-forge-gold/10 hover:text-forge-gold"
                              title={`Rolar ataque básico de ${attack.name}: 1d20 + 0. Bônus real, alvo e comparação com CA entram em micro futura.`}
                            >
                              Ataque
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onRollSheetAction({
                                  kind: "damage",
                                  label: `Dano — ${attack.name}`,
                                  expression: attack.damageExpression,
                                })
                              }
                              className="rounded-lg border border-forge-gold/30 bg-forge-gold/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-forge-gold transition hover:border-forge-gold hover:bg-forge-gold/20"
                              title={`Rolar dano de ${attack.name}: ${attack.damageLabel}. Use depois que o ataque acertar.`}
                            >
                              Dano
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                      Nenhum ataque derivado de equipamento por enquanto.
                    </p>
                  )}
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Equipamentos
                  </p>

                  {equipmentRows.length > 0 ? (
                    <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                      {equipmentRows.map((item) => (
                        <CompactListRow
                          key={item.id}
                          title={`${item.quantity}x ${item.name}`}
                          value={item.isEquipped ? "Equipado" : undefined}
                          helper={item.helper ?? undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs font-semibold leading-relaxed text-white/45">
                      Nenhum equipamento registrado nesta ficha.
                    </p>
                  )}
                </section>
              </main>

              <aside className="space-y-4">
                <SheetBox
                  label="Moedas"
                  value={startingGold}
                  helper="iniciais"
                />

                <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Bolsa
                  </p>
                </section>
              </aside>
            </div>
          </div>
        ) : activeTab === "spells" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <section className="rounded-2xl border border-forge-gold/25 bg-black/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Página de magias
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-forge-gold">
                    Conjuração
                  </h3>
                </div>

                <div className="grid min-w-72 gap-2 sm:grid-cols-2">
                  <SheetBox
                    label="Classe conjuradora"
                    value={spellcastingClass}
                    helper="classe"
                  />

                  <SheetBox
                    label="Habilidade"
                    value={spellcastingAbility}
                    helper="chave"
                  />

                  <SheetBox label="CD magia" value={spellSaveDc} helper="TR" />

                  <SheetBox
                    label="Ataque mágico"
                    value={spellAttackBonus}
                    helper="bônus"
                  />
                </div>
              </div>
            </section>

            <div className="mt-5 space-y-5">
              {sortedSpellLevels.length > 0 ? (
                sortedSpellLevels.map((level) => {
                  const spells = spellsByLevel[level] ?? [];
                  const levelLabel = level === 0 ? "Truques" : `Nível ${level}`;

                  return (
                    <section
                      key={level}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                          {levelLabel}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 xl:grid-cols-2">
                        {spells.map((sheetSpell) => (
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
                            onRollAttack={() =>
                              onRollSheetAction({
                                kind: "d20",
                                label: `Ataque mágico básico — ${sheetSpell.spell.name}`,
                                modifier: 0,
                              })
                            }
                            onRollDamage={
                              getFirstDamageExpressionFromText(
                                sheetSpell.spell.description,
                              )
                                ? () =>
                                    onRollSheetAction({
                                      kind: "damage",
                                      label: `Dano mágico — ${sheetSpell.spell.name}`,
                                      expression:
                                        getFirstDamageExpressionFromText(
                                          sheetSpell.spell.description,
                                        ) ?? "1d4",
                                    })
                                : undefined
                            }
                            onUseEffect={() =>
                              onRollSheetAction({
                                kind: "effect",
                                label: `Magia — ${sheetSpell.spell.name}`,
                                description:
                                  sheetSpell.spell.description ??
                                  "Efeito da magia ainda sem descrição.",
                              })
                            }
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
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
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
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
                    História e notas
                  </p>

                  <div className="mt-2 grid gap-1.5">
                    <NarrativeField
                      label="História"
                      value={characterSheet?.backstory}
                    />

                    <NarrativeField
                      label="Notas"
                      value={characterSheet?.notes}
                    />

                    {isGM ? (
                      <NarrativeField
                        label="Notas do mestre"
                        value={characterSheet?.gmNotes}
                      />
                    ) : null}
                  </div>
                </section>
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
