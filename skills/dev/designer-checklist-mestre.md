---
name: "designer-checklist-mestre"
description: "Checklist mestre de auditoria e execução de design de produto (UI/UX) operado por /designer-sites-senior e /designer-saas-senior. Fundação visual, design system, WCAG 2.2 AA, HIG/Material 3, Core Web Vitals, estados, formulários, dados, IA, billing e governança. Carregue este arquivo inteiro antes de auditar ou declarar tela pronta."
versao: "1.0"
---

# 🎨 CHECKLIST MESTRE DE DESIGN

> Operado por `/designer-sites-senior` (web) e `/designer-saas-senior` (mobile). **Não** é um 12º membro do time e **não** segura bastão.
> Identidade, marca e tokens continuam na skill do designer. Este arquivo é a **lei de auditoria e DoD**.

**Filtro de plataforma (obrigatório na triagem):**
- `/designer-sites-senior` — web é o eixo. HIG/Material e teclado iOS só se o site tiver PWA/mobile web material. Bloco 16 mobile nativo = parcial.
- `/designer-saas-senior` — RN/Expo, HIG e Material 3 são o eixo. Core Web Vitals de campo (LCP/INP/CLS web) viram **performance percebida nativa** (60fps, cold start, listas virtualizadas). Itens HTML/CSS/`clamp()`/Storybook web = parcial ou N/A justificado.

**Regra de ouro:** todo apontamento responde a três perguntas: *qual critério foi violado*, *qual o impacto no usuário ou no negócio* e *qual a correção concreta*. Apontamento sem essas três partes não entra no relatório.

---

## 2. REGRA ZERO — CONTEXTO ANTES DE CRÍTICA

Nunca avalie uma tela sem antes estabelecer o contexto. Se as informações abaixo não estiverem disponíveis, **pergunte antes de auditar** (máximo de uma rodada de perguntas, agrupadas):

| # | Variável de contexto | Por que muda a avaliação |
|---|---|---|
| C1 | Produto e job-to-be-done da tela | Define o que é sucesso; uma tela pode ter só um objetivo primário |
| C2 | Público (idade, nível técnico, frequência de uso, contexto de uso) | Público infantil, idoso ou operador diário exigem densidades e linguagens diferentes |
| C3 | Plataforma (web responsiva, PWA, iOS, Android, desktop app, TV) | Padrão de navegação, alvo de toque e gestos mudam por plataforma |
| C4 | Tipo de usuário na tela (end user, admin, super-admin, tenant owner) | Painéis internos toleram densidade alta; produto final não |
| C5 | Restrições de marca (identidade existente, white-label, tokens de tenant) | Determina o que é livre e o que é imutável |
| C6 | Maturidade (protótipo, MVP, produto em produção, refactor) | Muda o corte de severidade que bloqueia entrega |
| C7 | Stack de UI (biblioteca de componentes, framework de estilo) | Determina se a correção é token, componente ou tela |
| C8 | Métrica que o time quer mover (ativação, conversão, retenção, ticket de suporte) | Prioriza os blocos do checklist |

**Se o contexto for insuficiente e o usuário não responder:** assuma explicitamente, escreva as premissas no topo do relatório e siga.

---

## 3. ETAPA DE TRIAGEM — O QUE AVALIAR E O QUE IGNORAR

Antes de rodar o checklist, produza uma **tabela de triagem** classificando cada bloco (01–30) em:

- ✅ **Aplicável** — será auditado
- ⚠️ **Parcial** — só alguns itens fazem sentido (liste quais e por quê)
- ⛔ **Fora de escopo** — justifique em uma linha (ex.: *"Bloco 27 Billing: sistema não tem cobrança"*)

Auditar item que não se aplica gera ruído e derruba a confiança no relatório. **Triagem sem justificativa é erro de processo.**

---

## 4. ESCALA DE SEVERIDADE

| Nível | Nome | Critério objetivo | Ação |
|---|---|---|---|
| **P0** | Bloqueador | Impede a tarefa, exclui usuário (falha WCAG A/AA), quebra em viewport comum, perde dado do usuário, ou induz erro irreversível | Bloqueia release |
| **P1** | Crítico | Aumenta muito o esforço/erro, quebra consistência do design system, viola padrão de plataforma, degrada CWV além do limite | Corrigir antes do release; se não der, plano com data |
| **P2** | Importante | Fricção real mas contornável, inconsistência visual localizada, copy fraca, estado ausente pouco frequente | Backlog priorizado |
| **P3** | Polimento | Refinamento óptico, microinteração, oportunidade de deleite | Backlog livre |

**Regra:** toda falha de acessibilidade em critério WCAG **nível A ou AA** é no mínimo **P1**, e é **P0** quando impede a conclusão da tarefa por teclado, leitor de tela ou contraste insuficiente em elemento essencial.

---

## 5. RUBRICA DE PONTUAÇÃO

Pontue cada uma das 10 dimensões de 0 a 4. Nota final = média ponderada.

| Dimensão | Peso | 0 | 2 | 4 |
|---|---|---|---|---|
| Clareza e hierarquia visual | 1,5 | Usuário não sabe onde olhar | Hierarquia existe mas compete | Um foco por tela, escaneável em 5s |
| Consistência e design system | 1,5 | Valores mágicos, componentes duplicados | Sistema parcial, desvios frequentes | Tokens em 100% da UI, zero desvio |
| Acessibilidade (WCAG 2.2 AA) | 2,0 | Falhas A/AA múltiplas | AA parcial | AA completo + testado com leitor de tela |
| Fluxo e arquitetura da informação | 1,5 | Usuário se perde | Caminho existe mas longo | Menor caminho possível, sempre com saída |
| Estados e design defensivo | 1,5 | Só o happy path existe | Loading e erro genéricos | Todos os estados desenhados e úteis |
| Formulários e entrada de dados | 1,0 | Erro genérico, dado perdido | Validação básica | Validação específica, recuperável, sem retrabalho |
| Conteúdo / UX writing | 1,0 | Jargão técnico, botão "Enviar" | Compreensível | Verbo de ação consistente do clique ao toast |
| Responsividade e plataforma | 1,0 | Quebra em telas comuns | Funciona, não é nativo | Aderente a HIG/Material, 320px→ultrawide |
| Performance percebida | 1,0 | Tela branca, layout shift | Aceitável | CWV verde, feedback <400ms |
| Confiança, ética e privacidade | 1,0 | Dark patterns presentes | Neutro | Consentimento claro, saída fácil, sem coerção |

**Notas de corte:** `< 2,0` = reprovado (refazer). `2,0–2,9` = aprovado com correções P0/P1 obrigatórias. `3,0–3,4` = bom. `≥ 3,5` = pronto para mercado.

---

## 6. FORMATO OBRIGATÓRIO DO RELATÓRIO

Entregue sempre nesta ordem, em linguagem simples e blocos curtos (o relatório precisa ser legível por quem tem pouco tempo e por quem tem TDAH — sem parágrafos longos, sem jargão sem explicação):

1. **Resumo executivo** — 5 linhas: o que foi avaliado, nota final, quantos P0/P1/P2/P3, e a única coisa que mais importa corrigir
2. **Premissas assumidas** — se houve
3. **Tabela de triagem** — blocos aplicáveis / parciais / fora de escopo
4. **Placar por dimensão** — tabela com nota 0–4 e uma frase de justificativa
5. **Achados** — um card por achado, no formato abaixo
6. **O que já está bom** — mínimo 3 itens, com o critério que foi atendido (reforça o que não deve ser quebrado no refactor)
7. **Plano de correção** — ordenado por severidade × esforço, com estimativa em tamanho (P/M/G)
8. **Checklist de verificação pós-correção** — o que reexecutar

