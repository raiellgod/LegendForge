"use client";

import type {
  CampaignActor,
  CreatureSheetReady,
} from "@/features/game-table/types/game-table-types";

import {
  NpcCreatureReadySheetView,
  type NpcCreatureReadySheetRollRequest,
} from "./NpcCreatureReadySheetView";

export function CreatureReadySheetModal({
  actor,
  sheet,
  onRoll,
  onClose,
}: {
  actor: CampaignActor;
  sheet: CreatureSheetReady;
  onRoll: (request: NpcCreatureReadySheetRollRequest) => void;
  onClose: () => void;
}) {
  return (
    <NpcCreatureReadySheetView
      actor={actor}
      sheet={sheet}
      kind="CREATURE"
      onRoll={onRoll}
      onClose={onClose}
    />
  );
}
