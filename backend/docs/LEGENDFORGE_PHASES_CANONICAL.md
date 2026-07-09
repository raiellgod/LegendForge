# 🧭 LegendForge — Fases Canônicas

> Atualizado em 07/07/2026.  
> Este documento deve ser tratado como **fonte de verdade absoluta** para o planejamento de fases macro e micros do LegendForge até o usuário substituir ou revisar esta lista.

---

## Regras de condução do projeto

- Responder em português.
- Atuar como pair-programmer + professor.
- Trabalhar em passos pequenos, funcionais e testáveis.
- Em mudanças pequenas, usar formato **Procure / Troque**.
- Em mudanças grandes, entregar arquivo inteiro baseado na versão atual enviada pelo usuário.
- Não presumir estrutura antiga de arquivos grandes.
- Antes de qualquer commit, sempre rodar/pedir:

```bash
git diff --stat
git status
```

- Comandos de lint atuais:

```bash
cd backend
pnpm eslint

cd ../frontend
pnpm lint
```

---

# 1. Fases macro canônicas

```txt
[x] Fase 0 — Base inicial
    Auth, estrutura inicial do monorepo, campanhas básicas, mesa mock, páginas principais e fundação visual.

[x] Fase 1 — Mesa com atores reais
    CampaignActor persistido, atores de campanha, painel de personagens, biblioteca/mesa inicial e ações básicas.

[x] Fase 2 — Tokens reais na cena
    SceneToken persistido, criação de tokens, mover/remover tokens, posição salva e relação ator/token.

[x] Fase 3 — Sistema base/Seeds
    Sistema base, atributos, perícias, classes, subclasses, ancestrais, antecedentes, magias, equipamentos e seeds iniciais.

[em finalização] Fase 4 — Criação/Ficha de personagem
    Builder de personagem, ficha pronta, rolagens automáticas, equipamentos, magias, features, imagens, pop-out e fundação de Level Up.

[em finalização] Fase 4.5 — Polimentos finais e fundação de progressão
    Polimentos de mesa, chat, grid, ciclo ator/token, rolagens avançadas e fundação inicial de Level Up.

[em andamento] Fase 4.6 — Regras avançadas da criação de ficha
    Validações reais de criação: magias por nível permitido, PV inicial, atributos por fonte, proficiências por fonte, línguas, magias por fonte e notas avançadas.

[planejada] Fase 4.7 — Multiclasse e Level Up real
    Criação inicial multiclasse, distribuição de níveis por classe, Level Up por classe, mudanças reais na ficha, escolhas pendentes e liberação para jogador.

[ ] Fase 5 — Biblioteca completa
    Biblioteca real de sistema/campanha, itens, magias, templates, NPCs, criaturas, organização e envio para mesa.

[ ] Fase 6 — Diário real
    Anotações, handouts, diário da campanha, entradas públicas/privadas e ligação com cenas/personagens.

[ ] Fase 7 — Configurações da campanha/mesa
    Configurações avançadas de campanha, permissões, grid, escala, sistema, regras e preferências da mesa.

[ ] Fase 8 — Sincronização em tempo real
    Chat, rolagens, tokens, mapa, ferramentas, presença e atualizações entre usuários.

[ ] Fase 9 — Combate e iniciativa
    Turnos reais, ordem de iniciativa, condições, ações, alvos e fluxo de combate.

[ ] Fase 10 — Cenas/mapas múltiplos
    Múltiplas cenas por campanha, troca de cena, mapas, tokens por cena e navegação do mestre.

[ ] Fase 11 — Bestiário completo
    Criaturas com bloco próprio, ataques, habilidades, resistências, sentidos, tamanho, recompensas e uso em combate.

[ ] Fase 12 — Inventário, lojas e economia
    Inventário avançado, lojas, compras, vendas, moedas, peso, recipientes e disponibilidade por campanha.

[ ] Fase 13 — Sistema de efeitos/status
    Condições, buffs/debuffs, efeitos temporários, duração, origem e impacto mecânico.

[ ] Fase 14 — Permissões avançadas e moderação
    Controle fino por player/GM/owner, visibilidade, expulsão, aprovação e segurança da mesa.

[ ] Fase 15 — Deploy/produção
    Preparar ambiente real, variáveis, banco, build, hospedagem, domínio e testes de produção.

[ ] Fase 16 — Polimento de portfólio/produto
    README final, prints, vídeo, landing, seed demo, UX polish e apresentação profissional.
```

---

# 2. Fase 4 — Estado macro atual