### Formato de cada achado

```
[ID] Título curto e direto
Severidade: P0 | P1 | P2 | P3
Bloco/Item: 17.4
Onde: tela / componente / breakpoint
Critério violado: (norma, lei de UX ou regra do design system — nomeie)
O que acontece com o usuário: 1 frase concreta
Correção: instrução acionável (com valor exato: token, px, ratio, ms)
Como validar: teste objetivo que prova a correção
```

**Proibido:** "melhorar a experiência", "deixar mais moderno", "dar mais respiro" sem valor numérico ou token nomeado ao lado.

---

## 7. COMO O AGENTE APLICA POR FEATURE

Para cada feature/tela auditada, execute nesta ordem:

1. **Mapear o objetivo** da tela em uma frase e o caminho mínimo até ele
2. **Percorrer o fluxo inteiro**, não só a tela bonita: entrada → estados intermediários → sucesso → erro → volta
3. **Rodar os blocos aplicáveis** do checklist (seção 8)
4. **Testar os 4 modos obrigatórios**: só teclado · leitor de tela · 320px de largura · zoom 200%
5. **Testar os 6 estados obrigatórios**: vazio · carregando · com pouco dado · com muito dado (overflow) · erro · sem permissão
6. **Comparar com 2 referências de mercado** do mesmo padrão (nomeie quais) antes de propor solução original
7. **Só então** propor a correção — e propor no máximo 2 alternativas, com trade-off explícito

> Mobile (`/designer-saas-senior`): os 4 modos viram **VoiceOver/TalkBack · Dynamic Type máximo · menor aparelho alvo (ex. iPhone SE) · teclado aberto**. Zoom 200% web = Dynamic Type / fonte grande do sistema.

---

## 8. CHECKLIST MESTRE

> Convenção: `(P0)` marca item cuja falha é normalmente bloqueadora. Itens sem marcação são classificados pela seção 4.

### BLOCO 01 — Fundamentos de produto e intenção

- [ ] 01.1 A tela tem **um único objetivo primário** declarável em uma frase
- [ ] 01.2 Existe **uma única ação primária visual** por tela/seção (as demais são secundárias ou terciárias)
- [ ] 01.3 O conteúdo usado no design é **conteúdo real**, não lorem ipsum nem dado idealizado (nomes longos, valores negativos, listas vazias, textos truncados)
- [ ] 01.4 O design foi testado com o **pior caso de dado**: 0 itens, 1 item, 10.000 itens, nome de 80 caracteres, valor de 9 dígitos
- [ ] 01.5 A tela não pede ao usuário nenhuma informação que o sistema **já tem** ou pode inferir (WCAG 3.3.7 — Redundant Entry)
- [ ] 01.6 A densidade é adequada ao perfil: produto para uso esporádico = generoso; ferramenta de uso diário = denso e com atalhos
- [ ] 01.7 O design não depende de o usuário ler instrução antes de agir (affordance > tutorial)
- [ ] 01.8 Há um caminho claro de **saída/desistência** em qualquer fluxo (cancelar, voltar, fechar) (P0)

### BLOCO 02 — Arquitetura da informação e navegação

- [ ] 02.1 A estrutura de navegação reflete o **modelo mental do usuário**, não o organograma da empresa nem o schema do banco
- [ ] 02.2 Rótulos de menu usam a **linguagem do usuário** (nunca "Entidades", "Registros", "Configuração de webhook")
- [ ] 02.3 Profundidade máxima de 3 níveis para chegar a qualquer função frequente
- [ ] 02.4 Navegação principal com **5±2 itens** (Lei de Hick e Miller); acima disso, agrupar
- [ ] 02.5 O usuário sempre sabe **onde está**: item ativo destacado, título de página, breadcrumb em hierarquias profundas
- [ ] 02.6 O botão "voltar" do navegador/SO funciona e não quebra estado nem duplica registro (P0)
- [ ] 02.7 URLs são legíveis, estáveis e **compartilháveis** — estado relevante (filtro, aba, página) vive na URL
- [ ] 02.8 Busca global existe quando o volume de conteúdo passa de ~50 itens navegáveis
- [ ] 02.9 Não há **becos sem saída**: toda tela oferece pelo menos uma ação de continuidade
- [ ] 02.10 Página 404 / rota inválida é útil: explica, busca e oferece caminho de volta
- [ ] 02.11 Ajuda e suporte estão no **mesmo lugar em todas as telas** (WCAG 3.2.6 — Consistent Help)

### BLOCO 03 — Fluxos, jornada e onboarding

- [ ] 03.1 O fluxo principal foi desenhado ponta a ponta, incluindo entrada, meio, sucesso, erro e retorno
- [ ] 03.2 Número de passos do fluxo crítico é o **mínimo possível** — cada passo extra justificado
- [ ] 03.3 Fluxos longos (>3 passos) mostram **progresso** e permitem salvar/retomar
- [ ] 03.4 Nada crítico depende de o usuário lembrar de algo entre telas (reconhecimento > memorização)
- [ ] 03.5 **Progressive disclosure**: opções avançadas escondidas por padrão, sem esconder o essencial
- [ ] 03.6 Onboarding leva ao **primeiro valor real** (aha moment), não a um tour de features
- [ ] 03.7 Estado inicial oferece dado de exemplo, template ou importação — nunca uma tela vazia sem rumo
- [ ] 03.8 Checklist de setup (se houver) mostra progresso e é dispensável
- [ ] 03.9 O usuário pode pular o onboarding e voltar a ele depois
- [ ] 03.10 Fluxo de retorno (2ª sessão em diante) é diferente do primeiro acesso — não repete o que já foi feito

### BLOCO 04 — Hierarquia visual e layout

- [ ] 04.1 Escaneabilidade: em 5 segundos o usuário identifica o que a tela é e qual a ação principal
- [ ] 04.2 Hierarquia construída com **tamanho, peso, cor e espaço** — não apenas com tamanho
- [ ] 04.3 Contraste de importância suficiente: título vs corpo vs auxiliar claramente distintos
- [ ] 04.4 Agrupamento por **proximidade** (Gestalt): espaço entre grupos > espaço dentro do grupo
- [ ] 04.5 Alinhamento consistente — número mínimo de eixos de alinhamento por tela
- [ ] 04.6 Largura de linha de texto entre **45 e 75 caracteres** (ideal ~66); em coluna estreita, mínimo 35
- [ ] 04.7 Whitespace usado como estrutura, não como sobra; margens externas ≥ padding interno dos blocos
- [ ] 04.8 Nada essencial abaixo da dobra sem indício visual de continuidade
- [ ] 04.9 Elementos de mesma importância têm o mesmo peso visual em toda a aplicação
- [ ] 04.10 Uso de elevação/sombra/borda é **semântico e consistente** (elevação = camada, não decoração)
- [ ] 04.11 Cards, listas e tabelas foram escolhidos pelo tipo de comparação necessária, não por estética

### BLOCO 05 — Grid, responsividade e breakpoints

