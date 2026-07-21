# 🧭 LegendForge — Fases Canônicas

> Atualizado em 18/07/2026.  
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
[x] Fase 1 — Mesa com atores reais
[x] Fase 2 — Tokens reais na cena
[x] Fase 3 — Sistema base/Seeds

[em finalização] Fase 4 — Criação/Ficha de personagem
[em finalização] Fase 4.5 — Polimentos finais e fundação de progressão
[concluída funcionalmente] Fase 4.6 — Regras avançadas da criação de ficha
[em andamento] Fase 4.7 — Multiclasse e Level Up real
[planejada] Fase 4.8 — Sub-ancestralidades e variações de origem

[ ] Fase 5 — Biblioteca completa
[ ] Fase 6 — Diário real
[ ] Fase 7 — Configurações da campanha/mesa
[ ] Fase 8 — Sincronização em tempo real
[ ] Fase 9 — Combate e iniciativa
[ ] Fase 10 — Cenas/mapas múltiplos
[ ] Fase 11 — Bestiário completo
[ ] Fase 12 — Inventário, lojas e economia
[ ] Fase 13 — Sistema de efeitos/status
[ ] Fase 14 — Permissões avançadas e moderação
[ ] Fase 15 — Deploy/produção
[ ] Fase 16 — Polimento de portfólio/produto
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
[concluída funcionalmente] Fase 4.6 — Regras avançadas da criação de ficha
[em andamento] Fase 4.7 — Multiclasse e Level Up real
[planejada] Fase 4.8 — Sub-ancestralidades e variações de origem
```

---

# 3. Fase 4.5 — Polimentos finais e fundação de progressão

## Micros concluídas

```txt
[x] 4.5.1 — Polimento rápido da mesa, chat e grid
[x] 4.5.2 — Ciclo ator/token
[x] 4.5.3 — Tamanho automático de token e limpeza do seletor
[x] 4.5.4 — Linguagem, unidades e identidade do sistema
[x] 4.5.5 — Magias novas e conteúdo imediato
[x] 4.5.6 — Rolagens avançadas
[x] 4.5.7 — Fundação inicial de Level Up
```

---

# 4. Fase 4.6 — Regras avançadas da criação de ficha

```txt
[x] 4.6.1 — Bloquear magias acima do nível permitido na criação
[x] 4.6.2 — Corrigir criação da ficha com PV inicial vindo da classe
[x] 4.6.3 — Builder/review/magias respeitam nível inicial real
[x] 4.6.4 — Atributos por fonte
[x] 4.6.5 — Proficiências por fonte
[x] 4.6.6 — Línguas por fonte
[x] 4.6.7 — Magias/truques por fonte
[x] 4.6.8 — Melhorar notas da criação de ficha
```

---

# 5. Fase 4.7 — Multiclasse e Level Up real

Objetivo: transformar criação e progressão em fluxo real, não apenas “somar nível”.

```txt
[x] 4.7.1 — Modelar draft de classes múltiplas no builder
    [x] 4.7.1.1 — Criar CharacterBuilderClassDraftEntry
    [x] 4.7.1.2 — Adicionar classEntries ao CharacterBuilderDraft
    [x] 4.7.1.3 — Manter classId/className como compatibilidade
    [x] 4.7.1.4 — Sincronizar classe única atual com classEntries
    [x] 4.7.1.5 — Sincronizar nível inicial com nível da classe principal
    [x] 4.7.1.6 — Corrigir atualização em lote do draft para não perder classEntries

[x] 4.7.2 — Tela de distribuição de níveis por classe
    [x] 4.7.2.1 — Mostrar distribuição no resumo lateral
    [x] 4.7.2.2 — Mostrar distribuição na etapa Classe
    [x] 4.7.2.3 — Preparar botão “Adicionar classe em breve” desabilitado
    [x] 4.7.2.4 — Permitir editar nível da classe principal pela tela de Classe
    [x] 4.7.2.5 — Validar visualmente soma dos níveis da distribuição

[x] 4.7.3 — Definir classe principal
    [x] 4.7.3.1 — Exibir badge “Classe principal” de forma mais clara
    [x] 4.7.3.2 — Preparar função setPrimaryClassEntry
    [x] 4.7.3.3 — Manter classId/className sincronizados com a classe principal
    [x] 4.7.3.4 — Travar troca de principal quando houver apenas uma classe

