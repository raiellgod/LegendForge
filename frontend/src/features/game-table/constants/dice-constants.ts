import type { QuickRoll } from "../types/game-table-types";

export const DICE_OPTIONS = [4, 6, 8, 10, 12, 20, 100];

export const QUICK_ROLLS: QuickRoll[] = [
  {
    id: "d4",
    label: "d4",
    expression: "1d4",
    kind: "dice",
  },
  {
    id: "d6",
    label: "d6",
    expression: "1d6",
    kind: "dice",
  },
  {
    id: "d8",
    label: "d8",
    expression: "1d8",
    kind: "dice",
  },
  {
    id: "d10",
    label: "d10",
    expression: "1d10",
    kind: "dice",
  },
  {
    id: "d10-tens",
    label: "d10 dez.",
    expression: "1d10t",
    kind: "tens",
  },
  {
    id: "d12",
    label: "d12",
    expression: "1d12",
    kind: "dice",
  },
  {
    id: "d20",
    label: "d20",
    expression: "1d20",
    kind: "dice",
  },
  {
    id: "d100",
    label: "d100",
    expression: "1d100",
    kind: "dice",
  },
  {
    id: "coin",
    label: "Moeda",
    expression: "moeda",
    kind: "coin",
  },
];
