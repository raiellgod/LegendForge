import type {
  Campaign,
  CampaignActor,
  CampaignParticipant,
  SceneToken,
} from "../types/game-table-types";

import type { CharacterReadySheet } from "@/features/character-builder/types/character-builder-types";

export async function getCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`http://localhost:8081/campaigns/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar campanha");
  }

  const data = await response.json();

  return data.campaign;
}

export async function getCampaignParticipants(
  campaignId: string,
): Promise<CampaignParticipant[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/participants`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar participantes");
  }

  const data = await response.json();

  return data.participants;
}

export async function createCampaignActor(
  campaignId: string,
  data: {
    name: string;
    type: CampaignActor["type"];
    location?: CampaignActor["location"];
    initials?: string;
    description?: string | null;
    portraitUrl?: string | null;
    ownerId?: string | null;
  },
): Promise<CampaignActor> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/actors`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao criar ator da campanha");
  }

  const responseData = await response.json();

  return responseData.actor;
}

export async function getCampaignCharacterSheets(
  campaignId: string,
): Promise<CharacterReadySheet[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/character-sheets`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ?? "Erro ao carregar fichas da campanha",
    );
  }

  const responseData = await response.json();

  return responseData.characterSheets;
}

export async function getCampaignCharacterSheet(
  campaignId: string,
  characterSheetId: string,
): Promise<CharacterReadySheet> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/character-sheets/${characterSheetId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao carregar ficha");
  }

  const responseData = await response.json();

  return responseData.characterSheet;
}

export async function updateCampaignCharacterSheetLevelUpAvailability(
  campaignId: string,
  characterSheetId: string,
  data: {
    levelUpAvailable: boolean;
  },
): Promise<CharacterReadySheet> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/character-sheets/${characterSheetId}/level-up-availability`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar liberação de Level Up");
  }

  const responseData = await response.json();

  return responseData.characterSheet;
}

export async function confirmCampaignCharacterSheetLevelUp(
  campaignId: string,
  characterSheetId: string,
  data: {
    classEntryId?: string;
  } = {},
): Promise<CharacterReadySheet> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/character-sheets/${characterSheetId}/level-up`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao confirmar Level Up");
  }

  const responseData = await response.json();

  return responseData.characterSheet;
}

export async function updateCampaignCharacterSheetImages(
  campaignId: string,
  characterSheetId: string,
  data: {
    portraitUrl?: string | null;
    tokenImageUrl?: string | null;
    tokenImageFit?: CharacterReadySheet["tokenImageFit"];
  },
): Promise<CharacterReadySheet> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/character-sheets/${characterSheetId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar imagens da ficha");
  }

  const responseData = await response.json();

  return responseData.characterSheet;
}

export async function getCampaignActors(
  campaignId: string,
): Promise<CampaignActor[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/actors`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar atores da campanha");
  }

  const data = await response.json();

  return data.actors;
}

export async function getCampaignTokens(
  campaignId: string,
): Promise<SceneToken[]> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar tokens da campanha");
  }

  const data = await response.json();

  return data.tokens;
}

export async function createSceneToken(
  campaignId: string,
  actorId: string,
  data: {
    name?: string;
    initials?: string;
    imageUrl?: string | null;
    imageFit?: SceneToken["imageFit"];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } = {},
): Promise<SceneToken> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actorId,
        ...data,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao criar token na cena");
  }

  const responseData = await response.json();

  return responseData.token;
}

export async function deleteSceneToken(campaignId: string, tokenId: string) {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens/${tokenId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao remover token da cena");
  }

  const responseData = await response.json();

  return responseData.deletedTokenId as string;
}

export async function updateSceneToken(
  campaignId: string,
  tokenId: string,
  data: Partial<
    Pick<
      SceneToken,
      | "name"
      | "initials"
      | "imageUrl"
      | "imageFit"
      | "x"
      | "y"
      | "width"
      | "height"
    >
  >,
): Promise<SceneToken> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/tokens/${tokenId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar token da cena");
  }

  const responseData = await response.json();

  return responseData.token;
}

export async function updateCampaignActor(
  campaignId: string,
  actorId: string,
  data: Partial<
    Pick<
      CampaignActor,
      "location" | "name" | "initials" | "description" | "portraitUrl"
    >
  >,
): Promise<CampaignActor> {
  const response = await fetch(
    `http://localhost:8081/campaigns/${campaignId}/actors/${actorId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message ?? "Erro ao atualizar ator da campanha");
  }

  const responseData = await response.json();

  return responseData.actor;
}
