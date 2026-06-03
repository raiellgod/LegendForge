# 🧠 DATABASE SETUP — LegendForge

---

Este documento descreve:

- Estrutura do banco
- Regras de negócio
- Progresso da implementação com Prisma
- Domínio de campanhas, mesa e ficha
- Regras de progressão/magia adicionadas na 4.27
- Impacto da refatoração estrutural da ficha pronta na 4.28
- Regras avançadas de equipamento, features e Level Up preview na 4.29
- Próximos passos da Fase 4

---

# 📌 STATUS ATUAL — 03/06/2026

## ✅ Implementado

- Banco modelado e funcional.
- Prisma integrado e funcionando.
- Better Auth integrado ao banco.
- Auth persistindo dados corretamente.
- Campanhas implementadas.
- Participantes implementados.
- Sessões de jogo implementadas.
- Atores de campanha implementados.
- Tokens de cena implementados no nível atual.
- Sistema RPG base implementado.
- Classes, ancestralidades, antecedentes, magias e equipamentos semeados.
- `LevelProgression` implementado para progressão por classe/nível.
- `ClassSpell` implementado para magias permitidas por classe.
- `CharacterClass.spellcastingAbilityKey` implementado para atributo de conjuração.
- CharacterSheet e tabelas relacionadas criadas.
- Rascunho de ficha salva/carrega.
- Classe, ancestralidade e antecedente persistem na ficha.
- Atributos persistem em `CharacterSheetStat`.
- Perícias persistem em `CharacterSheetSkill`.
- Magias persistem em `CharacterSheetSpell`.
- Equipamentos iniciais persistem em `CharacterSheetEquipment`.
- Campos de Sobre/aparência/personalidade/história persistem.
- Ficha pronta carrega progressão da classe para exibir espaços de magia.
- Ficha pronta em modal e pop-out consome os mesmos dados persistidos.
- Retrato/token por URL persistem e sincronizam com ator/token.
- Rota pop-out carrega ficha por `campaignId` e `sheetId`.

## 🚧 Em andamento

- 4.28.14 — revisão UX/UI do chat após ficha pop-out.
- 4.28.15 — commit da 4.28.
- 4.29 implementada no nível atual: ataque real por equipamento, features reais, subclasse por nível correto e Level Up preview.

## ❌ Ainda futuro

- Regras SQL avançadas.
- Triggers.
- Constraints finas para regras de jogo avançadas.
- Upload real de imagens.
- Controle de slots usados.
- Campos estruturados de dano de magia.
- Multiclasse.
- Proficiências editáveis pelo GM.
- Armadura/defesa como camada mecânica separada da roupa visual.
- Fichas próprias de NPC e criaturas.
- Sincronização em tempo real de chat/rolagens/tokens.
- Persistência futura de chat e rolagens.

---

# 🗺️ BANCO DE DADOS — NÚCLEO ATUAL

## Auth — Better Auth Core

Tabelas oficiais:

- `user`
- `session`
- `account`
- `verification`

Responsabilidade:

- identidade
- sessão
- autenticação
- vínculo de todo domínio com `user.id`

---

## Campanhas

Modelos relacionados:

- `Campaign`
- `Participant`
- `GameSession`
- `CampaignActor`
- `SceneToken`
- `CharacterSheet`

Responsabilidades:

- representar mundo/campanha
- guardar owner
- permitir visibilidade pública/futura busca
- receber participantes
- conter atores de campanha, tokens e fichas

---

## Participantes

Regras importantes:

- usuário não deve entrar duas vezes na mesma campanha
- owner não deve ser removido da própria campanha
- permissões críticas devem ficar no backend/banco
- futuro: status e solicitações de entrada mais robustos

---

## CampaignActor

Uso atual:

- representa entidade/personagem/NPC/criatura dentro da campanha
- pode estar na mesa ou biblioteca
- alimenta a aba Personagens
- alimenta a ficha pronta como ator vinculado
- não substitui a ficha completa

Regra:

```txt
CampaignActor = ator/entidade da campanha.
CharacterSheet = ficha completa do personagem.
```

---

## SceneToken

Uso atual:

- representa presença visual no mapa/cena
- ligado a `CampaignActor`
- possui posição, tamanho e imagem
- tamanho de token já é editável/persistido no nível atual
- token pode receber atualização de imagem quando a ficha salva tokenImageUrl/tokenImageFit

---

## Sistema RPG

Modelos atuais:

- `GameSystem`
- `Stat`
- `Skill`
- `Ancestry`
- `Background`
- `CharacterClass`
- `CharacterSubclass`
- `Feature`
- `Spell`
- `Equipment`
- `LevelProgression`
- `ClassSpell`

