# Laboratório — um único ecossistema

História: produto **Clínica Dual**. O time de agentes constrói. O QSP julga a **PR**.

Não precisa de GitHub. Os scripts são os mesmos do Gate.

```bash
cd labs/qsp-ecossistema
node demo.mjs
```

Quatro cenas:

0. Repo sem mapa → `/equipe` manda implantar (não julgar PR).
1. Só um botão mudou → ALWAYS, sem teste caro de banco.
2. Alguém mexeu no G7 (migration) → IMPACT de RLS + perf de DB.
3. Pagamento novo sem mapa → drift vermelho, QA nem começa.
4. Job de RLS pulado → agregador recusa falso verde.

Contrato do time: [`skills/dev/qsp/ECOSSISTEMA.md`](../../skills/dev/qsp/ECOSSISTEMA.md).
Pacote original: [`skills/dev/qsp/pacote/`](../../skills/dev/qsp/pacote/).
