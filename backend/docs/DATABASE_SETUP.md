# 🧠 DATABASE SETUP — LegendForge

Este documento descreve:

- Estrutura do banco
- Regras de negócio
- Progresso da implementação com Prisma
- Domínio de campanhas, mesa e ficha
- Próximo passo da Fase 4

---

# 📌 STATUS ATUAL — 21/05/2026

✔ Banco modelado no dbdiagram  
✔ Prisma integrado e funcionando  
✔ Better Auth integrado ao banco  
✔ Auth persistindo dados corretamente  
✔ Campanhas implementadas no Prisma  
✔ Participantes implementados no Prisma  
✔ Sessões de jogo implementadas no Prisma  
✔ Atores de campanha implementados  
✔ Tokens de cena iniciados  
✔ Sistema RPG base implementado  
✔ Classes, ancestralidades, antecedentes, magias e equipamentos semeados  
✔ CharacterSheet e tabelas relacionadas criadas  
✔ Rascunho de ficha salva/carrega  
✔ Classe, ancestralidade e antecedente persistem na ficha  
🔄 Atributos visuais criados no frontend  
🔜 Próximo: persistir atributos em `CharacterSheetStat`  
❌ Regras SQL avançadas ainda não aplicadas  
❌ Triggers ainda não implementadas  

---

# 🗺️ BANCO DE DADOS — NÚCLEO ATUAL

## 🔐 Auth — Better Auth Core

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

## 🎲 Campanhas

Responsabilidades:

- representar um mundo/campanha
- guardar owner
- permitir visibilidade pública/futura busca
- guardar imagem de capa
- receber participantes
- conectar sessões de jogo
- conter atores de campanha, tokens e fichas

Modelos relacionados:

- `Campaign`
- `Participant`
- `GameSession`
- `CampaignActor`
- `SceneToken`
- `CharacterSheet`

---

## 👥 Participantes

Status atual:

- criador da campanha entra como `GM`
- jogador entra como `PLAYER`
- owner/GM têm permissões específicas
- futuro: status de pedido de entrada mais robusto

Regras importantes:

- usuário não deve entrar duas vezes na mesma campanha
- owner não deve ser removido da própria campanha
- permissões críticas devem ficar no backend/banco

---

## 🎭 CampaignActor

Uso atual:

- representa entidade/personagem/NPC/criatura dentro da campanha
- pode estar na mesa ou biblioteca
- substituiu parte do mock da aba Personagens
- não é ainda a ficha completa do personagem

Regra arquitetural:

> `CampaignActor` é ator/entidade de campanha.  
> `CharacterSheet` é a ficha completa e vem na Fase 4.

---

## 🧱 Sistema RPG

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
- nomes de antecedentes foram adaptados para identidade própria
- conteúdos grandes como magias/equipamentos podem ir para seed inicialmente
- no futuro podem migrar para painel/admin/importadores

---

## 📄 CharacterSheet — Fase 4

Modelos relacionados:

- `CharacterSheet`
- `CharacterSheetStat`
- `CharacterSheetSkill`
- `CharacterSheetSpell`
- `CharacterSheetEquipment`

Estado atual:

- ficha pode ser criada como rascunho
- ficha pertence a campanha, sistema e owner
- campos conceituais persistem:
  - name
  - pronouns
  - concept
  - portraitUrl
  - tokenImageUrl
  - tokenImageFit
- relações persistem:
  - classId
  - ancestryId
  - backgroundId

Próximo passo:

```txt
Persistir atributos escolhidos no builder em CharacterSheetStat.
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

## Character Builder

- Conceito exige nome
- Classe exige classe escolhida
- Ancestralidade exige ancestralidade escolhida
- Antecedente exige antecedente escolhido
- Atributos devem ficar entre 3 e 20
- Salvamento deve aceitar rascunho incompleto sem quebrar

---

# 🧱 ARQUITETURA DE RESPONSABILIDADE

| Camada     | Responsabilidade |
|------------|------------------|
| DB         | integridade estrutural |
| SQL RULES  | regras críticas complexas futuras |
| Prisma     | acesso tipado |
| Backend    | lógica, permissões e validação |
| Frontend   | experiência e feedback visual |

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

## Fase 3 — Campanhas

- [x] Campaign
- [x] Participant
- [x] GameSession
- [x] rotas principais de campanha
- [x] join por invite code
- [x] participantes
- [x] início da página de jogo
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
- [x] atributos visuais/local
- [ ] persistir atributos no banco
- [ ] perícias
- [ ] magias
- [ ] equipamentos
- [ ] sobre
- [ ] revisão
- [ ] finalizar ficha

## Fase 5 — Regras avançadas

- [ ] Aplicar regras SQL avançadas
- [ ] Implementar triggers quando necessário
- [ ] Índices específicos para performance e integridade

---

# 📍 PRÓXIMO PASSO

```txt
4.15 — Persistir atributos no banco
```

Checklist esperado:

- [ ] frontend envia atributos no salvar rascunho
- [ ] backend valida atributos
- [ ] backend cria/atualiza `CharacterSheetStat`
- [ ] GET da ficha inclui stats salvos
- [ ] builder carrega atributos salvos
- [ ] resumo lateral reflete dados persistidos

---

# 📌 CHECKPOINT

✔ Auth funcionando  
✔ Prisma integrado  
✔ Banco funcional  
✔ Campanhas reais  
✔ Mesa em evolução  
✔ Sistema RPG base semeado  
✔ Builder iniciado  
✔ Próximo: atributos persistidos  
