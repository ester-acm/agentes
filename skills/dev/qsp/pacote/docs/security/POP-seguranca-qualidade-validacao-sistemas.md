# PROCEDIMENTO OPERACIONAL PADRÃO

## Segurança, Qualidade e Validação de Sistemas

**Código / título curto:** POP — Segurança, Qualidade e Validação de Sistemas  
**Versão:** 1.4 (pacote V1.1 — proteção permanente ALWAYS/IMPACT/PERIODIC/HUMAN + Supabomb complementar opcional)  
**Natureza:** Procedimento de processo (generalista). Não substitui a Ficha de Conhecimento e Segurança nem a implementação técnica do Template Técnico.

**Responsável pela execução do POP:** responsável técnico do sistema (ou pessoa designada pela área), com apoio de Desenvolvimento, QA, Infra e Compliance conforme a etapa.

---

## RECURSOS NECESSÁRIOS (ENTRADAS)

| Recurso | Uso |
|--------|-----|
| Repositório do sistema (código, CI, docs) | Fonte técnica |
| Ambientes local / staging / descartável | Testes e correções iniciais |
| Acesso controlado a painéis cloud (quando existirem) | Verificações fora do código |
| Contas de teste por role / escopo | Validação permitida × proibida |
| Ficha de Conhecimento e Segurança do Sistema | Entrada obrigatória de regras e superfícies |
| Template Técnico de Segurança, Qualidade e Validação | Estrutura de pastas, workflows, scripts, testes, QA, PR e automações |
| Template de PR com classificação de impacto | Feature a feature |
| Ferramentas de CI adequadas ao stack | Quality / Security / Performance Gate *(Performance quando aplicável)* |
| Ferramentas de scan adequadas ao stack (cadência própria) | Revisão periódica |

---

## DOCUMENTOS DE REFERÊNCIA

| Documento | Função |
|-----------|--------|
| Este POP | **COMO** o processo funciona |
| Ficha de Conhecimento e Segurança do Sistema *(por projeto)* | **COMO** aquele sistema **DEVE** funcionar |
| Template Técnico de Segurança, Qualidade e Validação | Implementação técnica do processo (pastas, workflows, scripts, testes, QA, PR, scans e automações) |
| Checklist Geral de Segurança, Qualidade e Validação *(quando a empresa fornecer)* | Referência corporativa complementar de critérios — **não** faz parte do pacote operacional obrigatório |
| Política de scans periódicos do time | Cadência e limites de ferramentas externas |

> Implantação do padrão: **POP + Ficha + Template Técnico**. O Checklist Geral pode apoiar auditorias, revisões gerais, conferência e padronização de critérios — sem ser entrada obrigatória da implantação.

---

## ÁREA DE APLICAÇÃO

Aplica-se a **sistemas de software** da organização, conforme a arquitetura de cada produto, podendo incluir:

- web;
- APIs;
- backends;
- mobile;
- desktop;
- serviços;
- workers;
- jobs / background;
- integrações;
- sistemas **sem** frontend.

Em:

1. **implantação inicial** do padrão em um sistema;
2. **desenvolvimento e validação de features** (ciclo PR → Gate → QA);
3. **revisão periódica** do sistema completo.

Adapta-se à arquitetura de cada produto (banco, auth, storage, pagamentos, IA etc.). Controles **quando aplicável** seguem a **Ficha** do sistema e os recursos do **Template Técnico**. Não obrigar categorias ou ferramentas que não se aplicam (**N/A** só com justificativa arquitetural).

**Não se aplica** como autorização para alteração direta em produção durante auditoria inicial.  
A ordem de implantação completa **não** autoriza automaticamente escrita remota (push, PR, ruleset, cloud, secrets, deploy, migration remota) — ver Prompt Mestre.

---

## RESPONSÁVEIS

| Papel | Responsabilidades |
|-------|-------------------|
| **Desenvolvimento / Dev** | Entende o impacto da alteração; implementa; cria ou atualiza testes; corrige falhas; mantém regras críticas protegidas no **backend** (não só na UI). |
| **Automação / CI** | Executa verificações técnicas; bloqueia progressão quando check obrigatório falha; gera evidências automáticas. |
| **QA** | Valida manualmente a feature; executa verificações adicionais conforme o impacto; testa também cenários **proibidos**; revalida correções. |
| **Responsável pelo sistema / Produto** | Valida regras de negócio; esclarece permissões e comportamentos esperados; decide pontos ambíguos. |
| **Infra / responsável técnico** | Valida configurações externas quando aplicável: acessos, ambientes, branch protection, cloud, backups e configs não visíveis no código. |
| **Compliance / responsável** | Participa de LGPD e requisitos regulatórios quando aplicável. |

