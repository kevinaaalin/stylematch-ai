-- StyleMatch AI R9.2 production adapter baseline (PostgreSQL 16+).
CREATE TABLE IF NOT EXISTS twcid_match_requests (
  match_request_id uuid PRIMARY KEY, stylematch_project_id text NOT NULL,
  tenant_id text NOT NULL, organization_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('candidate_ready','confirmed','cancelled')),
  criteria jsonb NOT NULL, candidates jsonb NOT NULL, candidates_checksum char(64) NOT NULL,
  selected_member_id text, trace_id text NOT NULL, created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), confirmed_at timestamptz
);
CREATE INDEX IF NOT EXISTS twcid_match_project_idx ON twcid_match_requests(tenant_id, organization_id, stylematch_project_id);

CREATE TABLE IF NOT EXISTS project_payment_orders (
  order_id uuid PRIMARY KEY, stylematch_project_id text NOT NULL, plan_id text NOT NULL,
  provider text NOT NULL, provider_session_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('requires_configuration','pending','paid','failed','refunded')),
  amount integer NOT NULL CHECK (amount > 0), currency char(3) NOT NULL,
  checkout_url text, customer_email text, trace_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS durable_jobs (
  job_id uuid PRIMARY KEY, job_type text NOT NULL, payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('queued','running','completed','dead_letter')),
  attempts integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL DEFAULT 3,
  available_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz,
  worker_id text, last_error text, trace_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS durable_jobs_claim_idx ON durable_jobs(status, available_at, created_at);

CREATE TABLE IF NOT EXISTS connector_exchange_packages (
  package_id uuid PRIMARY KEY, stylematch_project_id text NOT NULL,
  tool_type text NOT NULL CHECK (tool_type IN ('revit','ifc','autocad','rhino','blender')),
  direction text NOT NULL CHECK (direction IN ('import','export')),
  schema_version text NOT NULL, payload jsonb NOT NULL, checksum char(64) NOT NULL,
  status text NOT NULL, trace_id text NOT NULL, created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE twcid_match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_exchange_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_match_isolation ON twcid_match_requests USING (tenant_id = current_setting('app.tenant_id', true));

