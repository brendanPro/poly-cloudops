# Terraform Infrastructure for Poly-CloudOps

## Architecture

| Component | Resource | Purpose |
|-----------|----------|---------|
| Compute | Cloud Run | Serverless n8n container (auto-scaling 0-10 instances) |
| Container Registry | Artifact Registry | Docker image storage |
| Secrets | Secret Manager | Secure credential storage (encryption key, DB connection, API keys) |
| Database | Neon PostgreSQL | External managed PostgreSQL database |
| IAM | Service Account | Least-privilege access control for Cloud Run |
| State | GCS Bucket | Shared Terraform state for team collaboration |

---

## Already Set Up

The following resources were already created and are **shared across the team**:

- GCS bucket for Terraform state: `gs://polycloudops-terraform-state`
- GCP Secrets (created in Secret Manager):
  - `n8n-encryption-key` (n8n encryption key)
  - `deepl-api-key` (DeepL API key for translations)

**These do not need to be created again.**

Database secrets (`db-host`, `db-user`, `db-password`, `db-database`, and `n8n-db-connection-string`) are created and updated by Terraform.

---

## Quick Start for Team Members

### Step 1: Authenticate to GCP

```bash
gcloud auth login
gcloud config set project polycloudops
gcloud config set compute/region europe-west1
gcloud config list
```

### Step 2: Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Values required in `terraform.tfvars`:
- `neon_api_key`
- `neon_org_id`
- `n8n_admin_email`
- `n8n_admin_password`

### Step 3: Initialize Terraform

```bash
terraform init
```

### Step 4: Validate and Plan

```bash
terraform validate
terraform plan
```

### Step 5: Deploy Infrastructure

```bash
terraform apply
```

Notes:
- The translations table is created by Terraform using a Dockerized PostgreSQL client.
- The admin bootstrap runs after Cloud Run deploys and waits for n8n to initialize its tables.
- SQL scripts used by Terraform live in `terraform/scripts/` and `bootstrap/`.

---

## CI/CD Workflows

This infrastructure uses GitHub Actions for automated validation and deployment.

### GitHub Actions Workflow

**Workflow File**: `.github/workflows/terraform-validate.yml`

**Triggers**:
- Pull requests targeting `main` or `master` branches
- Pushes to `main` or `master` branches (when terraform files change)
- Manual workflow dispatch

**Workflow Steps**:
1. **Terraform Format Check**: Validates code formatting (`terraform fmt -check`)
2. **Terraform Init**: Initializes providers with remote GCS state backend
3. **Terraform Validate**: Checks syntax and configuration validity
4. **Terraform Plan**: Generates execution plan with state-aware diffs
5. **PR Comment**: Posts plan output as a comment on pull requests

**Authentication**:
- Uses **Workload Identity Federation (WIF)** for keyless GCP authentication
- No JSON service account keys required
- OIDC-based authentication via GitHub Actions

### Workload Identity Federation Setup

**WIF Provider** (already created via Terraform):
- Pool: `github-actions-pool`
- Provider: `github-provider`
- Restricted to repository: `brendanPro/poly-cloudops`

**GitHub Repository Secrets** (already configured):
- `GCP_PROJECT_ID`: `polycloudops`
- `GCP_WIF_PROVIDER`: Full WIF provider resource name
- `GCP_SERVICE_ACCOUNT`: `terraform-sa@polycloudops.iam.gserviceaccount.com`

**IAM Binding** (requires project owner):

The terraform service account needs the `roles/iam.workloadIdentityUser` binding. If this fails in Terraform, the project owner must run:

```bash
gcloud iam service-accounts add-iam-policy-binding terraform-sa@polycloudops.iam.gserviceaccount.com \
  --member="principalSet://iam.googleapis.com/projects/173389596894/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/brendanPro/poly-cloudops" \
  --role="roles/iam.workloadIdentityUser"
```

### Testing Workflows

**View workflow runs**:
- GitHub → Actions tab → Terraform Validation

**Trigger manually**:
- GitHub → Actions → Terraform Validation → Run workflow

**Check PR comments**:
- Terraform plan output appears automatically on pull requests

**Verify authentication**:
- Check workflow logs to ensure WIF authentication succeeds
- No credentials or tokens should appear in logs

### Current Workflow Status

✅ **Validation-only** (no deployments):
- `terraform fmt` - Format checking
- `terraform validate` - Syntax validation
- `terraform plan` - State-aware planning

❌ **Not yet implemented**:
- `terraform apply` - Automated deployments
- Docker build/push - Container image building
- Dagger.io integration - CI/CD workflow composition

---
