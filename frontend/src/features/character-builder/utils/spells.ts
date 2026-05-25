import type { CharacterBuilderSpellOption } from "../types/character-builder-types";

export function isCantrip(spell: CharacterBuilderSpellOption) {
  return spell.level === 0;
}

export function isLeveledSpell(spell: CharacterBuilderSpellOption) {
  return spell.level > 0;
}

export function getSpellLevelLabel(level: number) {
  if (level === 0) {
    return "Truque";
  }

  return `Nível ${level}`;
}

export function getCompactSpellDetail(value: string | null) {
  if (!value) {
    return "—";
  }

  return value
    .replace(/\bmetros\b/gi, "m")
    .replace(/\bmetro\b/gi, "m")
    .replace(/\bminutos\b/gi, "min.")
    .replace(/\bminuto\b/gi, "min.")
    .replace(/\binstantâneo\b/gi, "insta")
    .replace(/\binstantanea\b/gi, "insta")
    .replace(/\binstantânea\b/gi, "insta")
    .replace(/\binstantaneo\b/gi, "insta");
}

export function getCharacterSpellKeysFromSpells(
  spells?: Array<{
    spell: {
      key: string;
    };
  }> | null,
) {
  return spells?.map((sheetSpell) => sheetSpell.spell.key) ?? [];
}