[x] 4.7.4 — Criação inicial multiclasse
    [x] 4.7.4.1 — Habilitar adicionar segunda classe no draft
    [x] 4.7.4.2 — Impedir classe duplicada
    [x] 4.7.4.3 — Permitir remover classe adicional
    [x] 4.7.4.4 — Ajustar nível total como soma das classes
    [x] 4.7.4.5 — Backend recebe classEntries opcional
    [x] 4.7.4.6 — Backend cria CharacterSheetClass para cada classe
    [x] 4.7.4.7 — Manter fallback classId/className para classe principal

[x] 4.7.5 — Calcular PV inicial multiclasse
    [x] 4.7.5.1 — Definir regra final de PV multiclasse do LegendForge
    [x] 4.7.5.2 — Calcular PV por classe no backend
    [x] 4.7.5.3 — Aplicar CON por nível
    [x] 4.7.5.4 — Atualizar maxHitPoints/hitPoints inicial
    [x] 4.7.5.5 — Mostrar resumo de PV no Review

[x] 4.7.6 — Features iniciais por classe/nível
    [x] 4.7.6.1 — Buscar features por cada CharacterSheetClass
    [x] 4.7.6.2 — Incluir features até o nível daquela classe
    [x] 4.7.6.3 — Incluir features de subclasse quando houver
    [x] 4.7.6.4 — Ajustar aba Features da ficha pronta para múltiplas classes

[x] 4.7.7 — Magias iniciais por classe/nível
    [x] 4.7.7.0 — Modelar limites de magia por nível
    [x] 4.7.7.1 — União final das permissões de magia por classe no builder
    [x] 4.7.7.2 — Backend valida magia contra múltiplas classes
    [x] 4.7.7.3 — Backend salva e retorna classId/source da magia
    [x] 4.7.7.4 — Frontend types recebem origem interna da magia
    [x] 4.7.7.5 — Bloco de conjuração por classe na ficha pronta

[em andamento] 4.7.8 — Escolhas pendentes iniciais
    [x] 4.7.8.1 — Mapear escolhas pendentes possíveis
    [x] 4.7.8.2 — Subclasse pendente
        [x] 4.7.8.2.1 — Expor subclasses dentro de cada classe
        [x] 4.7.8.2.2 — Permitir escolher subclasse por classEntry
        [x] 4.7.8.2.3 — Mostrar pendência no Review
        [x] 4.7.8.2.4 — Bloquear finalização com subclasse obrigatória faltando

    [x] 4.7.8.3 — Corrigir fluxo de entrada e persistência do builder
        [x] 4.7.8.3.1 — Separar “Novo personagem” de “Continuar rascunho”
        [x] 4.7.8.3.2 — Novo personagem sempre inicia com draft vazio
        [x] 4.7.8.3.3 — Continuar carrega somente ficha com status DRAFT
        [x] 4.7.8.3.4 — Finalizar ficha sem exigir salvamento prévio
        [x] 4.7.8.3.5 — Atualizar rascunho automaticamente antes de finalizar
        [x] 4.7.8.3.6 — Limpar estado local do builder após finalizar
        [x] 4.7.8.3.7 — Garantir que ficha READY nunca reabra como rascunho
        [x] 4.7.8.3.8 — Testar criação nova, continuação e finalização ponta a ponta

    [x] 4.7.8.4 — Magias/truques pendentes
        [x] 4.7.8.4.1 — Calcular limites exigidos por nível de magia
        [x] 4.7.8.4.2 — Comparar escolhas atuais com os limites
        [x] 4.7.8.4.3 — Exibir pendências na etapa Magias
        [x] 4.7.8.4.4 — Exibir pendências na Revisão
        [x] 4.7.8.4.5 — Bloquear avanço/finalização no frontend
        [x] 4.7.8.4.6 — Validar pendências no backend
        [x] 4.7.8.4.7 — Testar classe única e multiclasse

    [x] 4.7.8.5 — Features pendentes
        [x] 4.7.8.5.1 — Auditar modelagem atual de Feature
        [x] 4.7.8.5.2 — Definir features automáticas versus escolhas
        [x] 4.7.8.5.3 — Criar modelagem Prisma dos grupos de escolha
        [x] 4.7.8.5.4 — Criar migration e seed inicial
        [x] 4.7.8.5.5 — Expor grupos no character-options
        [x] 4.7.8.5.6 — Adicionar escolhas ao draft e persistência
        [x] 4.7.8.5.7 — Criar CharacterFeaturesStep
        [x] 4.7.8.5.8 — Exibir pendências de features na Revisão
        [x] 4.7.8.5.9 — Bloquear avanço e finalização no frontend
        [x] 4.7.8.5.10 — Validar escolhas obrigatórias de features no backend
        [x] 4.7.8.5.11 — Testar classe única, classe sem grupo e multiclasse

    [em andamento] 4.7.8.6 — Refatoração estrutural do CharacterBuilderModal
        [x] 4.7.8.6.1 — Auditar dependências do modal e definir fronteiras
        [x] 4.7.8.6.2 — Extrair helpers puros de linguagem e gênero
        [x] 4.7.8.6.3 — Extrair validações e cálculos do builder
        [x] 4.7.8.6.4 — Extrair componentes auxiliares usados apenas pelo modal
        [x] 4.7.8.6.5 — Criar CharacterBuilderModal.tsx
        [ ] 4.7.8.6.6 — Substituir implementação local pelo import
        [ ] 4.7.8.6.7 — Limpar imports e código morto do page.tsx
        [ ] 4.7.8.6.8 — Teste completo de regressão

    [ ] 4.7.8.7 — Atributos/talentos futuramente