Status:

- sistema base D&D-like/LegendForge iniciado
- dados principais no seed
- conteúdos grandes podem começar no seed e migrar para admin/importadores depois
- seed deve ser modularizado antes de crescer muito em magias/itens

---

## CharacterSheet — Fase 4

Modelos relacionados:

- `CharacterSheet`
- `CharacterSheetStat`
- `CharacterSheetSkill`
- `CharacterSheetSpell`
- `CharacterSheetEquipment`

Estado atual:

- ficha pode ser criada como rascunho
- ficha pertence à campanha, sistema e owner
- campos conceituais persistem
- classe/ancestralidade/antecedente persistem
- atributos persistem
- perícias persistem
- magias persistem
- equipamentos persistem
- campos de sobre persistem
- status pode avançar para ficha pronta
- ficha pronta consome dados persistidos e progressão de classe
- pop-out da ficha consome a mesma fonte de dados da ficha modal

---

# 🪄 REGRAS DE MAGIA E PROGRESSÃO — 4.27

## CharacterClass.spellcastingAbilityKey

Responsabilidade:

```txt
Define qual atributo a classe usa para conjuração.
```

Exemplos:

```txt
Bardo      → charisma
Devoto     → wisdom
Mago       → intelligence
Bárbaro    → null
```

Se for `null`, a classe não possui ataque mágico/CD de magia no nível atual da regra.

---

## LevelProgression

Responsabilidade:

```txt
Guardar progressão por classe e nível.
```

Campos relevantes:

```txt
level
proficiencyBonus
cantripsKnown
spellsKnown
spellsPrepared
spellSlotsLevel1
spellSlotsLevel2
spellSlotsLevel3
spellSlotsLevel4
spellSlotsLevel5
spellSlotsLevel6
spellSlotsLevel7
spellSlotsLevel8
spellSlotsLevel9
```

Uso atual:

- Builder usa nível 1 como base inicial para limites.
- Ficha pronta usa o nível atual da ficha para exibir slots.
- Futuramente será usado no fluxo de subir de nível.

---

## ClassSpell

Responsabilidade:

```txt
Definir quais magias uma classe pode aprender/conjurar e a partir de qual nível.
```

Campos principais:

```txt
classId
spellId
minimumClassLevel
isAlwaysKnown
```

Uso atual:

- Rota de opções retorna `classSpells` por classe.
- Builder filtra magias pela classe selecionada.
- Builder considera `minimumClassLevel <= 1` no fluxo inicial.

---

## Spell seed

A 4.27 expandiu o seed mínimo de magias para permitir testar:

- filtro por classe
- limite de truques
- limite de magias
- dano detectado em descrição
- classes conjuradoras diferentes
- classes sem conjuração

Exemplos de magias semeadas:

```txt
Luz Menor
Toque Fúnebre
Faísca Arcana
Rajada Mental
Chama Instável
Mãos Sombrias
Véu Ilusório
Pulso Arcano
Sussurros dos Mortos
Dardo de Energia
Curar Ferimentos
Escudo Reativo
Raízes Prendentes
Comando Sombrio
Marca do Agouro
Onda Trovejante
```

---

# 🧾 FICHA PRONTA E BANCO — 4.28

A 4.28 não criou novos modelos de banco. A mudança principal foi de arquitetura de frontend e consumo dos dados persistidos.

## O que mudou

- `CharacterReadySheetView` virou o miolo reutilizável da ficha.
- O modal e o pop-out usam a mesma estrutura.
- A rota pop-out carrega:
  - campanha
  - ficha pronta por `sheetId`
  - atores da campanha
  - opções do sistema para perícias
- A ficha continua usando os modelos existentes:
  - `CharacterSheet`
  - `CharacterSheetStat`
  - `CharacterSheetSkill`
  - `CharacterSheetSpell`
  - `CharacterSheetEquipment`
  - `CampaignActor`
  - `SceneToken`

## Imagens

Campos já usados:

```txt
CharacterSheet.portraitUrl
CharacterSheet.tokenImageUrl
CharacterSheet.tokenImageFit
CampaignActor.portraitUrl
SceneToken.imageUrl
SceneToken.imageFit
```

Fluxo atual:

```txt
Salvar imagem na ficha
→ atualiza CharacterSheet
→ atualiza CampaignActor.portraitUrl
→ atualiza tokens existentes do ator com tokenImageUrl/tokenImageFit
```

Limitação:

```txt
Ainda é URL manual. Upload real entra depois.
```

## Pop-out

A rota:

```txt
/campaigns/[id]/sheets/[sheetId]
```

