# 🧠 DATABASE SETUP — LegendForge

> Atualizado para novo chat em 07/07/2026. Contexto consolidado após a sequência 4.6.6 — Idiomas por fonte.


## 📌 Status atual

Banco funcional com Prisma/PostgreSQL, Better Auth, campanhas, mesa, sistema RPG, fichas e relações avançadas.

Última expansão concluída: **4.6.6 — Idiomas por fonte**.

---

## ✅ Modelos principais implementados

### Auth

```txt
User
Session
Account
Verification
```

### Campanha e mesa

```txt
Campaign
Participant
GameSession
CampaignActor
SceneToken
```

### Sistema RPG

```txt
GameSystem
Stat
Skill
Language
Ancestry
Background
CharacterClass
CharacterSubclass
Feature
Spell
Equipment
LevelProgression
ClassSpell
```

### Ficha

```txt
CharacterSheet
CharacterSheetStat
CharacterSheetSkill
CharacterSheetSpell
CharacterSheetLanguage
CharacterSheetEquipment
CharacterSheetClass
```

---

## 🗣️ Idiomas — 4.6.6

### Novos/atualizados

```txt
Language
CharacterSheetLanguage
Ancestry.languageKeys
Background.languageKeys
Background.languageChoiceCount
GameSystem.languages
CharacterSheet.languages
```

### Language

Responsabilidade:

```txt
Cadastro de idiomas disponíveis por sistema.
```

Campos esperados:

```txt
id
systemId
key
name
description
order
createdAt
updatedAt
```

Regras:

```txt
@@unique([systemId, key])
@@unique([systemId, name])
```

### CharacterSheetLanguage

Responsabilidade:

```txt
Idiomas conhecidos por uma ficha, com fonte.
```

Campos esperados:

```txt
id
characterSheetId
languageId
source
createdAt
updatedAt
```

Regras:

```txt
@@unique([characterSheetId, languageId])
```

Fonte atual:

```txt
builder
```

Fontes previstas:

```txt
class
background
ancestry
feature
manual
```

---

## 🧩 Regras atuais de idioma

Automáticos:

```txt
Ancestry.languageKeys
Background.languageKeys
```

Escolhas extras:

```txt
CharacterSheetLanguage.source === "builder"
```

Quantidade:

```txt
Background.languageChoiceCount
```

Validação de finalização:

```txt
- deve ter exatamente a quantidade exigida de escolhas extras
- não pode repetir idioma extra
- não pode escolher como extra um idioma automático
```

---

## ⚔️ Equipamentos — estado antes da próxima micro

`Equipment` já possui campos estruturados para ataque:

```txt
damageFormula
damageType
attackType
attackAbilityKey
alternativeAbilityKey
weaponGroup
normalRange
longRange
isFinesse
isThrown
isTwoHanded
isVersatile
versatileDamageFormula
attackBonus
damageBonus
imageUrl
```

A ficha pronta calcula ataque real por equipamento, mas ainda há pendência:

```txt
Proficiência de equipamento ainda precisa ser aplicada por fonte real.
```

Próxima micro recomendada:

```txt
4.6.7 — Proficiências de equipamento por fonte
```

---

## 🧍 CharacterSheet — estado

`CharacterSheet` guarda:

```txt
campanha
sistema
owner
ator vinculado
classe principal legacy
ancestralidade
antecedente
nível total
status
dados narrativos
PV/CA/status
imagens
```

Relacionamentos usados pela ficha pronta:

```txt
stats
skills
spells
languages
equipment
classes
features calculadas no backend
levelUpPreview calculado no backend
```

---

## 🪄 Magia/progressão

Já implementado:

```txt
CharacterClass.spellcastingAbilityKey
LevelProgression
ClassSpell
CharacterSheetSpell
```

A ficha pronta usa:

```txt
CD = 8 + proficiência + modificador de conjuração
Ataque mágico = proficiência + modificador de conjuração
Slots = LevelProgression da classe conjuradora ativa
```

---

## ⬆️ Multiclasse / Level Up

Já implementado como fundação:

```txt
CharacterSheet.level = nível total
CharacterSheetClass.level = nível por classe
```

Ainda futuro:

```txt
- level up real completo
- adicionar nova classe
- escolhas de subclasse no level up
- ASI/talentos
- PV por classe no level up
```

---

## ❌ Futuro do banco

Ainda não implementado:

```txt
ChatMessage persistido
RollLog persistido
Scene real/múltiplas cenas
Fog persistida por cena
Drawing persistido
NPC sheet
Creature sheet / bestiary
Spell slot usage
Conditions/effects
Inventory transactions/shops
File uploads
```