- [ ] 05.1 Sistema de grid definido (colunas, gutter, margem) e respeitado em todos os breakpoints
- [ ] 05.2 Breakpoints baseados no **conteúdo quebrando**, não em modelos de aparelho
- [ ] 05.3 Layout íntegro em **320px de largura** sem scroll horizontal (WCAG 1.4.10 — Reflow) (P0)
- [ ] 05.4 Layout íntegro em **zoom 200%** e com texto redimensionado 200% (WCAG 1.4.4) (P0)
- [ ] 05.5 Suporta espaçamento de texto customizado sem perda de conteúdo: line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, parágrafo 2em (WCAG 1.4.12)
- [ ] 05.6 Funciona em **retrato e paisagem**; nada exige orientação única (WCAG 1.3.4)
- [ ] 05.7 Tipografia fluida (`clamp()`) ou escala por breakpoint — sem salto brusco de tamanho
- [ ] 05.8 Componentes reutilizáveis respondem ao **container**, não só à viewport (container queries quando disponível)
- [ ] 05.9 Testado em ultrawide: conteúdo com largura máxima, não esticado infinitamente
- [ ] 05.10 Safe areas respeitadas em mobile (notch, home indicator, barra de status, teclado aberto)
- [ ] 05.11 Nenhum conteúdo importante é cortado quando o teclado virtual abre

### BLOCO 06 — Design tokens e fundação do design system

- [ ] 06.1 Existem tokens para: cor, tipografia, espaçamento, raio, sombra, borda, z-index, duração e easing (P0 para produto em escala)
- [ ] 06.2 Arquitetura em **3 camadas**: primitivos (`blue-500`) → semânticos (`color-action-primary`) → componente (`button-bg-hover`)
- [ ] 06.3 A UI **nunca** referencia primitivo diretamente — só semântico ou de componente
- [ ] 06.4 Zero valor mágico no código: nenhum `#3B82F6`, `13px` ou `margin-top: 7px` solto (P0)
- [ ] 06.5 Nomenclatura consistente, previsível e livre de nome de aparência ("azul", "grande") em camada semântica
- [ ] 06.6 Tokens são a **fonte única de verdade** compartilhada entre design e código (formato exportável, ex.: W3C DTCG / JSON)
- [ ] 06.7 Escala de espaçamento baseada em múltiplos de **4px** (ou 8px), sem exceções não documentadas
- [ ] 06.8 Escala de raio de borda limitada (3–4 valores) e coerente: raio maior em containers, menor em controles
- [ ] 06.9 Temas (claro/escuro/marca) trocam apenas valores de token — nunca estrutura de componente
- [ ] 06.10 Tokens de z-index centralizados e documentados (evita guerra de `9999`)

### BLOCO 07 — Cor

- [ ] 07.1 Paleta com escalas completas (ex.: 50→900) para neutros e cores de ação/feedback
- [ ] 07.2 Cores semânticas definidas: sucesso, alerta, erro, informação, neutro — e usadas **só** com esse significado
- [ ] 07.3 Contraste de texto normal ≥ **4,5:1**; texto grande (≥24px, ou ≥18,66px bold) ≥ **3:1** (WCAG 1.4.3) (P0)
- [ ] 07.4 Contraste de **componentes e ícones essenciais** ≥ 3:1 contra o fundo adjacente (WCAG 1.4.11) (P0)
- [ ] 07.5 Estados (hover, foco, ativo, desabilitado) mantêm contraste suficiente — inclusive o desabilitado ser legível
- [ ] 07.6 Informação **nunca** transmitida só por cor: sempre com ícone, texto, padrão ou posição (WCAG 1.4.1) (P0)
- [ ] 07.7 Testado para daltonismo (deuteranopia, protanopia, tritanopia) — especialmente gráficos e status
- [ ] 07.8 Dark mode é **redesenho**, não inversão: superfícies em cinzas dessaturados (não preto puro), cores de marca reajustadas, sombras substituídas por elevação de superfície
- [ ] 07.9 Contraste revalidado no dark mode (ratio muda) (P0)
- [ ] 07.10 Cor de marca não é usada onde exige alto contraste sem checagem prévia
- [ ] 07.11 Quantidade de cores por tela sob controle: cor é acento, não preenchimento

### BLOCO 08 — Tipografia

- [ ] 08.1 Escala tipográfica modular definida (razão 1,125 / 1,2 / 1,25 / 1,333) com número limitado de tamanhos (6–8)
- [ ] 08.2 No máximo **2 famílias tipográficas** (display + corpo), com uma utilitária opcional para dados/código
- [ ] 08.3 Corpo de texto ≥ **16px** em web e mobile (nunca abaixo de 14px para texto secundário)
- [ ] 08.4 Inputs em iOS com `font-size` ≥ 16px para não disparar zoom automático
- [ ] 08.5 Line-height: 1,4–1,6 para corpo; 1,1–1,3 para títulos grandes
- [ ] 08.6 Letter-spacing negativo apenas em títulos grandes; positivo em caixa alta pequena
- [ ] 08.7 Pesos limitados e propositais (ex.: 400 / 500 / 700) — sem uso de peso apenas para "dar destaque"
- [ ] 08.8 Números em tabelas e valores usam **tabular/lining figures** (`font-variant-numeric: tabular-nums`)
- [ ] 08.9 Hierarquia semântica de headings correta (`h1`→`h6` sem pular nível) e independente do tamanho visual (P0 para leitor de tela)
- [ ] 08.10 Truncamento controlado: define-se onde trunca, com tooltip/expansão para o texto completo
- [ ] 08.11 Fontes carregadas com `font-display: swap` + fallback métrico compatível (evita CLS e FOIT)
- [ ] 08.12 Texto não é imagem (WCAG 1.4.5), exceto logotipo

### BLOCO 09 — Espaçamento e ritmo

- [ ] 09.1 Todo espaçamento vem da escala (4/8) — nada arbitrário
- [ ] 09.2 Espaçamento **relacional**: elementos relacionados mais próximos; separação clara entre grupos
- [ ] 09.3 Ritmo vertical consistente entre seções repetidas
- [ ] 09.4 Padding interno de componentes consistente por tamanho (sm/md/lg), não por tela
- [ ] 09.5 Alinhamento óptico aplicado quando o matemático parece errado (ícones, aspas, itens circulares)
- [ ] 09.6 Densidade coerente dentro de uma mesma tela — sem áreas apertadas ao lado de áreas soltas sem razão

### BLOCO 10 — Iconografia, ilustração e mídia

- [ ] 10.1 Família de ícones única, com grid, peso de traço e cantos consistentes
- [ ] 10.2 Ícone sozinho só é usado quando **universalmente reconhecível**; caso contrário, ícone + rótulo
- [ ] 10.3 Todo ícone-botão tem nome acessível (`aria-label` ou texto visualmente oculto) (P0)
- [ ] 10.4 Ícones decorativos marcados como `aria-hidden`
- [ ] 10.5 Tamanhos de ícone vindos da escala (16/20/24/32), alinhados opticamente ao texto
- [ ] 10.6 Imagens com `alt` descritivo quando informativas, `alt=""` quando decorativas (WCAG 1.1.1) (P0)
- [ ] 10.7 Toda imagem/mídia com `width`/`height` ou `aspect-ratio` reservados (evita CLS) (P0)
- [ ] 10.8 Formatos modernos (WebP/AVIF), responsivos (`srcset`), com lazy-loading fora da dobra
- [ ] 10.9 Vídeo/áudio: não dá autoplay com som; tem controles; tem legenda/transcrição quando há fala (WCAG 1.2)
- [ ] 10.10 Ilustrações e imagens de estado vazio reforçam a ação, não ocupam espaço à toa
- [ ] 10.11 Nada pisca mais de 3 vezes por segundo (WCAG 2.3.1) (P0)