não precisa de novo modelo. Ela usa as rotas/API existentes para carregar dados.

A comunicação de rolagens do pop-out para a mesa é local, via navegador:

```txt
window.opener.postMessage(...)
```

Isso não persiste no banco e não sincroniza entre contas.

---

# ⚔️ REGRAS DE EQUIPAMENTO, FEATURES E LEVEL UP PREVIEW — 4.29


A 4.29 consolidou a primeira camada de regras avançadas para uso real da ficha pronta em mesa.

### Equipamentos e ataques reais

- `Equipment` recebeu campos estruturados para ataque:
  - `damageFormula`
  - `damageType`
  - `attackType`
  - `attackAbilityKey`
  - `alternativeAbilityKey`
  - `weaponGroup`
  - `normalRange`
  - `longRange`
  - `isFinesse`
  - `isThrown`
  - `isTwoHanded`
  - `isVersatile`
  - `versatileDamageFormula`
  - `attackBonus`
  - `damageBonus`
- O seed de equipamentos ofensivos foi atualizado.
- A ficha pronta calcula ataque real por equipamento usando atributo, proficiência temporária e bônus do item.
- A aba Combate exibe os ataques equipados.
- A aba Bolsa continua exibindo ataques/danos como inventário de uso rápido.
- GM possui campo manual de CA do alvo na aba Combate.
- Player não vê nem preenche a CA exata do alvo.
- Comparação automática contra CA ainda não existe; por enquanto a CA aparece apenas como referência no texto da rolagem do GM.

### Features reais

- As rotas de ficha retornam `features` reais disponíveis para a ficha.
- A aba Features exibe recursos/traços por origem:
  - classe
  - subclasse
  - ancestralidade
  - outras fontes futuras
- Features são exibidas como texto mecânico/narrativo.
- Aplicação automática de efeitos de features ainda é futura.

### Subclasse por nível correto

- `CharacterClass.subclassSelectionLevel` foi adicionado.
- O seed define o nível de escolha de subclasse.
- O backend valida que uma subclasse só pode ser escolhida no nível correto.
- A subclasse precisa pertencer à classe escolhida.
- A ficha mostra status de subclasse: indisponível, pendente ou escolhida.

### Level Up preview

- A aba Features recebeu botão Level Up.
- O Level Up abre como modal dentro da ficha pronta/pop-out.
- O modal ainda não salva alterações.
- O backend envia `levelUpPreview` com:
  - nível atual
  - próximo nível
  - progressão atual
  - próxima progressão
  - features novas do próximo nível
  - status de subclasse
- A decisão arquitetural ficou registrada: nível do personagem é diferente de nível de classe.
- O Level Up real precisará futuramente permitir subir uma classe existente ou adicionar multiclasse.
- Ancestralidade, antecedente, equipamentos iniciais e origem do personagem não são reprocessados no Level Up.


---

# 🧠 REGRAS QUE DEVEM EXISTIR NO BANCO OU BACKEND

## Campanhas

- apenas owner pode deletar campanha
- apenas owner/GM pode alterar configurações críticas
- usuário deve ver campanhas onde é owner ou participant
- campanhas inativas não devem aparecer na home
- inviteCode deve ser único

## Participantes

- owner não pode ser removido da própria campanha
- usuário não deve entrar duas vezes na mesma campanha
- alteração de GM deve preservar consistência
- futuro: status `PENDING`, `APPROVED`, `REMOVED`

## Sistemas RPG

- stats devem pertencer ao sistema correto
- skills devem pertencer ao sistema correto
- personagem deve respeitar sistema da campanha
- classe/ancestralidade/antecedente escolhidos devem pertencer ao mesmo sistema
- nível deve respeitar limites
- atributos devem respeitar limites
- progressão deve pertencer à classe correta
- magia permitida deve respeitar `ClassSpell`

## Character Builder

- Conceito exige nome.
- Classe exige classe escolhida.
- Ancestralidade exige ancestralidade escolhida.
- Antecedente exige antecedente escolhido.
- Atributos devem respeitar o método atual de Standard Array.
- Perícias não devem duplicar no futuro.
- Magias devem respeitar classe/nível.
- Limites de truques/magias usam progressão da classe.
- Ao trocar classe, magias antigas são limpas do draft.
- Salvamento deve aceitar rascunho incompleto sem quebrar.

---

# 🔮 REGRAS FUTURAS IMPORTANTES

## Magias

Campos futuros desejáveis em `Spell` ou estrutura relacionada:

```txt
damageFormula
damageType
requiresAttackRoll
requiresSavingThrow
savingThrowAbility
areaShape
areaSize
usesSpellSlot
scalingFormula
```

