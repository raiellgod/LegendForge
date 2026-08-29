import type { SceneToken } from "../types/game-table-types";

export function getTokenImageFitClass(imageFit: SceneToken["imageFit"]) {
  if (imageFit === "CONTAIN") {
    return "object-contain";
  }

  if (imageFit === "FILL") {
    return "object-fill";
  }

  return "object-cover";
}