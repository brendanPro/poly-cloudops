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

## Already Set Up :

The following resources were already created and are **shared across the team**:

- GCS bucket for Terraform state: `gs://polycloudops-terraform-state`
- GCP Secrets (created in Secret Manager):
  - `n8n-encryption-key` (n8n encryption key)
  - `n8n-db-connection-string` (Neon PostgreSQL connection string, the staging branch)
  - `deepl-api-key` (DeepL API key for translations)

**You DON'T need to create these again**

---

## Quick Start for Team Members

### Step 1: Authenticate to GCP

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project polycloudops

# Set region
gcloud config set compute/region europe-west1

# Verify
gcloud config list
```

### Step 2: Configure Terraform Variables

```bash
cd terraform

# Copy example file to create your own terraform.tfvars
cp terraform.tfvars.example terraform.tfvars

# (Optional) Edit terraform.tfvars if you need custom settings
# for now there are no required changes
```

### Step 3: Initialize Terraform

```bash
# Initialize Terraform (connects to shared GCS backend)
terraform init

# This will:
# - Download Google Cloud provider
# - Connect to the shared state bucket
# - Set up local workspace
```

### Step 4: Validate and Plan

```bash
# Validate configuration
terraform validate

# Preview what will be created/changed
terraform plan

```

### Step 5: Deploy Infrastructure

**This is already done, we only need to run `terraform apply`**
```bash
# 1. Create Artifact Registry first
terraform apply -target=google_artifact_registry_repository.n8n_repo

# 2. Authenticate Docker to registry
gcloud auth configure-docker europe-west1-docker.pkg.dev

# 3. Pull and push n8n image
docker pull n8nio/n8n:latest
docker tag n8nio/n8n:latest europe-west1-docker.pkg.dev/polycloudops/n8n-repo/n8n:latest
docker push europe-west1-docker.pkg.dev/polycloudops/n8n-repo/n8n:latest

```

**THIS is where we are now:**
we only need to run this, and the rest is done

```bash
# 4. Apply full infrastructure
terraform apply
```

