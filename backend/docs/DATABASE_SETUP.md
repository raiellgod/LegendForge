# 🧠 DATABASE SETUP — LegendForge

---

Este documento descreve:

- Estrutura do banco
- Regras de negócio
- Progresso da implementação com Prisma
- Domínio de campanhas, mesa e ficha
- Próximos passos da Fase 4

---

# 📌 STATUS ATUAL — 24/05/2026

## ✅ Implementado

- Banco modelado e funcional.
- Prisma integrado e funcionando.
- Better Auth integrado ao banco.
- Auth persistindo dados corretamente.
- Campanhas implementadas.
- Participantes implementados.
- Sessões de jogo implementadas.
- Atores de campanha implementados.
- Tokens de cena iniciados.
- Sistema RPG base implementado.
- Classes, ancestralidades, antecedentes, magias e equipamentos semeados.
- CharacterSheet e tabelas relacionadas criadas.
- Rascunho de ficha salva/carrega.
- Classe, ancestralidade e antecedente persistem na ficha.
- Atributos persistem em `CharacterSheetStat`.
- Perícias persistem em `CharacterSheetSkill`.
- Magias persistem em `CharacterSheetSpell`.
- Equipamentos iniciais persistem em `CharacterSheetEquipment`.
- Campos de Sobre/aparência/personalidade/história persistem.

## 🚧 Em andamento

- Refatoração do Character Builder no frontend.
- Correção do fluxo “Criar personagem do zero”.
- Validação completa da etapa Revisão após extração.
- Limpeza final de `page.tsx`.

## ❌ Ainda futuro

- Regras SQL avançadas.
- Triggers.
- Constraints finas para regras de jogo avançadas.
- Upload real de imagens.
- Multiclasse.
- Proficiências editáveis pelo GM.
- Armadura/defesa como camada mecânica separada da roupa visual.

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
- futura refatoração deve incluir edição de tamanho do token

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

Status:

- sistema base D&D-like/LegendForge iniciado
- dados principais no seed
- conteúdos grandes podem começar no seed e migrar para admin/importadores depois

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

## Character Builder

- Conceito exige nome.
- Classe exige classe escolhida.
- Ancestralidade exige ancestralidade escolhida.
- Antecedente exige antecedente escolhido.
- Atributos devem respeitar o método atual de Standard Array.
- Perícias não devem duplicar no futuro.
- Magias devem respeitar classe/nível no futuro.
- Salvamento deve aceitar rascunho incompleto sem quebrar.

---

# 🔮 REGRAS FUTURAS IMPORTANTES

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
- [ ] corrigir criação de personagem vazio no fluxo novo
- [ ] finalizar validação da refatoração 4.22
- [ ] finalizar ficha e listar de forma definitiva na aba Personagens

---

# 📍 PRÓXIMO PASSO

```txt
4.22.18.3 — Corrigir criação de personagem do zero
```

Checklist esperado:

- [ ] botão “Criar personagem” não deve carregar rascunho antigo
- [ ] criar `CharacterBuilderDraft` vazio
- [ ] limpar `savedCharacterSheetId`
- [ ] limpar `savedCharacterSheetStatus`
- [ ] limpar mensagens de erro/sucesso
- [ ] carregar apenas opções do sistema
- [ ] testar abrindo builder novo
- [ ] só depois avançar para linguagem dinâmica por pronome

---

# 📌 CHECKPOINT

- Auth funcionando.
- Prisma integrado.
- Banco funcional.
- Campanhas reais.
- Mesa em evolução.
- Sistema RPG base semeado.
- Builder avançado.
- Refatoração 4.22 em andamento.
