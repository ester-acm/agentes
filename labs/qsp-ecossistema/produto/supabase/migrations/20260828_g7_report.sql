-- G7: producao mensal por medico (lab)
CREATE TABLE IF NOT EXISTS g7_report (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  medico_id uuid NOT NULL,
  competencia date NOT NULL
);
ALTER TABLE g7_report ENABLE ROW LEVEL SECURITY;
