# QSP no ecossistema da equipe

Isto **não** é um 13º especialista. Não segura bastão. Não escreve feature.

É a camada que continua protegendo o produto **depois** que o agente desligou.

```
Agentes constroem          Máquina julga a PR          QA humano libera
(/equipe, 12 ofícios)  →   (QSP Gate no CI)        →   (/qa-senior)
```

Fonte do pacote (POP, Ficha, workflows, scripts): `skills/dev/qsp/pacote/` **neste repo**, ou na máquina:

| Onde você está | Leia o contrato em |
|----------------|-------------------|
| Repo `agentes` | `skills/dev/qsp/ECOSSISTEMA.md` |
| Cursor (qualquer produto) | `C:\Users\DULINO\.cursor\skills\qsp\ECOSSISTEMA.md` |
| Claude Code (qualquer produto) | `C:\Users\DULINO\.claude\skills\qsp\ECOSSISTEMA.md` |

Se o workspace **não** tem `skills/dev/qsp/`, use o caminho global. Não copie os 12 ofícios para o produto.

Laboratório (só no repo agentes): `labs/qsp-ecossistema/` — `node demo.mjs`.

---

## Em uma frase

O time **faz** a mudança. O QSP **pergunta se o sistema ainda está saudável**. O QA **só entra** se a máquina disse sim.

---

## Dois momentos (não misturar)

### 1. Primeira vez no produto (implantação)

O `/equipe` vê que **não existe** `docs/security/qsp-coverage-map.json`.

1. `/engenheiro-seguranca` preenche o **técnico** da Ficha (stack, o que existe, como auth/jobs/CI funcionam).
2. `/product-manager` preenche o **negócio** a partir do projeto (roles, matriz, isolamento, proibições). Cada célula: `produto` | `código-inferida` | `suposição`. Não deixa permissão “em aberto” se o repo responde.
3. **Para.** Humano **valida ou corrige** e marca a Ficha **VALIDADA** (agente não faz isso).
4. Segurança + devops instalam mapa real, testes, workflow `PR QSP Gate`, periódico.
5. A partir daí o QSP vive no **repo**, não na sessão.

Correção de negócio **antes** da Ficha VALIDADA é proibida (Prompt Mestre).

### 2. Toda alteração depois (feature, bugfix, G7 daqui a 6 meses)

```
Dev/agente altera código
  → se nasceu superfície nova: atualiza o mapa + teste
  → commit + abre PR
QSP Gate (CI)
  → ALWAYS (barato, toda PR)
  → IMPACT (caro, só o que a PR tocou)
  → drift (superfície nova sem mapa = vermelho)
  → agregador: READY FOR QA ou volta pro Dev
/qa-senior
  → só com Gate verde
merge
  → branch protection exige o check "QSP Gate"
/engenheiro-devops
  → deploy (ainda com autorização humana)
```

O agente **não** reanalisa o sistema inteiro. O diff da PR decide o IMPACT.

---

## O que cada ofício faz

| Quem | Papel no QSP |
|------|----------------|
| `/equipe` | Detecta “sem QSP”; não declara ciclo fechado sem Gate; não despacha um “agente QSP” |
| `/engenheiro-seguranca` | **Implantação** (1ª vez) ou **ciclo** (audita a fatia + atualiza mapa se superfície nova) |
| `/engenheiro-devops` | Um CI só: required check = **QSP Gate**; periódico; ruleset (🔎 humano) |
| `/dev-senior` / eng. produto | Superfície nova ⇒ mapa + teste. Preflight local antes de “pronto pra PR” |
| `/tester` | Regressão da Ficha entra na suíte **e** no mapa (id ALWAYS/IMPACT) |
| `/engenheiro-performance` | Budget vira controle no mapa, não só `docs/perf/` |
| `/qa-senior` | Sem Gate verde **não começa** QA de produto |
| `/product-manager` | Preenche o **negócio** da Ficha a partir do projeto; humano só valida. Não deixa matriz em branco. |
| `/consolidar` | Grava no canvas os campos QSP se o handoff trouxer; não julga o Gate |

---

## Três verdades no EQUIPE.md (não colapsar)

| Campo | Significado |
|-------|-------------|
| Prova de ciclo | Tester + segurança **desta sessão**: pode abrir PR |
| QSP Gate | Máquina na PR: **READY FOR QA** |
| Veredito `/qa-senior` | QA de produto **depois** do Gate: APROVADA / REPROVADA |

APROVADA local **não** autoriza merge. Merge exige Gate verde + QA + protection.

---

## Proibido

- Transformar o QSP em skill que “segura o bastão”.
- Pedir a um LLM para julgar a PR no lugar do CI.
- Reimplantar o padrão a cada feature.
- Marcar Ficha VALIDADA sem humano.
- Placeholder de CI que dá PASS (fail-closed).
- Dois CIs de qualidade em paralelo (o antigo `lint-test-build` **é** o ALWAYS do Gate).

---

## Artefatos no produto (não neste repo de skills)

| Arquivo | Quem gera |
|---------|-----------|
| `docs/security/FICHA-conhecimento-seguranca-sistema.md` | Segurança (técnico) + PM (negócio); humano valida |
| `docs/security/qsp-coverage-map.json` | Segurança na 1ª vez; Dev depois |
| `.github/workflows/pr-qsp-gate.yml` | Devops, a partir do example do pacote |
| `.github/workflows/periodic-qsp.yml` | Devops |

O `coverage/qsp-coverage-map.example.json` do pacote **nunca** é o mapa do produto.