### BLOCO 11 — Componentes: anatomia, estados e variantes

- [ ] 11.1 Todos os estados desenhados para **todo** componente interativo: default, hover, focus-visible, active/pressed, disabled, loading, error, selected, read-only (P0)
- [ ] 11.2 Foco visível em **100%** dos elementos focáveis, com contraste ≥3:1 e área perceptível (WCAG 2.4.7 / 2.4.11) (P0)
- [ ] 11.3 O foco nunca é escondido por header fixo, sticky bar ou modal (WCAG 2.4.11 — Focus Not Obscured) (P0)
- [ ] 11.4 Estado `disabled` sempre explica o porquê (tooltip/texto) ou é substituído por estado habilitado com validação
- [ ] 11.5 Variantes limitadas e nomeadas semanticamente (primary/secondary/ghost/destructive), sem "botão azul 2"
- [ ] 11.6 Componentes compostos por slots/children em vez de props infinitas — reuso sem fork
- [ ] 11.7 Não existem dois componentes fazendo a mesma coisa com aparências diferentes (auditar duplicatas)
- [ ] 11.8 Comportamento consistente do mesmo componente em todo o sistema (WCAG 3.2.4 — Consistent Identification)
- [ ] 11.9 Componentes overlay (modal, drawer, popover, tooltip) seguem regras únicas: foco preso dentro, `Esc` fecha, foco retorna ao gatilho, scroll do fundo travado (P0)
- [ ] 11.10 Tooltip nunca carrega informação essencial nem depende só de hover (acessível por teclado, WCAG 1.4.13)
- [ ] 11.11 Componentes com conteúdo dinâmico não mudam de tamanho abruptamente (reservar espaço)

### BLOCO 12 — Ações e botões

- [ ] 12.1 Hierarquia de ação clara: **1 primária**, poucas secundárias, terciárias discretas
- [ ] 12.2 Rótulo é **verbo de ação específico** ("Salvar alterações", "Criar turma") — nunca "OK", "Enviar", "Confirmar" isolados
- [ ] 12.3 O mesmo verbo percorre todo o fluxo: botão "Publicar" → toast "Publicado"
- [ ] 12.4 Ação destrutiva visualmente distinta, nunca adjacente à ação primária e nunca como padrão do foco (P0)
- [ ] 12.5 Ordem e posição dos botões consistentes com a plataforma e iguais em todo o sistema
- [ ] 12.6 Estado de carregamento no próprio botão + bloqueio de duplo envio (P0)
- [ ] 12.7 Área de toque ≥ **24×24px** (WCAG 2.5.8) e ≥ **44×44pt** (iOS HIG) / **48×48dp** (Material) em mobile (P0)
- [ ] 12.8 Espaçamento mínimo entre alvos de toque adjacentes ≥ 8px
- [ ] 12.9 Ações em massa e ações por item não se confundem visualmente
- [ ] 12.10 Nenhuma ação exige arrastar sem alternativa de clique/toque simples (WCAG 2.5.7 — Dragging Movements)
- [ ] 12.11 Link é link (navega) e botão é botão (age) — semântica correta no HTML (P0)

### BLOCO 13 — Formulários e entrada de dados

- [ ] 13.1 Toda entrada tem **rótulo visível e persistente** — placeholder não substitui rótulo (P0)
- [ ] 13.2 Rótulo associado programaticamente ao campo (`for`/`id`) (P0)
- [ ] 13.3 Campos agrupados por afinidade, em ordem lógica de preenchimento
- [ ] 13.4 Marcar o que é **opcional** (não o obrigatório) quando a maioria for obrigatória — e vice-versa
- [ ] 13.5 Largura do campo comunica o tamanho esperado do conteúdo (CEP curto, endereço longo)
- [ ] 13.6 Teclado correto em mobile: `inputmode`/`type` para número, e-mail, telefone, decimal (P0 em mobile)
- [ ] 13.7 `autocomplete` preenchido corretamente (nome, e-mail, endereço, cartão) (WCAG 1.3.5)
- [ ] 13.8 Máscara e formatação não impedem colar nem apagar; formatação aplicada no blur, não a cada tecla
- [ ] 13.9 Validação: erro exibido **após** o campo perder foco (não a cada caractere); sucesso validado inline quando útil
- [ ] 13.10 Mensagem de erro diz **o que houve e como resolver**, junto ao campo, com ícone + texto (não só cor vermelha) (P0)
- [ ] 13.11 No submit com erro: foco vai para o primeiro campo inválido, com resumo dos erros no topo e âncora para cada um
- [ ] 13.12 Erro é anunciado a leitor de tela (`aria-live`, `aria-invalid`, `aria-describedby`) (P0)
- [ ] 13.13 **Nenhum dado do usuário é perdido** em erro, timeout, navegação acidental ou refresh (P0)
- [ ] 13.14 Formulários longos: autosave com indicação clara de "salvo/salvando" ou rascunho recuperável
- [ ] 13.15 Sem limites artificiais de caracteres; contador visível quando houver limite real
- [ ] 13.16 Autenticação não exige teste cognitivo sem alternativa (colar senha permitido, sem puzzle obrigatório — WCAG 3.3.8) (P0)
- [ ] 13.17 Campos de senha com opção de exibir; regras de senha mostradas **antes** da digitação, validadas em tempo real
- [ ] 13.18 Datas, moedas e telefones no formato local (pt-BR: DD/MM/AAAA, R$ 1.234,56)
- [ ] 13.19 Seleção: ≤5 opções → radio/segmented; 5–15 → select; >15 → combobox com busca; múltipla e curta → checkbox
- [ ] 13.20 Upload: formatos e tamanho máximo informados antes, progresso visível, erro específico, remoção fácil, preview quando aplicável

### BLOCO 14 — Estados do sistema

Todo componente que busca dado precisa dos **seis estados** desenhados:

- [ ] 14.1 **Vazio (sem dado nunca criado)**: explica o que é, por que está vazio e traz a ação primária de criação
- [ ] 14.2 **Vazio por filtro/busca (zero resultados)**: diferente do anterior — mostra os filtros aplicados e oferece limpar/ajustar (P1 confundir os dois)
- [ ] 14.3 **Carregando**: skeleton com a forma do conteúdo real para >300ms; spinner só quando a forma é imprevisível
- [ ] 14.4 **Parcial/paginado**: deixa claro que há mais conteúdo e quanto
- [ ] 14.5 **Erro**: explica em linguagem humana, oferece "tentar de novo" e caminho alternativo; nunca expõe stack trace nem código bruto (P0)
- [ ] 14.6 **Sem permissão**: diferencia "não existe" de "você não pode ver" e diz como solicitar acesso
- [ ] 14.7 **Offline / conexão instável**: estado dedicado, com fila ou aviso de que a ação não foi salva (P0 em mobile)
- [ ] 14.8 Primeira execução (first-run) e conta nova têm tratamento próprio
- [ ] 14.9 Estado de sucesso é inequívoco e mostra o resultado, não só um toast que some
- [ ] 14.10 Transições entre estados não causam salto de layout (altura mínima reservada) (P0 para CLS)

### BLOCO 15 — Feedback, latência e percepção de tempo