---

## DESCRIÇÃO DO PROCEDIMENTO

### Princípio central

**Nunca considerar uma funcionalidade segura apenas porque funciona corretamente pela interface.**

Regras críticas devem continuar válidas quando alguém:

- manipula DevTools;
- altera requests;
- modifica IDs;
- chama a API diretamente;
- tenta acessar dados de outro usuário;
- tenta executar ações acima da própria permissão.

Sempre validar os **dois lados**:

- ação **permitida** → deve funcionar;
- ação **proibida** → deve bloquear (preferencialmente no backend / banco / API).

### Proteção permanente (V1.1)

Controle QSP que seja **aplicável**, tenha sido **validado na implantação** e seja **tecnicamente automatizável** **não** pode permanecer só como fotografia na baseline.

Deve ser classificado e ligado a uma frequência:

| Frequência | Uso |
|------------|-----|
| **ALWAYS** | Toda PR (conjunto crítico permanente) |
| **IMPACT** | PR que toca a superfície (paths do mapa) |
| **PERIODIC** | Sweep periódico / pré-release (mais amplo); scanners complementares (ex.: Supabomb em projetos Supabase) |
| **HUMAN** | Somente se não for automatizável |

Artefato do **projeto** (não quarto componente do pacote): **mapa permanente de cobertura QSP** (`docs/security/QSP-COVERAGE-MAP.md` + `qsp-coverage-map.json`).

```
teste só na implantação local ≠ proteção permanente
marker/grep ≠ substituto de runtime quando runtime for viável no CI
```

**Coverage drift:** nova superfície sensível sem entrada no mapa → **COVERAGE GAP** → NÃO READY FOR QA.

**QSP Gate (agregador):** check final obrigatório; falha se obrigatório falhou, cancelou, skipped indevido, não configurado ou coverage gap.  
QSP Gate verde ≠ zero bugs — só “controles exigidos para esta alteração executados e OK”.

**Branch protection:** implantação REAL exige exigir o QSP Gate (ou equivalentes) na branch principal — senão a proteção de merge permanece INCOMPLETA (🔎 humana).

---

### Arquitetura dos documentos

| Documento | Função |
|-----------|--------|
| **POP** (este) | Processo — quem faz, quando faz, o que acontece se falhar, quando termina. |
| **Ficha** | Comportamento esperado do sistema (regras de negócio e superfícies). |
| **Template Técnico** | Implementação técnica do processo (CI, testes, QA, PR, automações). |
| **Checklist Geral** | Referência corporativa complementar (auditorias, revisões, conferência, padronização de critérios). |

---

### Ficha de Conhecimento e Segurança do Sistema (entrada obrigatória)

Antes de implantar o padrão ou de auditar em profundidade, o sistema deve possuir (ou iniciar) uma **Ficha de Conhecimento e Segurança** registrando, no mínimo:

- objetivo do sistema;
- tipos de usuário;
- roles;
- permissões;
- quem pode ver / alterar / excluir / moderar o quê (incluindo mídia e anexos, quando houver);
- vínculo entre ação e recurso;
- fronteiras de isolamento (usuário, tenant, setor, organização etc.);
- jobs / crons (quem dispara, autenticação, fail-closed);
- dados relevantes;
- uploads;
- pagamentos;
- integrações e requisitos de contrato/DPA quando aplicável;
- efeitos externos de CI/PR (Apps, previews), quando conhecidos;
- dados sensíveis;
- fluxos críticos;
- comportamentos **proibidos**.

Análise automática (ferramentas / agentes) **pode ajudar a preencher** a ficha.  
**Regras de negócio ambíguas não podem ser decididas pela IA.**

**Checkpoint humano obrigatório:** a Ficha deve estar **VALIDADA** pelo responsável do sistema antes da implantação técnica completa.