Motivo:

```txt
Hoje dano é detectado pela descrição. Funciona para teste, mas não é ideal para longo prazo.
```

## Perícias

- Classe fornece lista pré-definida de perícias permitidas.
- Classe fornece quantidade de escolhas.
- Antecedente fornece quantidade de perícias e sugestões.
- Usuário escolhe manualmente.
- Sistema trava duplicidade.

## Proficiências

- Armas, escudos, ferramentas e similares devem ser editáveis pelo GM.
- Personagens podem aprender proficiências durante a campanha.

## Armadura/defesa

- Roupa/aparência é cosmética.
- Defesa vem de camada mecânica aplicada à roupa/equipamento.
- Player pode trocar aparência sem perder defesa.

## Personagens ativos

- Cada player deve ter apenas 1 personagem ativo por campanha.
- GM pode ter vários NPCs/criaturas.
- GM deve ter apenas 1 personagem próprio ativo.
- NPCs/criaturas podem ir para biblioteca.
- Personagens de player precisam de fluxo próprio de inativar/remover/excluir.

## Multiclasse

- Cada ficha poderá ter múltiplas classes.
- O nível total será a soma dos níveis por classe.
- Ao subir de nível, o jogador deverá escolher qual classe recebe o novo nível.
- Progressão, magias, features e proficiências precisam considerar a classe escolhida.

---

# 🧱 ARQUITETURA DE RESPONSABILIDADE

| Camada | Responsabilidade |
|---|---|
| DB | integridade estrutural |
| SQL RULES | regras críticas complexas futuras |
| Prisma | acesso tipado |
| Backend | lógica, permissões e validação |
| Frontend | experiência e feedback visual |

---

# 🧪 PASSOS DE IMPLEMENTAÇÃO

## Fase 1 — Setup Prisma

- [x] Criar `schema.prisma`
- [x] Validar schema
- [x] Gerar Prisma Client
- [x] Conectar com banco

## Fase 2 — Auth

- [x] Better Auth integrado
- [x] User
- [x] Session
- [x] Account
- [x] Verification
- [x] Sessão via cookie validada

## Fase 3 — Campanhas/Mesa

- [x] Campaign
- [x] Participant
- [x] GameSession
- [x] rotas principais de campanha
- [x] join por invite code
- [x] participantes
- [x] atores reais de campanha
- [x] tokens reais na cena

## Fase 4 — Sistema RPG e ficha

- [x] GameSystem
- [x] Stat
- [x] Skill
- [x] Ancestry
- [x] Background
- [x] CharacterClass
- [x] CharacterSubclass
- [x] Feature
- [x] Spell
- [x] Equipment
- [x] LevelProgression
- [x] ClassSpell
- [x] CharacterSheet
- [x] CharacterSheetStat
- [x] CharacterSheetSkill
- [x] CharacterSheetSpell
- [x] CharacterSheetEquipment
- [x] rotas de CharacterSheet
- [x] builder visual
- [x] rascunho persistente
- [x] classe/ancestralidade/antecedente persistentes
- [x] atributos persistentes
- [x] perícias persistentes
- [x] magias persistentes
- [x] equipamentos persistentes
- [x] sobre/revisão visual
- [x] criação de personagem vazio no fluxo novo
- [x] ficha pronta na mesa
- [x] ficha pronta em pop-out
- [x] rolagens da ficha via `postMessage`
- [x] teste regressivo da 4.28

---

# 🧭 Próximo foco

```txt
4.29.15 — Commit da 4.29
4.30 — Multiclasse
4.31 — Modularização e expansão do conteúdo base do sistema
```

# 🌱 Seed — decisão atual

Com muitas magias, itens e features, a seed principal tende a crescer demais.

Decisão recomendada:

```txt
Antes de cadastrar grande volume de conteúdo, modularizar o seed em arquivos separados.
```

Fase planejada:

```txt
4.31 — Modularização e expansão do conteúdo base do sistema
4.31.1 — Separar seed em arquivos por domínio
4.31.2 — Expandir equipamentos
4.31.3 — Expandir magias
4.31.4 — Expandir features
4.31.5 — Expandir pacotes iniciais
```

Estrutura futura sugerida:

```txt
backend/prisma/seeds/
  system.seed.ts
  stats.seed.ts
  skills.seed.ts
  ancestries.seed.ts
  backgrounds.seed.ts
  classes.seed.ts
  subclasses.seed.ts
  level-progressions.seed.ts
  features.seed.ts
  spells.seed.ts
  class-spells.seed.ts
  equipment.seed.ts
  starting-equipment.seed.ts
```