- [ ] 15.1 Toda ação do usuário gera resposta perceptível em **≤100ms** (percepção de instantâneo)
- [ ] 15.2 Ações que passam de **400ms** (Doherty threshold) mostram feedback de progresso
- [ ] 15.3 Acima de **1s**: indicador de carregamento; acima de **10s**: progresso determinado + estimativa + possibilidade de sair
- [ ] 15.4 UI otimista aplicada onde o erro é raro e reversível — sempre com rollback visível se falhar
- [ ] 15.5 Escolha correta do canal de feedback: inline (contextual) > toast (transitório) > modal (bloqueante, só quando exige decisão)
- [ ] 15.6 Toast: 4–6s de duração, pausável no hover, não cobre ação, não empilha infinito, nunca carrega informação crítica única
- [ ] 15.7 Confirmação destrutiva substituída por **desfazer** sempre que tecnicamente possível
- [ ] 15.8 Feedback anunciado para leitor de tela via `role="status"`/`aria-live` (P0)
- [ ] 15.9 Erros do sistema não culpam o usuário e não usam voz humana artificial ("Ops! Alguma coisa deu errado 😅" → dizer o que houve)
- [ ] 15.10 Não existe ação silenciosa: se algo mudou no servidor, o usuário vê

### BLOCO 16 — Mobile e padrões de plataforma

- [ ] 16.1 Segue o padrão da plataforma quando não há razão forte para divergir (iOS HIG / Material Design 3 / Web)
- [ ] 16.2 Navegação principal em tab bar com **3–5 itens**, rótulo + ícone, item ativo evidente
- [ ] 16.3 Ações primárias dentro da **thumb zone** (terço inferior); ações destrutivas fora dela
- [ ] 16.4 Gestos do sistema não são sequestrados (swipe de voltar, pull-to-refresh, edge swipe)
- [ ] 16.5 Todo gesto tem **equivalente visível** (swipe para excluir também acessível por menu) (P0)
- [ ] 16.6 Bottom sheet / modal com handle, fechamento por arraste e por botão, altura em snap points
- [ ] 16.7 Safe area, notch, status bar e home indicator respeitados
- [ ] 16.8 Comportamento do teclado: campos visíveis, `Enter`/`Next` navegando, "Concluir" acessível
- [ ] 16.9 Haptics usados com moderação e semântica (sucesso ≠ erro ≠ seleção)
- [ ] 16.10 Estados de permissão do SO desenhados: pedido contextual antes do prompt nativo, e tela para "negado permanentemente"
- [ ] 16.11 Suporte a Dynamic Type / fonte grande do sistema sem quebra de layout (P0)
- [ ] 16.12 Toque não depende de precisão fina; alvos ≥44pt (iOS) / 48dp (Android)
- [ ] 16.13 Desempenho de scroll a 60fps, listas longas virtualizadas
- [ ] 16.14 Web: PWA/instalação, splash e ícone corretos, quando aplicável

### BLOCO 17 — Acessibilidade (WCAG 2.2 nível AA)

**Percepção**
- [ ] 17.1 Alternativa textual para todo conteúdo não textual (1.1.1) (P0)
- [ ] 17.2 Estrutura semântica real: headings, listas, tabelas com `th`/`scope`, landmarks/regiões (1.3.1) (P0)
- [ ] 17.3 Ordem de leitura no DOM coerente com a ordem visual (1.3.2) (P0)
- [ ] 17.4 Instruções não dependem de forma, cor, tamanho ou posição ("clique no botão à direita") (1.3.3)
- [ ] 17.5 Contrastes conforme Bloco 07 (1.4.3, 1.4.11) (P0)
- [ ] 17.6 Reflow em 320px e resize de texto 200% (1.4.4, 1.4.10) (P0)
- [ ] 17.7 Conteúdo em hover/foco é dispensável, pairável e persistente (1.4.13)

**Operação**
- [ ] 17.8 100% da funcionalidade disponível **apenas com teclado** (2.1.1) (P0)
- [ ] 17.9 Sem armadilha de foco (2.1.2) (P0)
- [ ] 17.10 Skip link para o conteúdo principal (2.4.1)
- [ ] 17.11 Título de página único e descritivo por rota (2.4.2)
- [ ] 17.12 Ordem de foco lógica e previsível (2.4.3) (P0)
- [ ] 17.13 Texto de link faz sentido fora de contexto (nada de "clique aqui") (2.4.4)
- [ ] 17.14 Foco visível e não obscurecido (2.4.7, 2.4.11) (P0)
- [ ] 17.15 Alvos ≥24×24px com exceções de espaçamento respeitadas (2.5.8) (P0)
- [ ] 17.16 Alternativa a movimentos de arrastar (2.5.7)
- [ ] 17.17 Alternativa a gestos multiponto/traçado (2.5.1)
- [ ] 17.18 Nome acessível contém o texto visível do rótulo (2.5.3) (P0)

**Compreensão**
- [ ] 17.19 Idioma da página e de trechos declarado (`lang`) (3.1.1, 3.1.2)
- [ ] 17.20 Foco ou entrada de dado não dispara mudança de contexto inesperada (3.2.1, 3.2.2) (P0)
- [ ] 17.21 Navegação e identificação consistentes entre telas (3.2.3, 3.2.4)
- [ ] 17.22 Ajuda no mesmo lugar em todas as páginas (3.2.6)
- [ ] 17.23 Erros identificados em texto, com sugestão de correção (3.3.1, 3.3.3) (P0)
- [ ] 17.24 Ações legais/financeiras/de dados são reversíveis, verificáveis ou confirmáveis (3.3.4) (P0)
- [ ] 17.25 Sem reentrada redundante de informação já fornecida (3.3.7)
- [ ] 17.26 Autenticação acessível: sem teste cognitivo obrigatório, colar permitido (3.3.8) (P0)

**Robustez e temporização**
- [ ] 17.27 Nome, função e valor expostos corretamente; ARIA só onde HTML nativo não resolve (4.1.2) (P0)
- [ ] 17.28 Mensagens de status anunciadas sem roubar foco (4.1.3)
- [ ] 17.29 Limites de tempo ajustáveis/extensíveis, com aviso antes do fim de sessão (2.2.1) (P0 quando há sessão)
- [ ] 17.30 Movimento automático (carrossel, auto-scroll) pode ser pausado (2.2.2)
- [ ] 17.31 `prefers-reduced-motion` respeitado (2.3.3) (P0)
- [ ] 17.32 Testado com pelo menos um leitor de tela real (NVDA, VoiceOver ou TalkBack) — não só com auditoria automática
- [ ] 17.33 Auditoria automática (axe/Lighthouse) sem violações críticas — sabendo que ela cobre apenas ~30–40% dos problemas reais

### BLOCO 18 — Movimento e microinterações

- [ ] 18.1 Toda animação tem **função**: orientar, dar continuidade espacial, confirmar ação ou explicar mudança
- [ ] 18.2 Durações: micro (hover, toggle) 100–150ms · transição de componente 200–300ms · transição de tela/modal 300–500ms
- [ ] 18.3 Easing coerente: `ease-out` para entrada, `ease-in` para saída, `ease-in-out` para movimento contínuo — vindo de token
- [ ] 18.4 Entrada e saída de elementos são simétricas em lógica e assimétricas em tempo (saída mais rápida)
- [ ] 18.5 Animação apenas em `transform` e `opacity` (60fps); nada animando `width`, `height`, `top`, `left` (P0 para performance)
- [ ] 18.6 Nenhuma animação atrasa a percepção de conclusão de uma tarefa
- [ ] 18.7 Um momento orquestrado é melhor que muitos efeitos dispersos (restrição > quantidade)
- [ ] 18.8 `prefers-reduced-motion: reduce` remove parallax, autoplay e movimento amplo, mantendo fade/instantâneo (P0)
- [ ] 18.9 Animação não causa layout shift nem esconde conteúdo já disponível
- [ ] 18.10 Loading skeletons com shimmer sutil, sem virar espetáculo