Após a Ficha VALIDADA, a implantação técnica (Quality, Security, Performance, Gate, baseline, evidências) deve seguir de forma **contínua**. Ações humanas **não bloqueantes** (secrets, painéis, branch protection, Compliance, etc.) são **acumuladas** e apresentadas em **uma** lista consolidada no fechamento — não como interrupção a cada item.

Se houver dúvida de negócio **indispensável** e não resolvida na Ficha:

```
PARAR
→ registrar a dúvida
→ solicitar validação do responsável pelo sistema / Produto
→ somente depois continuar
```

> O modelo oficial da Ficha deve acompanhar a implantação deste POP. Validação humana da Ficha é o grande checkpoint antes das correções baseadas em regras de negócio.

### Validação local / lab × implantação real

| Escopo | O que comprova | O que NÃO substitui |
|--------|----------------|---------------------|
| **Validação técnica local / lab** | Controles no código, testes, Gate executando (Quality/Security/Performance), baseline | Proteção real de `main`, secrets de produção, migrate/deploy remoto |
| **Implantação real** | Branch protection, secrets, configs externas, fluxo PR→merge→deploy do time | — |

Um **laboratório isolado** pode comprovar que o Gate funciona (verde → vermelho controlado → verde). Isso **não** substitui a proteção da branch principal nem o deploy.

**Nunca** declarar o sistema “100% seguro” ou “invulnerável”. Use: padrão implantado / baseline validada **dentro do escopo e controles executados**.

**CONFIGURADO ≠ VALIDADO.** Workflow criado, teste escrito, scanner configurado, policy existente ou script de Performance existente **não** equivalem a pilar ✅ VALIDADA. Validação exige execução dos controles aplicáveis e evidência suficiente.

---

### Segurança em sistemas já em produção

A implantação inicial do processo **não** deve começar corrigindo diretamente a produção.

```
branch / clone
→ ambiente local / staging / descartável
→ mapear
→ testar
→ reproduzir
→ corrigir
→ testar novamente
→ PR
→ QA
→ deploy normal
```

- Objetivo: **reduzir risco de regressão**.
- Nenhum processo garante **risco zero**.
- **Não** realizar mudanças diretas em produção como parte da auditoria inicial.
- Credenciais privilegiadas e operações destrutivas **fora** de scanners manuais e do CI de PR.

---

### 1. Implantação inicial em um sistema

**Quando:** sistema novo no padrão, ou sistema legado que passa a adotar o processo.  
**Quem:** Dev + responsável técnico, com Produto (regras), Infra e Compliance conforme necessidade.

```
Conhecer + mapear PRELIMINARMENTE → pré-preencher Ficha → EM VALIDAÇÃO
→ validação humana → Ficha VALIDADA
→ aprofundar mapeamento técnico
→ Security / Quality / Performance (inventários amplos; execução + evidência)
→ testes / correções / regressões
→ Gate / periódico / baseline
→ Lista consolidada de ações humanas restantes
→ Fluxo normal de features
```

**Não** fazer auditoria técnica profunda nem correções **antes** da Ficha **VALIDADA**. A análise preliminar serve **apenas** para preencher corretamente a Ficha.

| Passo | O que fazer | Se falhar |
|-------|-------------|-----------|
| 1. Conhecer + mapear preliminarmente | Arquitetura, stack, superfícies — só o necessário para a Ficha | Parar e reunir insumos |
| 2. Pré-preencher a Ficha | Evidências; inferências do código → pendente de validação → **EM VALIDAÇÃO** | Dúvida de negócio → validação humana |
| 3. Humano valida | Esclarece regras necessárias | — |
| 4. **Checkpoint:** Ficha VALIDADA | Único grande checkpoint humano obrigatório de negócio antes das correções | Sem VALIDADA → não implantar tecnicamente |
| 5. Aprofundar mapeamento técnico | Inventário amplo Security (+ Performance quando aplicável); gaps Ficha × código | Completar mapa antes de testar em massa |
| 6. Security / Quality / Performance | Controles aplicáveis **executados** e evidenciados (CONFIGURADO ≠ VALIDADO) | Lacunas → backlog priorizado; sem evidência → não ✅ |
| 7. Criar e executar testes | Conforme regras e riscos **daquele** sistema | Sem número fixo obrigatório; teste escrito ≠ executado |
| 8. Executar em ambiente seguro | Local / staging / descartável / lab | Não “consertar” produção; sem escrita remota automática |
| 9. Corrigir em pequenos blocos | Backend primeiro; UI não é a única barreira | Correção sem prova → incompleta |
| 10. Reexecutar testes / regressões | Confirmar verde nos cenários críticos | Vermelho → voltar ao passo 9 |
| 11. Gate / periódico / baseline / **mapa QSP** | Controles automatizáveis classificados ALWAYS/IMPACT/PERIODIC/HUMAN; QSP Gate agregador; coverage drift; periódico ampliado; baseline | Placeholder PASS → inválido; controle só na baseline → incompleto |
| 12. Ações humanas consolidadas | Lista **única** de 🔎 restantes (push, ruleset, secrets, deploy, etc.) | — |
| 13. Liberar fluxo normal | Features seguem seções 2–4; sistema entra na seção 5 | Proteção de `main` e deploy = implantação real (humana) |

