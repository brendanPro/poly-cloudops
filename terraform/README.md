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

