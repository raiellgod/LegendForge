import type { CharacterBuilderDraft } from "../types/character-builder-types";

import { PRONOUN_OPTIONS } from "../constants/character-builder-constants";

import { CharacterBuilderSelect } from "../components/CharacterBuilderSelect";
import { CharacterBuilderTextInput } from "../components/CharacterBuilderTextInput";
import { CharacterBuilderTextarea } from "../components/CharacterBuilderTextarea";

type CharacterConceptStepProps = {
  draft: CharacterBuilderDraft;
  onChangeDraftField: <K extends keyof CharacterBuilderDraft>(
    key: K,
    value: CharacterBuilderDraft[K],
  ) => void;
};

export function CharacterConceptStep({
  draft,
  onChangeDraftField,
}: CharacterConceptStepProps) {
  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <CharacterBuilderTextInput
          label="Nome do personagem"
          value={draft.name}
          placeholder="Ex.: Hikari, Arven, Kael..."
          title="Nome principal do personagem."
          onChange={(value) => onChangeDraftField("name", value)}
        />

        <CharacterBuilderSelect
          label="Pronomes"
          value={draft.pronouns}
          placeholder="Escolha os pronomes"
          title="Como o personagem prefere ser chamado."
          options={PRONOUN_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          onChange={(value) => onChangeDraftField("pronouns", value)}
        />
      </div>

      <CharacterBuilderTextarea
        label="Conceito"
        value={draft.concept}
        placeholder="Descreva em poucas linhas quem é esse personagem, o que deseja e como se encaixa na aventura..."
        title="Resumo inicial do personagem, motivação e papel na aventura."
        rows={4}
        onChange={(value) => onChangeDraftField("concept", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CharacterBuilderTextInput
          label="URL do retrato"
          value={draft.portraitUrl}
          placeholder="https://..."
          title="Imagem principal do personagem usada na ficha e na revisão."
          onChange={(value) => onChangeDraftField("portraitUrl", value)}
        />

        <CharacterBuilderTextInput
          label="URL do token"
          value={draft.tokenImageUrl}
          placeholder="https://..."
          title="Imagem usada como token na mesa."
          onChange={(value) => onChangeDraftField("tokenImageUrl", value)}
        />
      </div>

      <CharacterBuilderSelect
        label="Encaixe da imagem do token"
        value={draft.tokenImageFit}
        placeholder="Escolha o encaixe do token"
        title="Define como a imagem do token se ajusta ao espaço do token na mesa."
        options={[
          {
            value: "FILL",
            label: "Preencher",
            title: "Estica a imagem para ocupar todo o token.",
          },
          {
            value: "COVER",
            label: "Cobrir",
            title: "Preenche o token mantendo proporção, podendo cortar bordas.",
          },
          {
            value: "CONTAIN",
            label: "Conter",
            title: "Mostra a imagem inteira mantendo proporção, podendo sobrar espaço.",
          },
        ]}
        onChange={(value) =>
          onChangeDraftField(
            "tokenImageFit",
            value as CharacterBuilderDraft["tokenImageFit"],
          )
        }
      />
    </div>
  );
}