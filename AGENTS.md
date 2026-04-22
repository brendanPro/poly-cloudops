# AGENTS.md

Context and instructions for LLMs working on this codebase.

## What this project is

Poly-CloudOps is a school project (Polytech Angers) that teaches cloud-native DevOps by building and operating a real application. The project is an **n8n workflow automation hub**: a Next.js frontend where users trigger n8n workflows (translation, QR codes, JSON-to-Excel, AI summarization, weather, currency conversion) via webhooks.

The infrastructure is on GCP. n8n and the frontend each run as separate Cloud Run services. The database is Neon (serverless PostgreSQL). Secrets live in GCP Secret Manager. Terraform provisions everything. GitHub Actions deploys it.

## Repository layout

```
frontend/            Next.js 14 app (the user-facing hub)
  app/               Next.js app router pages and API routes
    page.tsx         Home page, lists all workflows
    [workflow]/      One subdirectory per workflow (translate, qr, json-to-excel, summarize, weather, currency)
    api/[workflow]/  Server-side API routes that proxy to n8n webhooks
    ui/              Shared components (TopNavbar, WorkflowCard, StatsCard)
    ui/globals.css   Design system (CSS variables, utility classes, animations)
  lib/               Shared data (workflows-data.ts is the single source of truth for workflow metadata)
  types/             TypeScript types (workflow.ts)
  Dockerfile         Multi-stage build (Bun builder + Node runner), outputs standalone Next.js
  next.config.mjs    Standalone output mode

terraform/           GCP + Neon infrastructure
  main.tf            Locals, API enablement
  providers.tf       google, google-beta, neon, postgresql, null, random
  backend.tf         GCS remote state (bucket: polycloudops-terraform-state)
  versions.tf        Provider version pins
  cloudrun.tf        Cloud Run service for n8n (image: n8nio/n8n:2.10.4)
  database.tf        Neon project/database/role + Secret Manager secret versions + bootstrap null_resource
  iam.tf             Service accounts, IAM bindings
  network.tf         VPC, subnet, firewall rules
  security.tf        References to manually-created secrets (n8n-encryption-key, deepl-api-key)
  storage.tf         Optional Cloud Storage bucket
  outputs.tf         All Terraform outputs

workflows/           n8n workflow JSON exports (importable into n8n)
  translate-text-deepl.json
  ai-text-summarizer.json
  json-to-excel.json

bootstrap/
  setup-n8n.sql      Sets n8n admin user and disables first-run setup via pgcrypto
  steps/insertUserSql.js  JS alternative (legacy)

init_db/
  init.sql           Creates translations table on local Postgres startup

.github/workflows/
  terraform-validate.yml  3-job pipeline: validate -> deploy staging -> deploy production
  frontend-deploy.yml     Build + push frontend Docker image -> deploy to Cloud Run

.husky/
  commit-msg         Enforces Conventional Commits format (blocks invalid messages)
  pre-push           Blocks pushes from branches with non-conventional names
  post-checkout      Warns (does not block) on checkout to non-conventional branch names

docs/                Supplementary documentation for collaborators
```

## Architecture

```
User browser
    |
    v
Cloud Run: frontend-service (Next.js, port 3000)
    |
    | POST /api/<workflow>  (server-side, env var webhook URLs)
    v
Cloud Run: n8n-service (n8n, port 5678)
    |
    | varies by workflow
    v
External APIs: DeepL, OpenRouter, Open-Meteo, ExchangeRate-API
    |
    v (translation workflow only)
Neon PostgreSQL (public.translations table)
```

Secrets (db credentials, n8n encryption key, DeepL key) are stored in GCP Secret Manager and mounted as env vars in the Cloud Run n8n service.

The frontend never talks directly to external APIs or the database. All calls go through n8n webhooks.

## How the frontend works

Each workflow follows the same pattern:

1. `frontend/lib/workflows-data.ts` — defines the workflow metadata (id, name, path, color, icon, status)
2. `frontend/app/[workflow]/page.tsx` — client component, calls `/api/[workflow]`
3. `frontend/app/api/[workflow]/route.ts` — server-side API route, reads the webhook URL from env, proxies to n8n, normalizes the response

To add a new workflow:
1. Add an entry to `workflows-data.ts`
2. Create `app/[workflow]/page.tsx`
3. Create `app/api/[workflow]/route.ts`
4. Add the webhook URL secret to GitHub Secrets and to `frontend-deploy.yml`
5. Export the n8n workflow JSON to `workflows/`

## How Terraform is structured

Terraform uses **workspaces** for environment isolation:
- `default` workspace = production (no resource name suffix)
- `staging` workspace = staging (resources get `-staging` suffix via `local.env_suffix`)

The workspace is selected automatically by GitHub Actions based on the branch:
- push to `main` -> `default` workspace -> production deploy (requires manual approval via GitHub environment gate)
- push to `develop` -> `staging` workspace -> staging deploy (automatic)