### Critério para encerramento da implantação inicial

Não basta: Ficha VALIDADA + baseline + workflows criados + pilares verdes **só localmente**.

Exigir, **conforme aplicável**:

- Ficha **VALIDADA**;
- Security / Quality / Performance avaliadas e **evidenciadas** (inventário amplo + execução);
- **Mapa permanente de cobertura QSP** gerado no projeto;
- Controles **automatizáveis** classificados ALWAYS / IMPACT / PERIODIC / HUMAN;
- Controles críticos ligados ao Gate (ALWAYS + IMPACT);
- Runtime Security no CI **quando** ambiente descartável for tecnicamente viável (não só markers);
- Coverage drift no Gate;
- **QSP Gate** agregador adaptado;
- Periódico ampliado reutilizando o mapa;
- Nenhuma superfície automatizável importante ficou **somente** como validação pontual da implantação;
- baseline **registrada**;
- riscos técnicos **bloqueantes** tratados (ou com tratamento definido);
- ações humanas restantes **consolidadas** (inclui branch protection para enforcement real).

Usar fechamento **limitado ao escopo validado**.

Implantação **REAL** (proteção de merge) ainda exige enforcement remoto da branch + ações HUMAN aplicáveis.

Itens parciais ou pendentes podem permanecer registrados no baseline quando não forem classificados como bloqueantes.

Vulnerabilidades Critical / High **não** significam automaticamente bloqueio universal. **Porém**, se forem **confirmadamente exploráveis / relevantes** no contexto daquele sistema — especialmente autenticação, autorização, isolamento, credenciais ou acesso indevido — classificá-las como possível **bloqueante** conforme risco, com tratamento definido e priorizado antes de considerar a implantação inicial concluída.

Quando o sistema já estiver em produção, a identificação de um risco bloqueante não autoriza correção direta ou não controlada em produção. O tratamento deve seguir o fluxo seguro:

reproduzir → corrigir em ambiente adequado → testar → PR → Gate → QA → deploy normal.

**Fim do procedimento 1:** critério de encerramento acima atendido no escopo validado + lista de ações humanas restantes.

---

### 2. Desenvolvimento e validação de uma feature

**Quando:** toda alteração relevante entregue via PR.  
**Quem:** Dev → Automação/CI → QA → aprovação conforme política do repositório.

Na rotina de features, devem ser validados apenas os controles relacionados aos **impactos declarados** da alteração (PR). Não é necessário reexecutar uma régua corporativa completa a cada PR.

```
Dev
→ PR
→ Gate
→ READY FOR QA
→ QA
→ Aprovação
→ Merge / Deploy
```

#### 2.1 Dev desenvolve e identifica impactos

Na PR, declarar se a alteração toca:

- interface;
- regra de negócio;
- autenticação;
- roles;
- permissions;
- banco;
- RLS / policies (ou equivalente);
- API / RPC / backend;
- Storage / uploads;
- secrets / configuração;
- pagamentos;
- IA;
- LGPD / dados pessoais;
- Jobs / crons / background;
- Integrações externas / webhooks;
- performance;
- infraestrutura.

O Dev cria ou atualiza testes das regras afetadas **quando tecnicamente possível**.

#### 2.2 Quality / Security / Performance Gate (antes do QA)

Verificações automáticas em camadas + **agregador** (adaptar ao stack):