```txt
[x] Fase 4.15 — Atributos
[x] Fase 4.16 — Perícias
[x] Fase 4.17 — Magias
[x] Fase 4.18 — Equipamentos
[x] Fase 4.19 — Sobre
[x] Fase 4.21 — Refatoração do builder
[x] Fase 4.22 — Revisões do builder
[x] Fase 4.23 — Mesa refatorada
[x] Fase 4.24 — Personagens ativos, biblioteca e ciclo de vida
[x] Fase 4.25 — Ficha pronta com abas
[x] Fase 4.26 — Rolagens automáticas pela ficha pronta
[x] Fase 4.27 — Regras avançadas iniciais
[x] Fase 4.28 — Preparação estrutural para ficha/pop-out
[x] Fase 4.29 — Ataques, magias, equipamentos e ficha pronta avançada
[x] Fase 4.30 — Documentação/checkpoint anterior
[x] Fase 4.31 — Modularização/seed-content e imagens de equipamento
[em finalização] Fase 4.5 — Polimentos finais e fundação de progressão
[em andamento] Fase 4.6 — Regras avançadas da criação de ficha
[planejada] Fase 4.7 — Multiclasse e Level Up real
```

---

# 3. Fase 4.5 — Polimentos finais e fundação de progressão

## Micros concluídas

```txt
[x] 4.5.1 — Polimento rápido da mesa, chat e grid
    - zoom padrão ajustado
    - limpeza visual da mesa
    - botão de limpar chat
    - token não fica opaco ao trocar ferramenta
    - bloqueio correto de movimento fora da ferramenta Selecionar
    - ajustes no painel de configurações

[x] 4.5.2 — Ciclo ator/token
    - devolver ator para biblioteca remove tokens da cena
    - limpeza local dos tokens
    - regra mais segura para biblioteca/mesa

[x] 4.5.3 — Tamanho automático de token e limpeza do seletor
    - token novo entra 1x1 por padrão
    - descrições simplificadas de tamanho
    - textos do modal de ação do ator mais limpos

[x] 4.5.4 — Linguagem, unidades e identidade do sistema
    - altura exibida em metros
    - peso em kg
    - termos de armor/proteção ajustados
    - identidade do sistema atualizada para 5e Homebrew — Ecos da Ruína

[x] 4.5.5 — Magias novas e conteúdo imediato
    - Bola de Fogo
    - Esfera de Putrefação
    - vínculos com classes conjuradoras

[x] 4.5.6 — Rolagens avançadas
    [x] 4.5.6.1 — Regra de saldo vantagem/desvantagem
    [x] 4.5.6.2 — Aplicar maior Xd6 ao d20
    [x] 4.5.6.3 — Mostrar breakdown no chat
    [x] 4.5.6.4 — Controles na UI de rolagem manual
    [x] 4.5.6.5 — Integrar vantagem/desvantagem nas rolagens da ficha
    [x] 4.5.6.6 — Zerar vantagens/desvantagens depois da rolagem
    [x] 4.5.6.7 — Teste de morte com uma rolagem

[x] 4.5.7 — Fundação inicial de Level Up
    [x] 4.5.7.1 — Permitir personagem de one-shot acima do nível 1
    [x] 4.5.7.2 — Persistir nível inicial e sincronizar classe principal
    [x] 4.5.7.3 — Level Up liberado pelo mestre, sem XP visível para jogador
    [x] 4.5.7.4 — Preparar API/service para confirmar Level Up
    [x] 4.5.7.5 — Ligar botão Confirmar Level Up no modal e atualizar ficha
    [x] 4.5.7.6 — Testar Level Up real do mestre
    [x] 4.5.7.7 — Campo levelUpAvailable persistido
```

## Pendências planejadas

Estas pendências não devem ser tratadas como bugs esquecidos. Elas são evolução planejada.

```txt
[PENDENTE PLANEJADO] Bloquear magias acima do nível permitido
[PENDENTE PLANEJADO] PV inicial vindo da classe
[PENDENTE PLANEJADO] Builder respeitar nível inicial real em magias/revisão
[PENDENTE PLANEJADO] Criação inicial multiclasse
[PENDENTE PLANEJADO] Level Up com mudanças reais na ficha
[PENDENTE PLANEJADO] Mestre liberar Level Up para jogador confirmar
[PENDENTE PLANEJADO] Atributos por ancestralidade/antecedente
[PENDENTE PLANEJADO] Proficiências por fonte
[PENDENTE PLANEJADO] Línguas por fonte
[PENDENTE PLANEJADO] Magias/truques por classe, ancestralidade, antecedente e feature
[PENDENTE PLANEJADO] Notas avançadas da ficha
```

