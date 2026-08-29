import type { CampaignParticipant, User } from "../types/game-table-types";

export function getInitials(user: User | null) {
  const name = user?.name?.trim();

  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return user?.email?.slice(0, 2).toUpperCase() ?? "U";
}

export function getParticipantInitials(participant: CampaignParticipant) {
  const name = participant.user.name?.trim();

  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return participant.user.email.slice(0, 2).toUpperCase();
}

export function getDisplayName(user: User | null) {
  return user?.name ?? user?.email ?? "Usuário";
}

export function getParticipantDisplayName(participant: CampaignParticipant) {
  return participant.user.name || participant.user.email || "Usuário";
}