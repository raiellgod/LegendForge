"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import type {
  CharacterBuilderOptions,
  CharacterReadySheet,
} from "@/features/character-builder/types/character-builder-types";

import {
  CharacterReadySheetView,
  type CharacterReadySheetRollRequest,
} from "@/features/character-builder/components/CharacterReadySheetView";

import type { CampaignActor } from "@/features/game-table/types/game-table-types";

import {
  getCampaign,
  getCampaignActors,
  getCampaignCharacterSheet,
  updateCampaignCharacterSheetImages,
} from "@/features/game-table/services/game-table-api";

function createEmptyCharacterBuilderOptions(): CharacterBuilderOptions {
  return {
    classes: [],
    ancestries: [],
    backgrounds: [],
    skills: [],
    spells: [],
    equipment: [],
  };
}

export default function CharacterSheetPopoutPage() {
  const params = useParams<{ id: string; sheetId: string }>();
  const router = useRouter();

  const [characterSheet, setCharacterSheet] =
    useState<CharacterReadySheet | null>(null);
  const [actors, setActors] = useState<CampaignActor[]>([]);
  const [characterBuilderOptions, setCharacterBuilderOptions] =
    useState<CharacterBuilderOptions>(createEmptyCharacterBuilderOptions);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSavingCharacterSheetImages, setIsSavingCharacterSheetImages] =
    useState(false);

  useEffect(() => {
    async function loadPopoutSheet() {
      setLoading(true);
      setLoadError(null);

      try {
        const { data } = await authClient.getSession();

        if (!data?.user) {
          router.push("/login");
          return;
        }

        const [campaignData, sheetData, actorsData] = await Promise.all([
          getCampaign(params.id),
          getCampaignCharacterSheet(params.id, params.sheetId),
          getCampaignActors(params.id),
        ]);

        setCharacterSheet(sheetData);
        setActors(actorsData);

        if (campaignData.systemId) {
          const optionsResponse = await fetch(
            `http://localhost:8081/systems/${campaignData.systemId}/character-options`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const optionsData = await optionsResponse.json().catch(() => null);

          if (!optionsResponse.ok) {
            throw new Error(
              optionsData?.message ??
                "Não foi possível carregar opções do sistema.",
            );
          }

          setCharacterBuilderOptions({
            classes: optionsData.classes ?? [],
            ancestries: optionsData.ancestries ?? [],
            backgrounds: optionsData.backgrounds ?? [],
            skills: optionsData.skills ?? [],
            spells: optionsData.spells ?? [],
            equipment: optionsData.equipment ?? [],
          });
        }
      } catch (error) {
        console.error(error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a ficha.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPopoutSheet();
  }, [params.id, params.sheetId, router]);

  const actor = characterSheet?.campaignActorId
    ? (actors.find(
        (currentActor) => currentActor.id === characterSheet.campaignActorId,
      ) ?? null)
    : null;

  async function handleUpdateCharacterSheetImages(
    characterSheetId: string,
    data: {
      portraitUrl: string | null;
      tokenImageUrl: string | null;
      tokenImageFit: CharacterReadySheet["tokenImageFit"];
    },
  ) {
    setIsSavingCharacterSheetImages(true);

    try {
      const updatedCharacterSheet = await updateCampaignCharacterSheetImages(
        params.id,
        characterSheetId,
        data,
      );

      setCharacterSheet(updatedCharacterSheet);
    } finally {
      setIsSavingCharacterSheetImages(false);
    }
  }

  function handlePopoutRollSheetAction(
    request: CharacterReadySheetRollRequest,
  ) {
    window.opener?.postMessage(
      {
        source: "legendforge-sheet-popout",
        type: "ROLL_SHEET_ACTION",
        payload: request,
      },
      window.location.origin,
    );
  }

  return (
    <main className="min-h-screen bg-[#09040d] px-4 py-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-center justify-center">
        {loading ? (
          <section className="w-full rounded-2xl border border-white/10 bg-black/25 p-6">
            <p className="text-sm font-bold text-white/55">
              Carregando ficha...
            </p>
          </section>
        ) : loadError ? (
          <section className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 p-6">
            <p className="text-sm font-black text-red-200">{loadError}</p>
          </section>
        ) : !characterSheet ? (
          <section className="w-full rounded-2xl border border-white/10 bg-black/25 p-6">
            <p className="text-sm font-bold text-white/55">
              Ficha não encontrada.
            </p>
          </section>
        ) : !actor ? (
          <section className="w-full rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
            <p className="text-sm font-black text-amber-100">
              A ficha foi carregada, mas o ator vinculado não foi encontrado na
              campanha.
            </p>
          </section>
        ) : (
          <CharacterReadySheetView
            actor={actor}
            characterSheet={characterSheet}
            allSkills={characterBuilderOptions.skills}
            isGM={true}
            isSavingImages={isSavingCharacterSheetImages}
            onSaveImages={handleUpdateCharacterSheetImages}
            onRollSheetAction={handlePopoutRollSheetAction}
            onClose={() => window.close()}
          />
        )}
      </div>
    </main>
  );
}
