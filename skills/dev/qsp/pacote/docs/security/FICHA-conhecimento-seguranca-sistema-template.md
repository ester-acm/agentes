# FICHA DE CONHECIMENTO E SEGURANÇA DO SISTEMA

**Natureza:** modelo padrão preenchível — registra como o sistema **DEVE** funcionar (negócio, usuários, dados e regras críticas).  
**Não é:** auditoria · checklist de segurança · POP · documentação técnica completa · relatório de vulnerabilidades.

---

## 1. Identificação

| Campo | Preenchimento |
|-------|----------------|
| Nome do sistema | |
| Objetivo | |
| Responsável pelo sistema | |
| Responsável técnico | |
| Stack principal | |
| Ambientes | |
| Status da ficha | RASCUNHO / EM VALIDAÇÃO / VALIDADA |
| Data da última atualização da ficha | |
| Mapa QSP do projeto (pós-implantação) | `docs/security/qsp-coverage-map.json` (artefato técnico — não substitui esta Ficha) |

---

## 2. Visão geral

Respostas curtas (Sim / Não / breve descrição).

| Pergunta | Resposta |
|----------|----------|
| O que o sistema faz? | |
| Quem utiliza? | |
| Quais são os principais fluxos? | |
| Existe frontend? | |
| Existe backend / API? | |
| Existe banco? | |
| Existe autenticação? | |
| Existe Storage / upload? | |
| Existe pagamento? | |
| Existe IA? | |
| Existem integrações externas? | |
| Trata dados pessoais? | |

---

## 3. Tipos de usuário / roles

| Role | Quem é | Escopo | Observação |
|------|--------|--------|------------|
| | | | |
| | | | |
| | | | |

Replicar o bloco abaixo para cada role existente.

### [NOME DA ROLE]

**PODE:**
- …
- …

**NÃO PODE:**
- …
- …

---

## 4. Matriz de permissões

Marcar permitido / negado / condicional e descrever a regra em linguagem de negócio.

| Ação / Recurso | Role 1 | Role 2 | Role 3 | Regra | Fonte / validação |
|----------------|--------|--------|--------|-------|-------------------|
| Visualizar recurso | | | | | |
| Criar | | | | | |
| Editar | | | | | |
| Excluir | | | | | |
| Administrar usuários | | | | | |
| Alterar permissões | | | | | |
| Acessar relatórios | | | | | |
| Acessar configurações | | | | | |
| *(adicionar linhas conforme o produto)* | | | | | |

*(Fonte / validação — exemplos: responsável pelo produto; documentação funcional; decisão aprovada; requisito formal.)*

**Orientação transversal:** se uma regra crítica for inferida **somente** do código → marcar como **inferida / pendente de validação**. Código implementado **nunca** substitui fonte de regra de negócio.

---

## 5. Isolamento de dados

**Qual é a fronteira real de isolamento?**  
*(marcar / descrever o que se aplica)*

- [ ] usuário  
- [ ] organização  
- [ ] tenant  
- [ ] escola  
- [ ] turma  
- [ ] setor  
- [ ] empresa  
- [ ] projeto  
- [ ] outro: _______________

**Usuário / escopo A pode visualizar:**  
…

**Usuário / escopo A NÃO pode visualizar:**  
…

| Cenário | Permitido? (Sim / Não / N/A) | Observação |
|---------|------------------------------|------------|
| User A → dados próprios | | |
| User A → dados de User B | | |
| Tenant / org / setor A → Tenant / org / setor B | | |

---

## 6. Dados e recursos principais

| Recurso / dado | Quem lê | Quem cria | Quem altera | Quem exclui | Sensível? |
|----------------|---------|-----------|------------|-------------|-----------|
| | | | | | |
| | | | | | |
| | | | | | |

*(Exemplos de tipos de recurso — adaptar ao produto: usuários, tickets, pedidos, documentos, arquivos, relatórios, pagamentos, dados administrativos.)*

---

## 7. Autenticação