### BLOCO 19 — UX Writing e conteúdo

- [ ] 19.1 Voz e tom definidos e consistentes; adequados ao público (inclusive se houver menores de idade)
- [ ] 19.2 Sentence case como padrão em rótulos, títulos e botões (evita caixa alta gritada)
- [ ] 19.3 Nomes das coisas vêm do mundo do usuário, nunca da implementação ("Notificações", não "Webhook config")
- [ ] 19.4 Voz ativa e específica; sem "clever" às custas de clareza
- [ ] 19.5 Cada elemento faz **um** trabalho: rótulo rotula, ajuda explica, exemplo demonstra
- [ ] 19.6 Microcopy de erro segue o padrão: **o que houve → por quê → o que fazer agora**
- [ ] 19.7 Estado vazio é convite à ação, não decoração melancólica
- [ ] 19.8 Números, datas, moedas, unidades e pluralização localizados (pt-BR e demais idiomas suportados)
- [ ] 19.9 Textos comportam expansão de **+30–40%** em tradução, sem quebrar layout
- [ ] 19.10 Suporte a RTL previsto quando houver mercado-alvo (espelhamento de layout e ícones direcionais)
- [ ] 19.11 Terminologia idêntica em toda a aplicação (glossário único: "turma" nunca vira "classe" em outra tela)
- [ ] 19.12 Sem emoji carregando significado funcional sozinho; sem exclamação em excesso
- [ ] 19.13 Textos de consentimento, cobrança e exclusão são literais e sem eufemismo

### BLOCO 20 — Tabelas, listas e visualização de dados

- [ ] 20.1 Escolha correta: tabela (comparar atributos) · lista (escanear) · card (visual/heterogêneo) · gráfico (tendência/proporção)
- [ ] 20.2 Números alinhados à direita com `tabular-nums`; texto à esquerda; datas em coluna própria
- [ ] 20.3 Cabeçalho fixo em tabelas longas; primeira coluna fixa quando há scroll horizontal
- [ ] 20.4 Ordenação com indicação clara de coluna e direção, persistida na sessão/URL
- [ ] 20.5 Filtros aplicados sempre visíveis, com contagem de resultados e "limpar tudo"
- [ ] 20.6 Paginação para dados que exigem localização; scroll infinito só em feed — nunca com rodapé importante abaixo
- [ ] 20.7 Seleção em massa: contador do selecionado, "selecionar todos da página" ≠ "selecionar todos os N", ação em massa clara e reversível (P0)
- [ ] 20.8 Ações por linha acessíveis por teclado (não só em hover) (P0)
- [ ] 20.9 Estratégia responsiva de tabela definida (colunas prioritárias, scroll horizontal ou card por linha) — nunca esmagar tudo
- [ ] 20.10 Densidade ajustável (confortável/compacta) em ferramentas de uso intenso
- [ ] 20.11 Gráficos: eixo Y começando em zero quando comparar magnitude; escala truncada sinalizada
- [ ] 20.12 Gráfico legível sem cor (padrão/rótulo direto) e com dados acessíveis em tabela alternativa (P0)
- [ ] 20.13 Toda métrica exibe unidade, período e origem; sem número sem contexto de comparação
- [ ] 20.14 Estados de dados incompletos ou desatualizados sinalizados explicitamente

### BLOCO 21 — Busca, filtro e descoberta

- [ ] 21.1 Campo de busca com escopo claro (o que está sendo buscado)
- [ ] 21.2 Busca tolera erro de digitação, acento e caixa; sugere correção
- [ ] 21.3 Resultados mostram o termo destacado e a razão do match
- [ ] 21.4 Estados de busca desenhados: inativo, digitando, carregando, com resultado, sem resultado, erro
- [ ] 21.5 Buscas e filtros recentes/salvos disponíveis em ferramentas de uso frequente
- [ ] 21.6 Filtros compostos comunicam relação (E/OU) sem ambiguidade
- [ ] 21.7 Estado de busca/filtro refletido na URL para compartilhar e voltar
- [ ] 21.8 Resultado vazio sugere próximo passo (remover filtro, ampliar período, criar item)

### BLOCO 22 — Design defensivo e prevenção de erro

- [ ] 22.1 O sistema **previne** o erro antes de tratá-lo (restringir entrada, desabilitar combinação inválida, sugerir valor)
- [ ] 22.2 Ações irreversíveis exigem confirmação proporcional ao dano: exclusão em massa/conta = digitar o nome do item (P0)
- [ ] 22.3 Confirmação genérica em ação reversível é ruído — usar desfazer
- [ ] 22.4 Modal de confirmação descreve **exatamente** o que será perdido e quantos itens
- [ ] 22.5 Botão de confirmação nomeia a ação ("Excluir 12 alunos"), nunca "Sim"/"OK" (P0)
- [ ] 22.6 Perda de conexão, sessão expirada e conflito de edição simultânea têm tratamento desenhado (P0)
- [ ] 22.7 Timeout de sessão avisa antes, permite estender e preserva o trabalho em andamento (P0)
- [ ] 22.8 Limites do sistema (cota, upload, tamanho, taxa) são comunicados **antes** de o usuário esbarrar neles
- [ ] 22.9 Rate limit e bloqueios exibem quanto falta e o que fazer, sem linguagem acusatória
- [ ] 22.10 Nenhuma ação destrutiva é a primeira do foco, nem fica no caminho de cliques repetidos

### BLOCO 23 — Permissões, papéis e painéis administrativos

- [ ] 23.1 A UI reflete o papel do usuário: o que ele não pode fazer não aparece, ou aparece desabilitado **com explicação**
- [ ] 23.2 Regra definida e consistente entre esconder × desabilitar (esconder o que ele nunca terá; desabilitar o que ele pode obter)
- [ ] 23.3 Modo de impersonação/suporte tem banner permanente e inequívoco (P0)
- [ ] 23.4 Painel admin pode ser mais denso, mas mantém acessibilidade e clareza de ação destrutiva
- [ ] 23.5 Atalhos de teclado para operações repetitivas em ferramentas internas, com lista descobrível
- [ ] 23.6 Histórico/auditoria visível para ações sensíveis (quem fez, quando, o quê)
- [ ] 23.7 Convite, papel e remoção de usuário são fluxos desenhados, não formulários crus
- [ ] 23.8 Mudança de plano/limite reflete imediatamente na UI, sem estado fantasma

### BLOCO 24 — Performance percebida e Core Web Vitals

- [ ] 24.1 **LCP ≤ 2,5s** (p75) — maior elemento visível carregado rápido (P0)
- [ ] 24.2 **INP ≤ 200ms** (p75) — resposta a interação (P0)
- [ ] 24.3 **CLS ≤ 0,1** (p75) — sem salto de layout (P0)
- [ ] 24.4 Espaço reservado para imagem, anúncio, banner, fonte e conteúdo assíncrono
- [ ] 24.5 Conteúdo acima da dobra prioriza carregamento; o resto é adiado
- [ ] 24.6 Fontes com subset, preload e fallback métrico
- [ ] 24.7 Listas longas virtualizadas; paginação no servidor
- [ ] 24.8 Testado em rede lenta (3G/4G ruim) e aparelho de baixo custo — não só no MacBook
- [ ] 24.9 Nenhuma tela branca prolongada: shell/skeleton aparece primeiro
- [ ] 24.10 Peso da rota inicial sob orçamento definido (budget de performance documentado)
- [ ] 24.11 Interações locais (abrir menu, expandir, filtrar em memória) são instantâneas, sem round-trip

