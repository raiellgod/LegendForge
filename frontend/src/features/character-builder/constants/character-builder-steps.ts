import type { CharacterBuilderStep } from "../types/character-builder-types";

export const characterBuilderSteps: CharacterBuilderStep[] = [
  {
    id: "concept",
    title: "Conceito",
    description: "Nome, ideia central, imagem e direção inicial do personagem.",
  },
  {
    id: "class",
    title: "Classe",
    description: "Escolha a função principal do personagem na aventura.",
  },
  {
    id: "ancestry",
    title: "Ancestralidade",
    description: "Defina a origem biológica, cultural ou mutada do personagem.",
  },
  {
    id: "background",
    title: "Antecedente",
    description: "Escolha de onde o personagem veio antes da aventura começar.",
  },
  {
    id: "attributes",
    title: "Atributos",
    description: "Distribua os valores principais da ficha.",
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha treinamentos, especialidades e proficiências.",
  },
  {
    id: "spells",
    title: "Magias",
    description: "Selecione truques, magias e poderes conhecidos.",
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Escolha armas, armaduras, ferramentas e itens iniciais.",
  },
  {
    id: "about",
    title: "Sobre",
    description: "Adicione aparência, personalidade, história e notas.",
  },
  {
    id: "review",
    title: "Revisão",
    description: "Confira tudo antes de finalizar a ficha.",
  },
];