| Pergunta | Resposta |
|----------|----------|
| Como usuários são criados? | |
| Existe signup público? | |
| Quem pode criar usuários? | |
| Como funciona login? | |
| Existe MFA? | |
| Como funciona recuperação de senha? | |
| Como funciona logout? | |
| Existe expiração / inatividade? | |
| Há ações que exigem reautenticação? | |
| Como usuário é desativado / bloqueado? | |
| Quem pode reativar? | |
| O que acontece com sessões existentes quando o usuário é desativado? | |
| Mudança crítica de senha / role / privilégio deve invalidar sessões existentes? | |

---

## 8. Ações administrativas

| Item | Preenchimento |
|------|----------------|
| Quais ações são administrativas? | |
| Quais roles podem executá-las? | |
| Quais ações são consideradas críticas? | |
| Quais ações nunca devem ser executadas por usuário comum? | |

---

## 9. Uploads / Storage

> Se não houver: **NÃO SE APLICA**

| Pergunta | Resposta |
|----------|----------|
| Que arquivos podem ser enviados? | |
| Por quem? | |
| Quem pode visualizar? | |
| Quem pode excluir? | |
| Arquivos são públicos ou privados? | |
| Existe vínculo obrigatório entre arquivo/mídia e o recurso de negócio? | |
| Quem pode excluir ou moderar mídia/anexo — e sob qual vínculo ao recurso? | |
| Existem limites relevantes (tipo, tamanho, etc.)? | |

---

## 10. Pagamentos

> Se não houver: **NÃO SE APLICA**

| Pergunta | Resposta |
|----------|----------|
| Quem paga? | |
| Qual recurso / benefício é liberado? | |
| Quando é liberado? | |
| Quais planos existem? | |
| Qual é a fonte de verdade do pagamento? | |
| Cancelamento / estorno afeta quais permissões? | |

---

## 11. IA / automações inteligentes

> Se não houver: **NÃO SE APLICA**

| Pergunta | Resposta |
|----------|----------|
| Que dados são enviados ao modelo? | |
| Quem pode utilizar? | |
| Existem quotas? | |
| Existem documentos / RAG? | |
| Há isolamento entre usuários? | |
| O modelo pode executar ações? | |
| Quais ações são proibidas? | |
| Existe DPA / contrato / requisito de Compliance com o provedor? (Sim / Não / Pendente / N/A) | |
| Quem confirma o status de Compliance? | |

---

## 12. Integrações externas

Não registrar secrets, tokens ou senhas.

| Integração | Finalidade | Dados enviados | Dados recebidos | Criticidade | DPA / contrato (Sim/Não/Pendente/N/A) |
|------------|------------|----------------|-----------------|-------------|----------------------------------------|
| | | | | | |
| | | | | | |

| Pergunta | Resposta |
|----------|----------|
| Existem webhooks / callbacks recebidos? | |
| Quem / qual sistema está autorizado a provocar esses eventos? | |

---

## 12b. Jobs / crons / processamento em background

> Se não houver: **NÃO SE APLICA**

| Pergunta | Resposta |
|----------|----------|
| Quais jobs/crons existem? | |
| Quem ou o que pode dispará-los? | |
| Qual mecanismo de autenticação (secret, IAM, rede interna, etc.)? | |
| Sem credencial válida o job deve falhar fechado (fail-closed)? | |
| Um usuário autenticado comum pode disparar o job privilegiado? | |
| O job usa credencial administrativa / service role? | |
| Quais side-effects o job provoca (e-mail, escrita em massa, chamadas externas)? | |

---

## 12c. Autorização ligada a recurso

| Pergunta | Resposta |
|----------|----------|
| Para exclusão/moderação/alteração sensível: a autorização exige vínculo com o recurso alvo (não só “estar logado”)? | |
| É aceitável operar só com ID “solto” de objeto externo (arquivo, vídeo, documento) sem amarrar ao recurso de negócio? | |
| Quem pode excluir ou moderar conteúdo criado por outro usuário? | |

---

## 12d. Repositório / CI / efeitos externos de PR

> Informativo para implantação do padrão — não substitui docs de infra.

| Pergunta | Resposta |
|----------|----------|
| Existem GitHub Apps / integrações que disparam em push ou PR? | |
| Há preview deploy (Pages, Vercel, Netlify, etc.)? | |
| Há preview de banco / branch efêmera (ex.: provider de backend)? | |
| Esses efeitos são PRODUÇÃO, PREVIEW, CI ou SIDE-EFFECT? | |