---

# 4. Fase 4.6 — Regras avançadas da criação de ficha

Objetivo: deixar a criação de personagem mais correta mecanicamente antes de avançar para multiclasse e Level Up real.

```txt
[x] 4.6.1 — Bloquear magias acima do nível permitido na criação
    - personagem nível 1 não pode escolher magia nível 3
    - frontend não mostra opções inválidas
    - backend rejeita envio manual inválido
    - validação usa classe, nível da classe, progressão e slots disponíveis

[x] 4.6.2 — Corrigir criação da ficha com PV inicial vindo da classe
    - usar hitDie da classe
    - usar modificador de Constituição
    - nível 1 usa dado cheio
    - níveis acima de 1 usam média fixa inicialmente
    - hitPoints nasce igual maxHitPoints

[x] 4.6.3 — Builder/review/magias respeitam nível inicial real
    - revisão mostra draft.level
    - etapa de magias usa draft.level
    - limites de truques/magias usam progressão do nível escolhido
    - personagem one-shot nível 5 não é tratado como nível 1

[x] 4.6.4 — Atributos por fonte
    - bônus de ancestralidade
    - bônus de antecedente, se o sistema permitir
    - fonte do bônus salva/discriminada
    - revisão mostra de onde veio cada aumento

[em consolidação] 4.6.5 — Proficiências por fonte
    [x] perícias por classe
    [x] perícias por antecedente como sugestão/estrutura
    [x] classes possuem weaponProficiencyKeys
    [x] classes possuem protectionProficiencyKeys
    [x] classes possuem toolProficiencyKeys
    [ ] ataque de equipamento usa proficiência real
    [ ] ficha mostra fonte da proficiência de equipamento
    [ ] proteções/armaduras são preparadas para CA real
    [ ] ferramentas/instrumentos/kits são preparados para uso mecânico futuro

[x] 4.6.6 — Línguas por fonte
    - línguas conhecidas fixas
    - escolhas de línguas por ancestralidade
    - escolhas de línguas por antecedente
    - escolhas futuras por feature/talento

[ ] 4.6.7 — Magias/truques por fonte
    - classe
    - ancestralidade
    - antecedente
    - talento/feature
    - separar magia conhecida, preparada, sempre conhecida e magia extra

[ ] 4.6.8 — Melhorar notas da criação de ficha
    - organizações
    - aliados
    - inimigos
    - backstory
    - outros
    - vínculos
    - defeitos
    - ideais
    - traços de personalidade
    - notas do mestre
```

## Fluxo imediato aprovado

A próxima sequência **não** deve ser chamada de `4.6.7 — Proficiências de equipamento por fonte`, porque `4.6.7` fica reservado para **Magias/truques por fonte**.

A consolidação de proficiências de equipamento deve ser tratada como retomada da `4.6.5`:

```txt
[próximo] 4.6.5.R1 — Revisar estado atual de proficiências de equipamento
[ ] 4.6.5.R2 — Resolver proficiências efetivas de equipamento
[ ] 4.6.5.R3 — Ataque de equipamento usa proficiência real
[ ] 4.6.5.R4 — Exibir fonte da proficiência na ficha/review
[ ] 4.6.5.R5 — Preparar proteções/armaduras para CA real
```

Depois disso, avançar para:

```txt
[ ] 4.6.7 — Magias/truques por fonte
```

---

# 5. Fase 4.7 — Multiclasse e Level Up real

Objetivo: transformar criação e progressão em fluxo real, não apenas “somar nível”.

