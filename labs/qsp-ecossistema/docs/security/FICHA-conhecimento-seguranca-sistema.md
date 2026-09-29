# Ficha — Clínica Dual (laboratório)

| Campo | Valor |
|-------|--------|
| Nome | Clínica Dual |
| Objetivo | Agenda e prontuário de pacientes (lab, não é produto real) |
| Status da ficha | VALIDADA |
| Mapa QSP | `docs/security/qsp-coverage-map.json` |

## Comportamento esperado (o que o QSP protege)

- Médico vê só os próprios pacientes.
- Recepcionista agenda, não lê prontuário.
- Paciente não vê agenda de outro paciente.
- Relatório G7 (produção mensal) só para médico do mesmo tenant.

## Proibido

- Trocar o id na URL e ver paciente de outro médico (IDOR).
- Relatório G7 sem RLS no banco.
