# 🧠 DATABASE SETUP — LegendForge

> Atualizado para novo chat em 16/07/2026. Contexto consolidado após a macro **4.7.7 — Magias iniciais por classe/nível**.

## 📌 Status atual

Banco funcional com Prisma/PostgreSQL, Better Auth, campanhas, mesa, sistema RPG, fichas e relações avançadas.

Última expansão concluída: **4.7.7 — Magias iniciais por classe/nível**.

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
LevelProgressionSpellLimit
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

## 🪄 Magias — estado pós 4.7.7

### Novos/atualizados

```txt
LevelProgressionSpellLimit
LevelProgression.spellLimits
CharacterSheetSpell.classId
CharacterClass.characterSheetSpells
```

### LevelProgressionSpellLimit

Responsabilidade:

```txt
Define quantas magias conhecidas/preparadas uma classe recebe por nível de magia em cada nível de classe.
```

Campos esperados:

```txt
id
levelProgressionId
spellLevel
spellsKnown
spellsPrepared
createdAt
updatedAt
```

Regras:

```txt
@@unique([levelProgressionId, spellLevel])
@@index([levelProgressionId])
@@index([spellLevel])
```

Interpretação:

```txt
spellLevel 0 = truques
spellsKnown = limite usado no builder
spellsPrepared = limite futuro para preparação da ficha
```

### CharacterSheetSpell

Responsabilidade:

```txt
Magias realmente conhecidas/registradas pela ficha.
```

Campos relevantes:

```txt
characterSheetId
spellId
classId
source
isPrepared
isAlwaysPrepared
uses
maxUses
notes
```

`classId` é origem interna da magia para cálculo futuro de:

```txt
atributo de conjuração
CD
ataque mágico
regras por classe
```

Não deve poluir visualmente o card de magia.

Fontes previstas:

```txt
class
ancestry
background
feature
manual
GM/futuro
```

Observação:

```txt
Magias concedidas pelo mestre não contam nos limites de builder/level up.
```

---

## 🗣️ Idiomas — estado

### Modelos

```txt
Language
CharacterSheetLanguage
Ancestry.languageKeys
Background.languageKeys
Background.languageChoiceCount
GameSystem.languages
CharacterSheet.languages
```

### Regras atuais

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

## 🧩 Regras atuais de multiclasse

```txt
CharacterSheet.level = nível total
CharacterSheetClass.level = nível por classe
CharacterSheetClass.isPrimary = classe principal/identidade/fallback
```

Classe principal não deve ser fonte única de regra mecânica quando existir `CharacterSheetClass`.

Regras reais devem preferir:

```txt
CharacterSheet.classes
CharacterSheetClass.classId
CharacterSheetClass.level
```

---

## ⚔️ Equipamentos — estado

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

A ficha pronta calcula ataque por equipamento usando proficiências efetivas das classes.

Proteções/armaduras já estão preparadas para CA real futura, mas a CA final ainda permanece manual/preview.

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

## 🔮 Futuro do banco

Ainda não implementado:

```txt
SubAncestry/SubAncestralidade
ChatMessage persistido
RollLog persistido
Scene real/múltiplas cenas
Fog persistida por cena
Drawing persistido
NPC sheet
Creature sheet / bestiary
Spell slot usage
Prepared spell state avançado
Conditions/effects
Inventory transactions/shops
File uploads
```