### BLOCO 25 — White-label, multi-tenant e temas

- [ ] 25.1 O que é customizável pelo tenant está delimitado (logo, cor primária, nome, domínio) — o resto é imutável
- [ ] 25.2 Cor de marca do tenant passa por **validação automática de contraste**; se falhar, o sistema ajusta o texto sobre ela ou rejeita com aviso (P0)
- [ ] 25.3 Logo suporta proporções variadas, fundo claro e escuro, e tem fallback (iniciais) quando ausente
- [ ] 25.4 Tema do tenant aplicado só via tokens; nenhum componente com regra condicional de marca
- [ ] 25.5 Dark mode funciona com qualquer cor de tenant
- [ ] 25.6 Tela de pré-visualização da marca antes de publicar
- [ ] 25.7 Identidade do fornecedor da plataforma não vaza onde o contrato exige white-label (rodapés, títulos, e-mails, metadados, mensagens de erro) (P0 quando contratual)
- [ ] 25.8 Troca de tenant/contexto é explícita e visível o tempo todo (evita agir no tenant errado) (P0)

### BLOCO 26 — Interfaces com IA / LLM

- [ ] 26.1 Está sempre claro **quando o conteúdo é gerado por IA** (P0)
- [ ] 26.2 Expectativa de latência comunicada; streaming token a token quando disponível
- [ ] 26.3 Sempre há **parar**, **regenerar** e **editar a saída**
- [ ] 26.4 O usuário pode ver e ajustar o que foi enviado como contexto/entrada
- [ ] 26.5 Saída de IA é editável e nunca gravada em sistema crítico sem revisão humana explícita (P0)
- [ ] 26.6 Erros de IA (recusa, timeout, filtro, limite) têm mensagem própria, sem expor prompt de sistema, provedor ou modelo (P0 quando confidencial)
- [ ] 26.7 Incerteza e fontes exibidas quando a resposta é factual
- [ ] 26.8 Consumo (créditos, tokens, limite do plano) visível antes e depois da ação
- [ ] 26.9 Feedback do usuário sobre a saída (positivo/negativo + motivo) coletado de forma leve
- [ ] 26.10 Entrada por voz/imagem/arquivo com estados próprios de permissão, progresso e falha
- [ ] 26.11 Nenhum padrão sugere que a IA é humana; sem antropomorfização enganosa (P0 com público menor de idade)
- [ ] 26.12 Ação autônoma de agente exige confirmação em passos irreversíveis e mostra o que fará antes (P0)

### BLOCO 27 — Planos, cobrança e conversão

- [ ] 27.1 Preço, moeda, periodicidade, impostos e renovação declarados antes do checkout (P0)
- [ ] 27.2 Comparação de planos objetiva, com o limite real de cada um (não só adjetivos)
- [ ] 27.3 Upgrade/downgrade mostra proporcional, data de efeito e o que se perde
- [ ] 27.4 **Cancelamento tão fácil quanto a contratação** — sem labirinto, sem obrigar contato humano (P0)
- [ ] 27.5 Falha de pagamento tem fluxo desenhado: aviso, prazo, retenção de dados, recuperação
- [ ] 27.6 Estado de inadimplência/expiração degrada com dignidade (acesso somente leitura > bloqueio abrupto)
- [ ] 27.7 Trial deixa claro o que acontece no fim e se pede cartão
- [ ] 27.8 Recibos, notas e histórico acessíveis sem pedir ao suporte
- [ ] 27.9 Checkout com o mínimo de campos, feedback de validação de cartão e estado de processamento inequívoco (P0 contra cobrança dupla)

### BLOCO 28 — Confiança, privacidade, ética e público sensível

- [ ] 28.1 **Zero dark patterns** (ver lista no Apêndice B) (P0)
- [ ] 28.2 Consentimento LGPD granular, com recusa tão fácil quanto o aceite, sem pré-marcação (P0)
- [ ] 28.3 Finalidade da coleta explicada no ponto de coleta, em linguagem simples
- [ ] 28.4 Exclusão de conta e exportação de dados existem e são encontráveis (P0)
- [ ] 28.5 Dado sensível não é exibido sem necessidade (mascarar CPF, cartão, contato)
- [ ] 28.6 Com público **menor de idade**: linguagem apropriada, coleta mínima, sem padrões de engajamento compulsivo, sem exposição pública de dados do menor, consentimento parental previsto (P0)
- [ ] 28.7 Notificações e gamificação não exploram ansiedade, escassez falsa ou pressão social
- [ ] 28.8 Nenhuma comunicação induz erro sobre custo, permanência ou compartilhamento de dados
- [ ] 28.9 Conteúdo gerado por usuário tem moderação, denúncia e bloqueio visíveis quando há interação social

### BLOCO 29 — Notificações e comunicação fora do produto

- [ ] 29.1 Preferências por canal e por tipo de evento, com desativação total possível
- [ ] 29.2 Push pedido em momento contextual, com explicação do valor — nunca no primeiro segundo
- [ ] 29.3 Frequência sob controle (agrupamento, digest, quiet hours)
- [ ] 29.4 Notificação leva ao lugar exato (deep link), não à home
- [ ] 29.5 Badge/contador é verdadeiro e some ao ser lido
- [ ] 29.6 E-mails transacionais responsivos, legíveis em dark mode, com texto alternativo e link de descadastro
- [ ] 29.7 Central de notificações in-app com lidas/não lidas e histórico

### BLOCO 30 — Design system, governança e handoff

- [ ] 30.1 Inventário de componentes existente e atualizado; duplicatas mapeadas e planejadas para fusão
- [ ] 30.2 Documentação de cada componente: uso, quando não usar, props/variantes, acessibilidade, exemplos
- [ ] 30.3 Paridade entre design (Figma/Stitch) e código — divergência tratada como bug (P1)
- [ ] 30.4 Versionamento e política de depreciação com caminho de migração
- [ ] 30.5 Processo de contribuição definido (quem cria componente novo e sob quais critérios)
- [ ] 30.6 Storybook (ou equivalente) com todos os estados de cada componente, incluindo estados de erro
- [ ] 30.7 Teste de regressão visual nos componentes de base
- [ ] 30.8 Lint de design: falha de build para valor de cor/espaçamento fora dos tokens
- [ ] 30.9 Checklist de QA visual antes do merge: navegadores-alvo, densidades de tela, dark mode, 320px, teclado, leitor de tela
- [ ] 30.10 Métricas de adoção do design system acompanhadas (% de UI usando componentes do sistema)

---

## 9. VALIDAÇÃO E MÉTRICAS

Design não é aprovado por opinião. Antes de declarar "bom design", o agente deve indicar **como isso será medido**:

| Método | Quando usar | Sinal de problema |
|---|---|---|
| Avaliação heurística (10 heurísticas de Nielsen) | Sempre, antes de qualquer teste com usuário | ≥3 violações por tela |
| Teste de usabilidade com 5 usuários | Antes de release de fluxo crítico | Task success < 80% |
| Task success rate | Fluxo crítico | < 80% |
| Time on task | Fluxo repetitivo | Acima da baseline do concorrente |
| Error rate / taxa de retrabalho | Formulários | > 10% dos envios com erro |
| SUS (System Usability Scale) | Comparação entre versões | < 68 = abaixo da média |
| Funil de ativação/conversão | Onboarding, checkout | Queda >30% em um passo |
| Tickets de suporte por tela | Produto em produção | Recorrência do mesmo tema |
| Core Web Vitals de campo (CrUX/RUM) | Sempre (web); em mobile, métricas nativas equivalentes | Fora dos limites do Bloco 24 |
| Auditoria automática (axe / Lighthouse) | CI | Qualquer violação crítica |

---

## APÊNDICE A — Leis e heurísticas de referência

Use estes nomes ao justificar um achado (nunca "acho que fica melhor"):

**10 heurísticas de Nielsen:** visibilidade do status do sistema · correspondência com o mundo real · controle e liberdade do usuário · consistência e padrões · prevenção de erros · reconhecimento em vez de memorização · flexibilidade e eficiência · design estético e minimalista · ajudar a reconhecer e recuperar de erros · ajuda e documentação.

**Leis de UX aplicáveis:**
- **Lei de Fitts** — tempo até um alvo depende do tamanho e da distância → alvos maiores e mais perto do ponto de ação
- **Lei de Hick** — mais opções, mais tempo de decisão → reduzir e agrupar
- **Lei de Jakob** — o usuário passa a maior parte do tempo em *outros* produtos → não reinventar padrão consagrado sem ganho claro
- **Lei de Miller** — memória de trabalho limitada (~5–7 itens) → agrupar (chunking)
- **Lei de Tesler** — toda complexidade é irredutível: se não for absorvida pelo sistema, sobra para o usuário
- **Doherty threshold** — resposta em ≤400ms mantém o usuário em fluxo
- **Princípios de Gestalt** — proximidade, similaridade, continuidade, fechamento, figura-fundo, região comum
- **Efeito Von Restorff** — o item diferente é lembrado → use para *uma* ação, não para cinco
- **Posição serial** — início e fim de listas são mais lembrados → colocar o mais importante nas pontas
- **Efeito pico-fim** — a experiência é lembrada pelo pico e pelo fim → cuidar do momento de erro e do momento de conclusão
- **Efeito estética-usabilidade** — o que parece bonito é percebido como mais usável (e esconde problemas reais em teste) → não confiar só na percepção

---

## APÊNDICE B — Anti-padrões (red flags automáticos)

Se o agente encontrar qualquer item abaixo, ele é reportado **sem negociação**:

**Interface**
- Placeholder usado como rótulo
- Botão "Enviar"/"OK" sem verbo específico
- Texto cinza-claro sobre branco abaixo de 4,5:1
- `outline: none` sem substituto de foco
- Ícone sem rótulo em ação não óbvia
- Modal dentro de modal
- Scroll infinito com rodapé necessário
- Carrossel para conteúdo essencial
- Tooltip contendo informação obrigatória
- Estado desabilitado sem explicação
- Mensagem de erro "Algo deu errado" sem causa nem ação
- `z-index: 9999`
- Tela que só funciona com mouse
- Ação destrutiva ao lado da ação primária
- Layout que quebra em 320px
- Loading spinner eterno sem timeout nem fallback

**Ética (dark patterns)**
- Confirmshaming ("Não, prefiro continuar perdendo dinheiro")
- Cancelamento escondido ou por telefone/e-mail obrigatório
- Caixa de consentimento pré-marcada
- "Aceitar tudo" grande × "Configurar" escondido
- Custo revelado só na última etapa (drip pricing)
- Escassez ou contagem regressiva falsa
- Roach motel (fácil entrar, difícil sair)
- Renovação automática sem aviso prévio
- Botão de recusa com contraste propositalmente menor
- Coleta de dado sem finalidade declarada

---

## APÊNDICE C — Números de referência rápida

| Item | Valor |
|---|---|
| Contraste texto normal | ≥ 4,5:1 |
| Contraste texto grande (≥24px ou ≥18,66px bold) | ≥ 3:1 |
| Contraste de componente/ícone essencial e foco | ≥ 3:1 |
| Alvo de toque mínimo (WCAG 2.2 AA) | 24×24 px |
| Alvo de toque recomendado | 44×44 pt (iOS) / 48×48 dp (Android) |
| Espaço entre alvos adjacentes | ≥ 8 px |
| Tamanho mínimo de corpo de texto | 16 px |
| Largura de linha ideal | 45–75 caracteres |
| Line-height de corpo | 1,4–1,6 |
| Base da escala de espaçamento | 4 px (ou 8 px) |
| Itens em navegação principal | 5 ± 2 |
| Feedback percebido como instantâneo | ≤ 100 ms |
| Limite de fluxo (Doherty) | 400 ms |
| Indicador de carregamento a partir de | 1 s |
| Progresso determinado a partir de | 10 s |
| Duração de microinteração | 100–150 ms |
| Duração de transição de componente | 200–300 ms |
| Duração de transição de tela | 300–500 ms |
| Duração de toast | 4–6 s |
| Reflow sem scroll horizontal | 320 px |
| Zoom/resize de texto suportado | 200 % |
| LCP / INP / CLS (p75) | ≤ 2,5 s / ≤ 200 ms / ≤ 0,1 |
| Expansão de texto prevista para i18n | +30–40 % |
| SUS considerado na média | 68 |

---

## APÊNDICE D — Definition of Done de design

Uma tela só é considerada **pronta** quando todos os itens abaixo forem verdadeiros:

1. Todos os **6 estados** existem (vazio, zero-resultados, carregando, erro, sem permissão, sucesso)
2. Funciona **só com teclado**, com foco visível em toda a jornada (mobile: VoiceOver/TalkBack + equivalente visível a todo gesto)
3. Passa em **contraste AA** em tema claro e escuro
4. Íntegra em **320px** e com **zoom 200%** (mobile: menor aparelho alvo + Dynamic Type máximo)
5. Usa **apenas tokens** — zero valor mágico
6. Nenhum dado do usuário se perde em erro, refresh ou navegação
7. Toda ação tem feedback em ≤400ms e rótulo com verbo específico
8. Testada com **dado real no pior caso** (vazio, longo, gigante)
9. Sem nenhum item do Apêndice B
10. Cada decisão não óbvia tem justificativa escrita, com o critério nomeado

---

## 10. REGRAS DE CONDUTA

1. **Nunca** proponha redesenho de identidade visual sem pedido explícito — auditoria ≠ rebranding
2. **Nunca** troque um padrão consagrado por algo original sem apresentar o ganho mensurável (Lei de Jakob)
3. Máximo de **2 alternativas** por problema, com trade-off explícito, e uma recomendação sua
4. Ao corrigir, sempre entregue o **valor exato**: token, px, ms, ratio — nunca adjetivo
5. Se um item do checklist não se aplica, diga por quê; não invente achado para preencher relatório
6. Priorize **acessibilidade e perda de dado** acima de estética em qualquer conflito
7. Se o problema for de produto (fluxo errado, feature desnecessária), sinalize — mas não resolva sozinho: escale para o `/product-manager`
8. Ao final de cada auditoria, registre os padrões que se repetem: problema recorrente vira **item de design system**, não correção pontual