Secrets that must be created manually in GCP Secret Manager before `terraform apply`:
- `n8n-encryption-key`
- `deepl-api-key`

Secrets created and updated automatically by Terraform (from Neon outputs):
- `db-host`, `db-user`, `db-password`, `db-database`, `n8n-db-connection-string`

WIF (Workload Identity Federation) is managed outside Terraform and referenced via `var.wif_provider_name` and `var.wif_service_account_email`.

## Environment variables

Local dev uses `.env.development` (copy to `.env` and fill in values). The frontend uses `.env.local` for development.

Required for local dev (`.env`):
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- `N8N_ENCRYPTION_KEY` — generate with `openssl rand -base64 24`
- `N8N_ADMIN_EMAIL`, `N8N_ADMIN_PASSWORD`
- `DEEPL_API_KEY`

Required for frontend local dev (`frontend/.env.local`):
- `N8N_TRANSLATE_WEBHOOK_URL`
- `N8N_QR_WEBHOOK_URL`
- `N8N_JSON_EXCEL_WEBHOOK_URL`
- `N8N_SUMMARIZE_WEBHOOK_URL`
- `N8N_WEATHER_WEBHOOK_URL`
- `N8N_CURRENCY_WEBHOOK_URL`

## Key constraints and known quirks

- **n8n version is pinned** to `2.10.4`. Do not change this without testing — n8n has breaking changes between minor versions.
- **Artifact Registry is commented out** for the n8n service. The official Docker Hub image is used directly. The frontend uses Artifact Registry (`n8n-repo/frontend`).
- **`next.config.mjs` only exposes 2 env vars** via the `env` block (translate and QR webhook URLs). The other 4 are server-only by design — they must not be exposed to the client.
- **Translations are persisted to Neon** only by the translation workflow. Other workflows are stateless.
- **The weather and currency n8n workflows are not committed** to `workflows/`. They exist only in the live n8n instance. Export and commit them if you make changes.
- **`main.tf` and other `.tf` files on the `feat/frontend` branch are placeholders.** The real infrastructure code lives on `main`. Never edit infrastructure from the frontend branch.
- **Husky version 9+** is used. Do not add `. "$(dirname -- "$0")/_/husky.sh"` to hook scripts — it is obsolete and will break on version 10.

## Commit and branch conventions

Commit format (enforced by `commit-msg` hook):
```
<type>(<scope>): <subject>
```

Branch format (enforced by `pre-push` hook):
```
<type>/<description>
<type>/<scope>/<description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Protected branches exempt from branch naming: `main`, `master`, `develop`, `staging`, `production`

## Build and run commands

```bash
# Install deps + set up git hooks
bun install

# Local full stack
docker compose up -d

# Frontend only (dev mode)
cd frontend && bun dev

# Frontend build
cd frontend && bun run build

# Terraform
cd terraform
terraform init
terraform validate
terraform fmt -recursive
terraform plan
terraform apply
```

## CI/CD

Two GitHub Actions workflows:

**`terraform-validate.yml`** — runs on PRs and pushes to `main`/`develop` when `terraform/**` changes:
1. Validate: fmt check, init, validate, plan, encrypt plan with GPG, upload as artifact, comment on PR
2. Deploy staging: downloads artifact, decrypts, applies (triggers on `develop` push)
3. Deploy production: same but requires `environment: production` approval gate (triggers on `main` push)

**`frontend-deploy.yml`** — runs on pushes to `main` when `frontend/**` changes:
1. Validates all 7 webhook secrets are set
2. Authenticates via WIF
3. Builds and pushes Docker image to Artifact Registry
4. Deploys to Cloud Run `frontend-service`

Required GitHub Secrets: `GCP_WIF_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `PLAN_ENCRYPTION_KEY`, `NEON_API_KEY`, `NEON_ORG_ID`, `N8N_ADMIN_PASSWORD`, `TF_VAR_WIF_PROVIDER_NAME`, `TF_VAR_WIF_SERVICE_ACCOUNT_EMAIL`, plus all 6 frontend webhook URL secrets (`N8N_TRANSLATE_WEBHOOK_URL`, `N8N_QR_WEBHOOK_URL`, `N8N_JSON_EXCEL_WEBHOOK_URL`, `N8N_SUMMARIZE_WEBHOOK_URL`, `N8N_WEATHER_WEBHOOK_URL`, `N8N_CURRENCY_WEBHOOK_URL`).

## Troubleshooting

```bash
# View n8n Cloud Run logs
gcloud run services logs read n8n-service --region=europe-west1 --limit=50

# Check what Terraform knows about current state
terraform show

# Test database connectivity
psql "postgresql://<user>:<pass>@<neon-host>/n8n_db?sslmode=require"

# Inspect running containers locally
docker compose ps
docker compose logs n8n -f
```
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

