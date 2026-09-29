# QA por feature (template)

```
POP + Ficha          → processo e comportamento esperado
PR (impacto)         → o que mudou nesta feature
AUTOMAÇÃO (Gate)     → o que a máquina prova
QA                   → só o aplicável ao impacto
REVISÃO PERIÓDICA    → sistema como um todo
```

Fluxo: Dev → PR → Gate → vermelho=Dev · verde=`READY FOR QA` → QA → (bug? → Dev + regressão) → aprovação.

## READY FOR QA

QA **só inicia** com **QSP Gate** verde (agregador ALWAYS + IMPACT exigidos + coverage drift OK).

| Camada | Obrigatório? |
|--------|----------------|
| Quality (ALWAYS) | SIM (aplicável ao stack) |
| Security ALWAYS + IMPACT exigidos | SIM |
| Performance ALWAYS + IMPACT exigidos | SIM quando o pilar for aplicável |
| Coverage drift | SIM |
| QSP Gate | SIM (check final) |

Skip IMPACT só com justificativa do mapa.  
QSP Gate verde ≠ sistema invulnerável. Configurado ≠ validado.

## A. Sempre

- Fluxo do Summary
- UI / responsivo se mexeu em interface
- Erros / loading / vazio relevantes
- Logs / console / network / observabilidade adequada ao stack, quando aplicável
- Gate verde **antes** de validar (checks **executados**)

## B. Auth / roles / permissions

- Permitido consegue; não permitido é bloqueado
- Tentar pela URL / API / Network (não só UI)
- Alterar IDs / parâmetros (IDOR) quando fizer sentido
- Confirmar authz no **recurso** (não só “usuário logado”)
- Esconder botão **não** é a única proteção

## C. Dados / isolamento

- User A ≠ User B (ou tenant / escopo equivalente)
- Anon / sem auth sem acesso a dados sensíveis
- Operações fora do escopo falham no backend

## D. Storage / uploads *(quando aplicável)*

- Upload / download só no escopo
- Tipos / tamanhos rejeitados quando inválidos
- Arquivo de outro usuário inacessível
- Sem URL pública acidental de objeto privado

## E. Secrets / config

- Nada privado no client / Network / bundle
- Só chaves públicas destinadas ao client

## F. Pagamentos *(quando aplicável)*

- Preço / plano não manipuláveis no client
- Benefício só após confirmação confiável
- Sem dados de cartão no seu client/servidor indevidos

## G. IA *(quando aplicável)*

- Escopo de dados / isolamento
- Sem ações proibidas via ferramenta do modelo

## H. Performance *(quando aplicável)*

- Regressão perceptível
- Métricas do job de Performance, se existir

## Bug / vulnerabilidade

```
QA encontra → registra cenário reproduzível
→ DEV corrige
→ teste de regressão quando possível
→ Gate verde de novo
→ QA revalida
```

Critérios técnicos adicionais (opcional): Checklist Geral da empresa como referência complementar.