```txt
[ ] 4.7.1 — Modelar draft de classes múltiplas no builder
    - substituir classe única por lista de classes
    - manter compatibilidade com classe principal

[ ] 4.7.2 — Tela de distribuição de níveis por classe
    - nível total
    - classe A nível X
    - classe B nível Y
    - soma das classes precisa bater com nível total

[ ] 4.7.3 — Definir classe principal
    - usada para identidade visual
    - usada como fallback de ficha
    - não apaga as outras classes

[ ] 4.7.4 — Criação inicial multiclasse
    - personagem pode nascer Bardo 3 / Necromante 2
    - CharacterSheetClass criado para cada classe
    - nível total = soma das classes

[ ] 4.7.5 — Calcular PV inicial multiclasse
    - nível 1 da primeira classe usa dado cheio
    - níveis seguintes usam regra fixa/média
    - CON aplicado por nível
    - soma por classe

[ ] 4.7.6 — Features iniciais por classe/nível
    - features de Bardo até nível 3
    - features de Necromante até nível 2
    - features de subclasse quando houver

[ ] 4.7.7 — Magias iniciais por classe/nível
    - cada classe calcula suas permissões
    - evitar magia de nível inválido
    - separar magias de fontes diferentes

[ ] 4.7.8 — Escolhas pendentes iniciais
    - subclasse
    - novas magias
    - truques
    - proficiências
    - línguas
    - atributos/talentos futuramente

[ ] 4.7.9 — Refatorar preview de Level Up para usar CharacterSheetClass escolhida
    - nível total atual
    - nível atual da classe escolhida
    - próximo nível da classe escolhida
    - próxima progressão daquela classe

[ ] 4.7.10 — Criar plano de mudanças do Level Up
    - PV
    - proficiência
    - features
    - magias/truques
    - slots
    - subclasse
    - escolhas pendentes

[ ] 4.7.11 — Tela de resumo das mudanças do Level Up
    - “Bardo 2 → 3”
    - “Nível total 4 → 5”
    - “PV +7”
    - “Nova feature”
    - “Escolha de subclasse liberada”

[ ] 4.7.12 — Telas de escolhas pendentes do Level Up
    - escolher subclasse
    - escolher magias
    - escolher truques
    - escolher proficiência
    - escolher idioma
    - escolher atributo/talento futuramente

[ ] 4.7.13 — Aplicar mudanças reais na ficha ao confirmar
    - aumenta CharacterSheet.level
    - aumenta CharacterSheetClass.level
    - recalcula PV
    - salva escolhas
    - limpa levelUpAvailable

[ ] 4.7.14 — Mestre libera/bloqueia Level Up
    - botão visível para GM
    - muda levelUpAvailable

[ ] 4.7.15 — Jogador vê Level Up apenas quando liberado
    - sem XP visível
    - botão aparece apenas para ficha própria liberada

[ ] 4.7.16 — Jogador confirma Level Up liberado
    - usa fluxo real
    - resolve escolhas pendentes
    - aplica mudanças

[ ] 4.7.17 — Feedback no chat após Level Up
    - mensagem pública ou do sistema
    - resumo do avanço
```

---

# 6. Fase 5 — Biblioteca completa

```txt
[ ] 5.1 — Biblioteca real da campanha
[ ] 5.2 — Biblioteca real do sistema
[ ] 5.3 — Organização por categorias
[ ] 5.4 — Itens na biblioteca
[ ] 5.5 — Magias na biblioteca
[ ] 5.6 — Templates de personagem/NPC/criatura
[ ] 5.7 — Biblioteca de NPCs
[ ] 5.8 — Biblioteca de criaturas
[ ] 5.9 — Enviar NPC/criatura da biblioteca para mesa
[ ] 5.10 — Editar instância da campanha sem alterar template original
```

---

# 7. Fase 6 — Diário real

```txt
[ ] 6.1 — Entradas de diário da campanha
[ ] 6.2 — Handouts
[ ] 6.3 — Notas públicas
[ ] 6.4 — Notas privadas do mestre
[ ] 6.5 — Associar diário a personagem
[ ] 6.6 — Associar diário a cena/mapa
[ ] 6.7 — Visibilidade por player/GM
```

---

# 8. Fase 7 — Configurações da campanha/mesa

```txt
[ ] 7.1 — Configurações gerais da campanha
[ ] 7.2 — Configurações de grid
[ ] 7.3 — Configuração de escala/distância
[ ] 7.4 — Configurações de permissões de mesa
[ ] 7.5 — Configurações de regras opcionais
[ ] 7.6 — Preferências visuais da mesa
```

---

# 9. Fase 8 — Sincronização em tempo real

```txt
[ ] 8.1 — Chat em tempo real
[ ] 8.2 — Rolagens em tempo real
[ ] 8.3 — Movimento de token em tempo real
[ ] 8.4 — Atualização de cena em tempo real
[ ] 8.5 — Presença de usuários
[ ] 8.6 — Ferramentas compartilhadas
[ ] 8.7 — Sincronização da ficha/pop-out
```

---

# 10. Fase 9 — Combate e iniciativa

```txt
[ ] 9.1 — Turn tracker real
[ ] 9.2 — Ordem de iniciativa persistida
[ ] 9.3 — Avançar turno
[ ] 9.4 — Rodadas
[ ] 9.5 — Ações no turno
[ ] 9.6 — Alvos
[ ] 9.7 — Aplicar dano/cura
[ ] 9.8 — Condições no combate
[ ] 9.9 — Integração com criaturas/NPCs
```

---

# 11. Fase 10 — Cenas/mapas múltiplos

