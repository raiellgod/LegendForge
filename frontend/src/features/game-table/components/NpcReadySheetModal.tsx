"use client";

import type {
  CampaignActor,
  NpcSheetReady,
} from "@/features/game-table/types/game-table-types";

import {
  NpcCreatureReadySheetView,
  type NpcCreatureReadySheetRollRequest,
} from "./NpcCreatureReadySheetView";

export function NpcReadySheetModal({
  actor,
  sheet,
  onRoll,
  onClose,
}: {
  actor: CampaignActor;
  sheet: NpcSheetReady;
  onRoll: (request: NpcCreatureReadySheetRollRequest) => void;
  onClose: () => void;
}) {
  return (
    <NpcCreatureReadySheetView
      actor={actor}
      sheet={sheet}
      kind="NPC"
      onRoll={onRoll}
      onClose={onClose}
    />
  );
}
