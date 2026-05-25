import { ReactNode } from "react";

import type { CharacterBuilderDraft } from "../types/character-builder-types";

import {
  ALIGNMENT_OPTIONS,
  GENDER_OPTIONS,
  LIFESTYLE_OPTIONS,
  PRONOUN_OPTIONS,
} from "../constants/character-builder-constants";

import { CharacterBuilderSelect } from "../components/CharacterBuilderSelect";
import { CharacterBuilderTextInput } from "../components/CharacterBuilderTextInput";
import { CharacterBuilderTextarea } from "../components/CharacterBuilderTextarea";

type CharacterAboutStepProps = {
  draft: CharacterBuilderDraft;
  onChangeDraftField: <K extends keyof CharacterBuilderDraft>(
    key: K,
    value: CharacterBuilderDraft[K],
  ) => void;
};

function CharacterAboutSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-black/20 p-4 shadow-[-4px_4px_0_rgba(0,0,0,0.22)]"
      title={description}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <h4 className="text-sm font-black uppercase tracking-[0.22em] text-forge-gold">
          {title}
        </h4>

        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-[10px] font-black text-zinc-500"
          title={description}
          aria-label={`Informação sobre ${title}`}
        >
          i
        </span>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CharacterAboutStep({
  draft,
  onChangeDraftField,
}: CharacterAboutStepProps) {
  return (
    <div className="mt-5 space-y-4">
      <CharacterAboutSection
        title="Identidade"
        description="Campos para definir a identidade social, crenças e modo de vida do personagem."
      >
        <div className="grid gap-4 md:grid-cols-2">
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

          <CharacterBuilderSelect
            label="Alinhamento"
            value={draft.alignment}
            placeholder="Choose an alignment"
            title="Tendência moral e ética geral do personagem. Lawful = leal/ordeiro; Neutral = neutro; Chaotic = caótico; Good = bom; Evil = mau."
            options={ALIGNMENT_OPTIONS.map((option) => ({
              value: option,
              label: option,
              title: {
                "Lawful Good":
                  "Leal e Bom: segue códigos, honra e busca fazer o bem.",
                "Neutral Good":
                  "Neutro e Bom: faz o bem sem depender tanto de leis ou caos.",
                "Chaotic Good":
                  "Caótico e Bom: valoriza liberdade e faz o bem fora das regras.",
                "Lawful Neutral":
                  "Leal e Neutro: prioriza ordem, tradição ou código.",
                "True Neutral":
                  "Neutro: busca equilíbrio, pragmatismo ou distância moral.",
                "Chaotic Neutral":
                  "Caótico e Neutro: prioriza liberdade, impulso ou independência.",
                "Lawful Evil":
                  "Leal e Mau: usa ordem, poder e regras para benefício próprio.",
                "Neutral Evil":
                  "Neutro e Mau: age por interesse próprio sem grande código moral.",
                "Chaotic Evil":
                  "Caótico e Mau: destrutivo, cruel ou guiado por impulsos sombrios.",
              }[option],
            }))}
            onChange={(value) => onChangeDraftField("alignment", value)}
          />

          <CharacterBuilderTextInput
            label="Fé"
            value={draft.faith}
            placeholder="Divindade, filosofia, credo..."
            title="Crença, divindade, filosofia, juramento ou ausência de fé."
            onChange={(value) => onChangeDraftField("faith", value)}
          />

          <CharacterBuilderSelect
            label="Estilo de vida"
            value={draft.lifestyle}
            placeholder="Escolha um estilo de vida"
            title="Condição social e modo de vida predominante do personagem. Exemplo: Pobre vive com poucos recursos; Confortável tem rotina estável; Aristocrático circula entre elites."
            options={LIFESTYLE_OPTIONS.map((option) => ({
              value: option,
              label: option,
              title: {
                Miserável:
                  "Vive no limite da sobrevivência, sem moradia ou recursos estáveis.",
                Pobre:
                  "Tem poucos recursos e precisa escolher bem onde gastar.",
                Modesto: "Vida simples, funcional e sem luxo.",
                Confortável:
                  "Rotina estável, abrigo seguro e recursos suficientes.",
                Rico: "Acesso constante a conforto, contatos e recursos.",
                Aristocrático:
                  "Ligado a nobreza, elite, títulos ou círculos de poder.",
                Nômade: "Vive em movimento, sem residência fixa.",
                Militar:
                  "Vida estruturada por hierarquia, disciplina ou serviço armado.",
                Clandestino:
                  "Vive escondido, à margem da lei ou sob identidade discreta.",
              }[option],
            }))}
            onChange={(value) => onChangeDraftField("lifestyle", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="Aparência"
        description="Características físicas usadas para descrever o personagem na mesa."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterBuilderTextInput
            label="Cabelo"
            value={draft.hair}
            placeholder="Ex.: preto, curto, trançado..."
            title="Cor, corte, textura ou estilo do cabelo."
            onChange={(value) => onChangeDraftField("hair", value)}
          />

          <CharacterBuilderTextInput
            label="Pele"
            value={draft.skin}
            placeholder="Ex.: parda, marcada, metálica..."
            title="Tom, textura, marcas ou características da pele."
            onChange={(value) => onChangeDraftField("skin", value)}
          />

          <CharacterBuilderTextInput
            label="Olhos"
            value={draft.eyes}
            placeholder="Ex.: âmbar, verdes, artificiais..."
            title="Cor, formato ou característica marcante dos olhos."
            onChange={(value) => onChangeDraftField("eyes", value)}
          />

          <CharacterBuilderTextInput
            label="Altura"
            value={draft.height}
            placeholder="Ex.: 1,72m"
            title="Altura aproximada do personagem."
            onChange={(value) => onChangeDraftField("height", value)}
          />

          <CharacterBuilderTextInput
            label="Peso"
            value={draft.weight}
            placeholder="Ex.: 74kg"
            title="Peso aproximado do personagem."
            onChange={(value) => onChangeDraftField("weight", value)}
          />

          <CharacterBuilderTextInput
            label="Idade"
            value={draft.age}
            placeholder="Ex.: 24 anos"
            title="Idade aparente, real ou estimada do personagem."
            onChange={(value) => onChangeDraftField("age", value)}
          />

          <CharacterBuilderSelect
            label="Gênero"
            value={draft.gender}
            placeholder="Escolha um gênero"
            title="Gênero, identidade ou apresentação do personagem."
            options={GENDER_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
            onChange={(value) => onChangeDraftField("gender", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="Personalidade"
        description="Traços narrativos usados para interpretar vínculos, ideais, defeitos e comportamento."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterBuilderTextarea
            label="Vínculos"
            value={draft.bonds}
            placeholder="Pessoas, lugares, promessas ou relações importantes..."
            title="Laços emocionais, promessas e relações importantes."
            rows={4}
            onChange={(value) => onChangeDraftField("bonds", value)}
          />

          <CharacterBuilderTextarea
            label="Defeitos"
            value={draft.flaws}
            placeholder="Medos, impulsos, vícios, limites..."
            title="Fraquezas, vícios, medos ou impulsos que complicam a vida do personagem."
            rows={4}
            onChange={(value) => onChangeDraftField("flaws", value)}
          />

          <CharacterBuilderTextarea
            label="Ideais"
            value={draft.ideals}
            placeholder="Princípios, crenças, objetivos maiores..."
            title="Princípios, crenças ou objetivos que guiam o personagem."
            rows={4}
            onChange={(value) => onChangeDraftField("ideals", value)}
          />

          <CharacterBuilderTextarea
            label="Traços"
            value={draft.personality}
            placeholder="Jeito de falar, hábitos, postura..."
            title="Traços de personalidade, hábitos, maneirismos ou postura social."
            rows={4}
            onChange={(value) => onChangeDraftField("personality", value)}
          />
        </div>
      </CharacterAboutSection>

      <CharacterAboutSection
        title="História e notas"
        description="Campos narrativos longos para história, observações e anotações reservadas."
      >
        <div className="space-y-4">
          <CharacterBuilderTextarea
            label="História"
            value={draft.backstory}
            placeholder="Conte a origem, eventos importantes e motivações do personagem..."
            title="História pessoal, origem, eventos marcantes e motivações."
            rows={5}
            onChange={(value) => onChangeDraftField("backstory", value)}
          />

          <CharacterBuilderTextarea
            label="Notas"
            value={draft.notes}
            placeholder="Notas públicas, detalhes extras ou lembretes..."
            title="Notas gerais visíveis e úteis sobre o personagem."
            rows={4}
            onChange={(value) => onChangeDraftField("notes", value)}
          />

          <CharacterBuilderTextarea
            label="Notas do mestre"
            value={draft.gmNotes}
            placeholder="Segredos, ganchos ou informações reservadas..."
            title="Notas reservadas para o mestre ou detalhes secretos."
            rows={4}
            onChange={(value) => onChangeDraftField("gmNotes", value)}
          />
        </div>
      </CharacterAboutSection>
    </div>
  );
}