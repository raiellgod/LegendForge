# 🧠 DATABASE SETUP — LegendForge

---

Este documento descreve:

- Estrutura do banco
- Regras de negócio
- Progresso da implementação com Prisma
- Domínio de campanhas, mesa e ficha
- Regras de progressão/magia adicionadas na 4.27
- Próximos passos da Fase 4

---

# 📌 STATUS ATUAL — 01/06/2026

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

## 🚧 Em andamento

- Commit da 4.27.
- Preparação da 4.28: refatoração estrutural da ficha pronta.
- Preparação futura da 4.29: ataque real por equipamento, features e level up.

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
- [x] ficha pronta na aba Personagens
- [x] rolagens automáticas pela ficha
- [x] regras avançadas de magia e progressão inicial

---

# 📍 PRÓXIMO PASSO

```txt
4.27.12 — Commit da 4.27
```

Checklist esperado:

```txt
[ ] git status
[ ] git diff --stat
[ ] cd frontend && pnpm lint && cd ..
[ ] git add .
[ ] git status
[ ] git commit -m "feat: add advanced spell progression rules"
```

Depois:

```txt
4.28 — Refatoração estrutural da ficha pronta
```

---

# 🧭 Próximas macros

## 4.28 — Refatoração estrutural da ficha pronta

```txt
[ ] 4.28.1 — Planejar arquitetura da ficha pronta
[ ] 4.28.2 — Definir layout shell: header fixo, laterais fixas e centro variável
[ ] 4.28.3 — Definir modo ficha modal atual versus futura janela destacada/pop-out
[ ] 4.28.4 — Criar padrão de cards compactos com expand/collapse
[ ] 4.28.5 — Aplicar expand/collapse na aba Magia
[ ] 4.28.6 — Aplicar expand/collapse na aba Bolsa
[ ] 4.28.7 — Reorganizar informações fixas da ficha
[ ] 4.28.8 — Reorganizar abas centrais
[ ] 4.28.9 — Preparar área lateral de defesas/sentidos/condições/proficiências
[ ] 4.28.10 — Melhorar densidade visual
[ ] 4.28.11 — Revisar responsividade
[ ] 4.28.12 — Teste regressivo
[ ] 4.28.13 — Atualizar documentação
[ ] 4.28.14 — Commit
```

## 4.29 — Regras avançadas de equipamento, features e level up

```txt
[ ] 4.29.1 — Calcular ataque real por equipamento
[ ] 4.29.2 — Definir regra inicial de ataque por equipamento
[ ] 4.29.3 — Revisar modelagem de pacotes/itens compostos
[ ] 4.29.4 — Popular seed de pacotes de equipamento
[ ] 4.29.5 — Popular seed de equipamentos iniciais por classe
[ ] 4.29.6 — Preparar ataque contra CA manual
[ ] 4.29.7 — Features de classe por nível
[ ] 4.29.8 — Subclasse no nível correto
[ ] 4.29.9 — Preparar fluxo de subir de nível
[ ] 4.29.10 — Level up mostra apenas pendências/mudanças do novo nível
[ ] 4.29.11 — Revisão UX/UI
[ ] 4.29.12 — Teste regressivo
[ ] 4.29.13 — Atualizar documentação
[ ] 4.29.14 — Commit
```

## 4.30 — Multiclasse

```txt
[ ] 4.30.1 — Modelar classes múltiplas da ficha
[ ] 4.30.2 — Criar CharacterSheetClass ou estrutura equivalente
[ ] 4.30.3 — Calcular nível total pela soma das classes
[ ] 4.30.4 — Exibir classes no header da ficha
[ ] 4.30.5 — Fluxo de subir de nível pergunta qual classe aumenta
[ ] 4.30.6 — Aplicar progressão da classe escolhida
[ ] 4.30.7 — Ajustar magias para múltiplas classes
[ ] 4.30.8 — Ajustar perícias/proficiências para multiclasse
[ ] 4.30.9 — Histórico de níveis
[ ] 4.30.10 — Revisão UX/UI do multiclasse
[ ] 4.30.11 — Teste regressivo
[ ] 4.30.12 — Commit
```

---

# 🧾 Observação sobre seed

Com a expansão de magias e futuras expansões de itens, a seed principal tende a crescer demais.

Decisão recomendada:

```txt
Antes de cadastrar grande volume de conteúdo, modularizar o seed em arquivos separados.
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