```txt
[ ] 10.1 — Criar múltiplas cenas
[ ] 10.2 — Lista de cenas da campanha
[ ] 10.3 — Trocar cena ativa
[ ] 10.4 — Tokens por cena
[ ] 10.5 — Mapa/imagem por cena
[ ] 10.6 — Configuração de grid por cena
[ ] 10.7 — Névoa/desenhos/medidas por cena
```

---

# 12. Fase 11 — Bestiário completo

```txt
[ ] 11.1 — Modelagem de criatura do bestiário
[ ] 11.2 — Bloco de estatísticas de criatura
[ ] 11.3 — Ataques de criatura
[ ] 11.4 — Ações e habilidades
[ ] 11.5 — Magias de criatura
[ ] 11.6 — Resistências e imunidades
[ ] 11.7 — Sentidos, tamanho e deslocamento
[ ] 11.8 — Recompensas/loot
[ ] 11.9 — Criatura do bestiário para biblioteca da campanha
[ ] 11.10 — Ficha própria de criatura
[ ] 11.11 — Builder de criatura
```

---

# 13. Fase 12 — Inventário, lojas e economia

```txt
[ ] 12.1 — Inventário avançado
[ ] 12.2 — Peso/carga
[ ] 12.3 — Recipientes
[ ] 12.4 — Moedas
[ ] 12.5 — Lojas
[ ] 12.6 — Comprar/vender
[ ] 12.7 — Disponibilidade por campanha
[ ] 12.8 — Recompensas e saque
```

---

# 14. Fase 13 — Sistema de efeitos/status

```txt
[ ] 13.1 — Condições
[ ] 13.2 — Buffs/debuffs
[ ] 13.3 — Efeitos temporários
[ ] 13.4 — Duração por rodada/turno
[ ] 13.5 — Origem do efeito
[ ] 13.6 — Impacto mecânico em rolagens
[ ] 13.7 — Impacto em CA/defesa/PV/magia
```

---

# 15. Fase 14 — Permissões avançadas e moderação

```txt
[ ] 14.1 — Permissões finas por campanha
[ ] 14.2 — Permissões por cena
[ ] 14.3 — Permissões por ator/ficha
[ ] 14.4 — Aprovação/remoção de players
[ ] 14.5 — Expulsar/banir da campanha
[ ] 14.6 — Transferir ownership futuramente
[ ] 14.7 — Logs de ações administrativas
```

---

# 16. Fase 15 — Deploy/produção

```txt
[ ] 15.1 — Revisar variáveis de ambiente
[ ] 15.2 — Build frontend
[ ] 15.3 — Build backend
[ ] 15.4 — Banco em produção
[ ] 15.5 — Auth em produção
[ ] 15.6 — CORS/cookies/domínio
[ ] 15.7 — Deploy frontend
[ ] 15.8 — Deploy backend
[ ] 15.9 — Teste ponta a ponta em produção
```

---

# 17. Fase 16 — Polimento de portfólio/produto

```txt
[ ] 16.1 — README final
[ ] 16.2 — Prints do projeto
[ ] 16.3 — Vídeo curto de demonstração
[ ] 16.4 — Landing/demo
[ ] 16.5 — Seed demo bonita
[ ] 16.6 — Ajuste de UX final
[ ] 16.7 — Checklist de portfólio
[ ] 16.8 — Texto para LinkedIn/GitHub
```

---

# 18. Próximo passo obrigatório

A próxima micro de desenvolvimento é:

```txt
4.6.5.R1 — Revisar estado atual de proficiências de equipamento
```

Objetivo da `4.6.5.R1`:

```txt
- entender como weaponProficiencyKeys/protectionProficiencyKeys/toolProficiencyKeys estão modeladas no schema/seed/API/types
- entender como chegam ao frontend
- localizar onde o ataque de equipamento calcula proficiência temporária
- localizar onde a ficha mostra “Proficiência temporária: sim” ou equivalente
- decidir o menor caminho seguro para aplicar proficiência real por fonte
```

Arquivos prováveis:

```txt
backend/src/routes/character-sheets.ts
backend/src/routes/systems.ts
backend/prisma/schema.prisma
backend/prisma/seed-data/classes.ts
backend/prisma/seed-data/equipment.ts
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/utils/character-sheet-calculations.ts
frontend/src/features/character-builder/components/CharacterReadySheetView.tsx
frontend/src/features/character-builder/steps/CharacterReviewStep.tsx
```

---

# 19. Nota de verdade canônica

Este arquivo substitui listas antigas e resumidas de fases do LegendForge.

Quando houver conflito entre este documento e resumos anteriores, este documento vence.