| Camada | Objetivo | Frequência |
|--------|----------|------------|
| **A. Qualidade** | Código saudável | ALWAYS (lint/typecheck/test/build/secrets quando aplicável) |
| **B. Segurança** | Acesso/proteção | ALWAYS (regressões unitárias/markers) + **IMPACT** runtime (RLS/Storage/Edge/RPC) quando paths tocados e ambiente descartável viável |
| **C. Performance** | Regressão | ALWAYS (conjunto crítico) + IMPACT (DB/API/Edge/FE conforme mudança) |
| **D. Coverage** | Mapa QSP atualizado | ALWAYS (drift) |
| **E. QSP Gate** | Agrega resultados | ALWAYS — único check “final” típico na branch protection |

**Regra do Gate**

```
CHECK OBRIGATÓRIO FALHOU / CANCELADO / SKIPPED INDEVIDO / COVERAGE GAP / NÃO CONFIGURADO
→ NÃO ESTÁ READY FOR QA
→ VOLTA PARA O DEV

QSP Gate verde (controles exigidos executados e OK)
→ READY FOR QA
```

Skip de job IMPACT só é aceitável quando o **mapa de impacto** justificar que o controle não se aplica à PR.

**“Gate verde”** = verificações **exigidas** foram **executadas** e passaram.  
**Não** significa sistema invulnerável. Workflow criado ≠ Gate validado.  
Markers **não** substituem runtime quando runtime for viável.

#### 2.3 Critérios de bloqueio (não seguir para aprovação)

- check obrigatório vermelho;
- falha de autenticação / autorização relacionada à feature;
- falha de isolamento de dados;
- secret privado exposto;
- teste crítico quebrado;
- regressão de performance classificada como bloqueante;
- vulnerabilidade Critical / High relacionada, confirmadamente explorável/relevante no contexto, e não tratada (conforme política da equipe);
- QA reprovado.

**Fim do procedimento 2 (caminho feliz):** Gate verde → QA aprovado → merge / deploy pelo processo normal do sistema.

---

### 3. Validação manual do QA

**Quando:** após **READY FOR QA**.  
**Quem:** QA (com apoio do Dev para reprodução).

Sempre validar:

- funcionalidade principal;
- estados de erro;
- loading;
- comportamento visual / responsivo quando aplicável;
- logs / console / network / observabilidade adequada ao stack, quando aplicável.

Conforme o **impacto** declarado na PR:

| Impacto | Foco do QA |
|---------|------------|
| Auth / roles | Permitido × proibido; URL / API direta; tentativa de contornar UI |
| Dados / isolamento | User A × User B; escopo correto; acesso direto |
| Storage | Upload; download; acesso proibido; arquivo de outro usuário |
| Pagamento | Manipulação de preço / plano; confirmação server-side; falhas |
| Performance | Regressões perceptíveis; métricas automáticas disponíveis |

Quando necessário aprofundar critérios técnicos, pode-se consultar o Checklist Geral como **referência complementar**.

**Fim do procedimento 3:** aprovação do QA **ou** retorno ao Dev com cenário reproduzível.

---

### 4. Tratamento de falhas e vulnerabilidades

**Quando:** achado no Dev, Gate, QA, scanner (incl. Supabomb quando aplicável) ou incidente.  
**Quem:** quem encontrou documenta; Dev corrige; Automação comprova; QA revalida.

```
ACHADO
→ REPRODUZIR
→ CLASSIFICAR
→ DEV CORRIGE
→ CRIAR TESTE DE REGRESSÃO QUANDO POSSÍVEL
→ GATE RODA NOVAMENTE
→ QA REVALIDA
→ APROVAÇÃO
```

**Classificação sugerida do achado:** confirmado · provável · falso positivo · intencional / decisão de negócio · precisa análise.

Um problema **não** deve apenas ser corrigido. Sempre que tecnicamente possível, deve virar **teste de regressão permanente** **e** entrada no mapa QSP (ALWAYS/IMPACT/PERIODIC).

**Fim do procedimento 4:** correção comprovada (Gate + QA) e regressão registrada quando possível.

---

### 5. Validação periódica do sistema

**Quando:** em cadência definida pelo time **e** em gatilhos de risco.  
**Quem:** Automação + responsável técnico; scanners conforme política; Produto / Compliance quando LGPD ou regra de negócio.