---

## 13. Dados pessoais / sensíveis

Visão operacional. Análise completa de LGPD: Checklist Geral.

| Pergunta | Resposta |
|----------|----------|
| Quais dados pessoais existem? | |
| Quais são mais sensíveis? | |
| Quem pode acessá-los? | |
| Existem dados de crianças / adolescentes? | |
| Existem dados financeiros? | |
| Existem dados enviados a terceiros? | |

---

## 14. Fluxos críticos

Replicar o bloco para cada fluxo crítico.

### Fluxo crítico: [nome]

| Campo | Preenchimento |
|-------|----------------|
| Quem inicia | |
| Pré-condição | |
| Etapas principais | |
| Resultado esperado | |
| Quem pode executar | |
| Quem NÃO pode executar | |
| O que seria considerado falha grave? | |

*(Exemplos genéricos de fluxo — adaptar: criação de usuário; alteração de role; exclusão; pagamento; upload; acesso a dado sensível.)*

---

## 15. Comportamentos proibidos

**Estas são situações que nunca devem acontecer.**

Adaptar: remover o que não se aplica e incluir regras específicas do produto.

- [ ] User comum consegue executar ação administrativa  
- [ ] User A acessa dado privado de User B  
- [ ] Tenant / escopo A acessa Tenant / escopo B  
- [ ] Usuário altera a própria role / privilégio  
- [ ] Usuário executa ação privilegiada só por estar autenticado (sem authz no recurso)  
- [ ] Job/cron privilegiado dispara sem secret / com token de usuário comum  
- [ ] Secret privado chega ao frontend  
- [ ] Recurso pago é liberado sem pagamento confirmado  
- [ ] Arquivo privado / mídia é acessado ou apagado sem autorização no recurso  
- [ ] Side-effect em provider externo ocorre sem autorização prévia  
- [ ] *(adicionar regra específica)*  

---

## 16. Decisões de negócio / exceções

Registros intencionais — para não tratar decisão de produto como vulnerabilidade automática.

| Decisão | Motivo | Responsável que aprovou | Data |
|---------|--------|-------------------------|------|
| | | | |
| | | | |

*(Exemplos de tipos: informação propositalmente visível; endpoint propositalmente público; exceção de permissão; comportamento especial.)*

---

## 17. Dúvidas pendentes

| Dúvida | Quem precisa responder | Status |
|--------|------------------------|--------|
| | | |
| | | |

**Regra:** se uma regra necessária para segurança estiver ambígua:

```
PARAR
→ registrar nesta seção
→ solicitar validação humana
→ não inventar a resposta
```

---

## 18. Regras para agentes / IA

Ao utilizar esta Ficha com um agente:

1. A Ficha representa o comportamento **esperado**.
2. Código e banco representam o comportamento **implementado**.
3. O agente deve **comparar** os dois.
4. Divergência deve ser registrada como possível gap.
5. Regra ambígua **não** pode ser corrigida automaticamente.
6. O responsável pelo sistema deve validar regras de negócio.
7. Após validação, regras críticas devem gerar testes quando tecnicamente possível.

O comportamento atualmente implementado no código não deve ser considerado automaticamente uma regra de negócio correta. Quando houver divergência entre código/banco e uma Ficha VALIDADA, o agente deve registrar a divergência como possível gap. A Ficha não deve ser alterada automaticamente para se adaptar ao comportamento existente do código.

Se uma regra crítica for inferida **somente** do código: marcar como **inferida / pendente de validação**. Código implementado **nunca** substitui fonte de regra de negócio.

O agente **não** decide sozinho: quem deveria ter acesso; quais roles deveriam existir; se uma exposição é intencional; se uma regra de negócio deve ser alterada.

---

## 19. Aprovação da ficha

| Campo | Preenchimento |
|-------|----------------|
| Preenchida por | |
| Validada por | |
| Responsável pelo sistema | |
| Data | |
| Versão | |

A Ficha deve ser atualizada sempre que houver alteração relevante de usuários, roles, permissões, isolamento, integrações, dados sensíveis ou fluxos críticos.