[ ] 4.7.9 — Refatorar preview de Level Up para usar CharacterSheetClass escolhida
[ ] 4.7.10 — Criar plano de mudanças do Level Up
[ ] 4.7.11 — Tela de resumo das mudanças do Level Up
[ ] 4.7.12 — Telas de escolhas pendentes do Level Up
[ ] 4.7.13 — Aplicar mudanças reais na ficha ao confirmar
[ ] 4.7.14 — Mestre libera/bloqueia Level Up
[ ] 4.7.15 — Jogador vê Level Up apenas quando liberado
[ ] 4.7.16 — Jogador confirma Level Up liberado
[ ] 4.7.17 — Feedback no chat após Level Up
```

---

# 5.5. Fase 4.8 — Sub-ancestralidades e variações de origem

Objetivo: criar sub-ancestralidades/sub-raças vinculadas à ancestralidade principal.

```txt
[ ] Fase 4.8 — Sub-ancestralidades e variações de origem
    [ ] 4.8.1 — Modelar SubAncestry no Prisma
    [ ] 4.8.2 — Seed inicial de sub-ancestralidades
    [ ] 4.8.3 — Expor sub-ancestralidades no /character-options
    [ ] 4.8.4 — Builder: escolher sub-ancestralidade após ancestralidade
    [ ] 4.8.5 — Aplicar traços/bônus/idiomas da sub-ancestralidade
    [ ] 4.8.6 — Review e ficha pronta exibem sub-ancestralidade
```

Exemplo:

```txt
Sylvaris → Sylvaris Alto
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
4.7.8.6.1 — Auditar dependências do modal e definir fronteiras
```

Objetivo:

```txt
- mapear tudo que o CharacterBuilderModal usa hoje dentro de page.tsx
- separar dependências em lógica reutilizável, componentes do builder e integração com a mesa
- manter page.tsx responsável por estado externo, carregamento, salvamento e finalização
- preparar a extração progressiva sem alterar comportamento
```

Fronteira planejada:

```txt
Permanece em page.tsx
→ abrir/fechar o builder
→ carregar character-options
→ criar/retomar rascunho
→ salvar/finalizar
→ atualizar fichas, atores e estado da campanha

Será movido para features/character-builder
→ layout e navegação do modal
→ renderização das etapas
→ validações visuais
→ resumo lateral
→ distribuição de níveis
→ mensagens de pendência
→ helpers e componentes exclusivos do builder
```

Arquivos prováveis:

```txt
frontend/src/app/campaigns/[id]/play/page.tsx
frontend/src/features/character-builder/components/CharacterBuilderModal.tsx
frontend/src/features/character-builder/types/character-builder-types.ts
frontend/src/features/character-builder/utils/builder-gender.ts
frontend/src/features/character-builder/utils/builder-validation.ts
```

---

# 19. Nota de verdade canônica

Este arquivo substitui listas antigas e resumidas de fases do LegendForge.

Quando houver conflito entre este documento e resumos anteriores, este documento vence.