PRs **não** substituem revisão do sistema completo.

```
Rotina periódica
→ Scanners
→ Revisão geral
→ Novos riscos
→ Novos testes
```

#### A. Rotina automática periódica

Reutilizar o **mapa QSP** do projeto e executar cobertura **mais ampla** que a PR: Quality; Security runtime (RLS/DB/Edge/Storage/RPC/jobs quando aplicável); secrets; dependências; Performance ampla; coverage drift de repositório; checklist HUMAN. Módulos obrigatórios ainda não adaptados **não** podem concluir em verde (fail-closed / `NÃO CONFIGURADO`).

#### C. Revisão geral ampliada

Disparar quando houver, por exemplo: release importante; mudança de arquitetura; novo tipo de usuário; nova integração; pagamento; upload; IA; novos dados pessoais; alteração relevante de autenticação; incidente ou vulnerabilidade importante.

Novos riscos identificados → alimentam **novos controles e testes** + **atualização do mapa QSP** (e da Ficha quando o esperado de negócio mudar).

**Fim do procedimento 5:** relatório periódico (ou registro equivalente) + backlog de ações + testes atualizados quando necessário.

---

### Evidências do processo

Gerar e guardar evidências rastreáveis quando aplicável:

- PR;
- resultado dos checks;
- testes;
- relatório / parecer do QA;
- relatório de scanner;
- relatório periódico;
- decisão de negócio;
- evidência de configuração (painel / infra).

**Não** registrar em documentos versionados: passwords; tokens; secrets; dados pessoais desnecessários.

---

## INFORMAÇÕES NECESSÁRIAS

Para executar este POP, o executor precisa ter acesso ou conhecimento de:

1. repositório e branch de trabalho;
2. arquitetura e stack;
3. ambientes (local, staging, produção) e regras de uso;
4. regras do sistema (Ficha);
5. roles / permissões;
6. integrações;
7. banco e modelo de autorização de dados;
8. armazenamento / uploads (se houver);
9. dados pessoais e contatos de Compliance (se aplicável);
10. nomes dos responsáveis (Dev, QA, Produto, Infra);
11. Template Técnico (ou equivalente no repositório);
12. política de Gate e de scans do time.

---

## RESULTADOS ESPERADOS (SAÍDAS)

| Saída | Descrição |
|-------|-----------|
| Sistema mapeado | Arquitetura e superfícies conhecidas |
| Ficha preenchida / atualizada | Regras e proibições explícitas |
| Mapa permanente de cobertura QSP | Controles ALWAYS/IMPACT/PERIODIC/HUMAN no projeto |
| QSP Gate + periódico | Proteção permanente das próximas alterações |
| Riscos identificados | Lista priorizada |
| Testes correspondentes | Adequados às regras e riscos **daquele** sistema (sem número fixo universal) |
| Automações configuradas | Gate de PR + rotina periódica |
| Feature com Gate antes do QA | READY FOR QA só com checks obrigatórios verdes |
| QA orientado pelo impacto | Sem repetir o universo inteiro a cada PR |
| Regressão após vulnerabilidade | Quando tecnicamente possível |
| Evidências rastreáveis | Sem secrets / PII desnecessária |
| Revisão periódica em curso | Sistema completo além das features |
| Processo reutilizável | Aplicável a outros projetos com adaptação de stack |

---

### Fluxos resumidos (consulta rápida)

**Fluxo 1 — Implantação inicial**

```
Mapear preliminarmente → Ficha EM VALIDAÇÃO → VALIDADA (humano)
→ Aprofundar mapeamento → Security / Quality / Performance → Gate / periódico / baseline
→ Ações humanas restantes (lista única)
→ Fluxo normal de features
```

**Fluxo 2 — Feature**

```
Dev → PR → Quality / Security / Performance Gate (Performance quando aplicável)
→ READY FOR QA → QA → Aprovação → Merge / Deploy
```

**Fluxo 3 — Periódico**

```
Rotina periódica (sweep ampliado) → Scanners → Revisão geral → Novos riscos → Novos testes
```

---

*Fim do POP. Processo: POP. Regras do produto: Ficha de Conhecimento e Segurança. Implementação técnica: Template Técnico. Checklist Geral: referência corporativa complementar.*
