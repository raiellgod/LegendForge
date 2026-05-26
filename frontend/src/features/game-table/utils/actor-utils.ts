import type { CampaignActor, CharacterType } from "../types/game-table-types";

export function getCharacterTypeLabel(type: CharacterType) {
  if (type === "PLAYER_CHARACTER") {
    return "Personagem";
  }

  if (type === "NPC") {
    return "NPC";
  }

  return "Criatura";
}

export function getCharacterTypeStyles(type: CharacterType) {
  if (type === "PLAYER_CHARACTER") {
    return "border-forge-gold bg-forge-purple text-forge-gold";
  }

  if (type === "NPC") {
    return "border-purple-300/50 bg-purple-950 text-purple-100";
  }

  return "border-red-400/50 bg-red-950 text-red-100";
}

export function getVisibleActorsForUser(
  actors: CampaignActor[],
  isGM: boolean,
) {
  if (isGM) {
    return actors;
  }

  return actors.filter(
    (actor) => actor.type === "PLAYER_CHARACTER" && actor.location === "TABLE",
  );
}