import {
  CharacterReadySheetView,
  type CharacterReadySheetRollRequest,
  type CharacterReadySheetViewProps,
} from "@/features/character-builder/components/CharacterReadySheetView";

export type { CharacterReadySheetRollRequest };

type CharacterReadySheetModalProps = CharacterReadySheetViewProps;

export function CharacterReadySheetModal(props: CharacterReadySheetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <CharacterReadySheetView {...props} />
    </div>
  );
}
