# Infrastructure Reproducibility Guide

## Overview

This document explains how to set up and manage the Poly-CloudOps infrastructure with Terraform.
The architecture avoids circular dependencies (chicken-and-egg issues) by managing critical identity resources outside Terraform.

## Architecture Principles

### What Terraform Does NOT Manage (Manual Setup Required)

To prevent circular dependencies and accidental deletion of critical authentication resources:

1. Terraform service account: `<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`
2. Workload Identity Federation (WIF) pool: `gh-pool` (shared across environments)
3. WIF provider: `github-provider` (for GitHub Actions authentication)
4. IAM permissions for `<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`

Why?
If Terraform managed these resources, `terraform destroy` could delete credentials Terraform needs to authenticate, creating an impossible recovery path.

### What Terraform DOES Manage

- Cloud Run services (`n8n-service`, `n8n-service-staging`)
- Cloud Run service account (example: `<CLOUD_RUN_SERVICE_ACCOUNT_EMAIL>`)
- VPC, subnets, and firewall rules
- Secret Manager secrets and IAM bindings
- GCS buckets (optional)
- API enablement
- All application infrastructure

## Initial Setup (One-Time Configuration)

### Step 1: Create Terraform Service Account

```bash
# Create the service account
gcloud iam service-accounts create terraform-sa \
  --display-name="Terraform Service Account" \
  --description="Service account for Terraform infrastructure management" \
  --project=<GCP_PROJECT_ID>

# Grant required permissions
gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --role="roles/resourcemanager.projectIamAdmin"
```

### Step 2: Create Workload Identity Federation (WIF) Resources

```bash
# Create WIF pool (shared across all environments)
gcloud iam workload-identity-pools create gh-pool \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions CI/CD" \
  --project=<GCP_PROJECT_ID>

# Create WIF provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="gh-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner=='<GITHUB_ORG_OR_USER>'" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --project=<GCP_PROJECT_ID>

# Bind WIF to Terraform SA for GitHub Actions authentication
gcloud iam service-accounts add-iam-policy-binding <TERRAFORM_SERVICE_ACCOUNT_EMAIL> \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<GCP_PROJECT_NUMBER>/locations/global/workloadIdentityPools/gh-pool/attribute.repository/<GITHUB_ORG_OR_USER>/<GITHUB_REPO>" \
  --project=<GCP_PROJECT_ID>
```

Note: Replace `<GCP_PROJECT_NUMBER>` with your numeric GCP project number.

### Step 3: Grant Impersonation Permission (Local Development)

Allow your personal account to impersonate `<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`:

```bash
gcloud iam service-accounts add-iam-policy-binding <TERRAFORM_SERVICE_ACCOUNT_EMAIL> \
  --member="user:<YOUR_EMAIL>" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=<GCP_PROJECT_ID>
```

### Step 4: Configure Terraform Variables

Create or update `terraform/terraform.tfvars` (this file is in `.gitignore`):

```hcl
# Project configuration
project_id  = "<GCP_PROJECT_ID>"
region      = "europe-west1"
zone        = "europe-west1-b"
environment = "staging" # or "production"

# WIF configuration (externally managed - DO NOT create with Terraform)
wif_provider_name         = "projects/<GCP_PROJECT_NUMBER>/locations/global/workloadIdentityPools/gh-pool/providers/github-provider"
wif_service_account_email = "<TERRAFORM_SERVICE_ACCOUNT_EMAIL>"

# Cloud Run configuration
cloudrun_service_name = "n8n-service"
cloudrun_image        = "n8nio/n8n:2.10.4"
```

Create or update `terraform/variables.tf` to include WIF variables:

```hcl
variable "wif_provider_name" {
  description = "Full resource name of the externally-managed WIF provider"
  type        = string
  default     = ""
}

variable "wif_service_account_email" {
  description = "Email of the externally-managed service account for WIF"
  type        = string
  default     = ""
}
```

### Step 5: Configure GitHub Secrets (CI/CD)

Set these GitHub Actions secrets in your repository settings.

```bash
gh secret set GCP_PROJECT_ID --body "<GCP_PROJECT_ID>" --repo <GITHUB_ORG_OR_USER>/<GITHUB_REPO>
gh secret set GCP_WIF_PROVIDER --body "projects/<GCP_PROJECT_NUMBER>/locations/global/workloadIdentityPools/gh-pool/providers/github-provider" --repo <GITHUB_ORG_OR_USER>/<GITHUB_REPO>
gh secret set GCP_SERVICE_ACCOUNT --body "<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" --repo <GITHUB_ORG_OR_USER>/<GITHUB_REPO>
```

## Daily Workflow

### Running Terraform Locally

PowerShell (Windows):

```powershell
# Configure impersonation for this session
$env:GOOGLE_IMPERSONATE_SERVICE_ACCOUNT = "<TERRAFORM_SERVICE_ACCOUNT_EMAIL>"

# Navigate to terraform directory
cd terraform

# Select workspace
terraform workspace select staging # or: terraform workspace select default

# Run Terraform commands
terraform plan
terraform apply
```

Bash (Linux/macOS):

```bash
# Configure impersonation for this session
export GOOGLE_IMPERSONATE_SERVICE_ACCOUNT="<TERRAFORM_SERVICE_ACCOUNT_EMAIL>"

# Navigate to terraform directory
cd terraform

# Select workspace
terraform workspace select staging # or: terraform workspace select default

# Run Terraform commands
terraform plan
terraform apply
```

## Destroying and Recreating Infrastructure

Important: Destroy and recreate infrastructure in both workspaces.

```powershell
# Set impersonation (PowerShell)
$env:GOOGLE_IMPERSONATE_SERVICE_ACCOUNT = "<TERRAFORM_SERVICE_ACCOUNT_EMAIL>"

# Navigate to terraform directory
cd terraform

# === STAGING WORKSPACE ===
terraform workspace select staging
terraform destroy # Destroy staging infrastructure
terraform apply   # Recreate staging infrastructure
terraform plan    # Verify: should show "No changes"

# === PRODUCTION WORKSPACE (default) ===
terraform workspace select default
terraform destroy # Destroy production infrastructure
terraform apply   # Recreate production infrastructure
terraform plan    # Verify: should show "No changes"
```

What gets destroyed:
- Cloud Run services
- VPCs
- Firewall rules
- GCS buckets (if any)

What stays intact:
- Terraform service account (`<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`)
- WIF pool (`gh-pool`)
- WIF provider (`github-provider`)
- IAM permissions for `<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`

Result: Clean infrastructure recreation without breaking CI/CD authentication.

## Workspaces

The project uses two Terraform workspaces:

| Workspace | Environment | Cloud Run Service Name |
| --- | --- | --- |
| default | Production | n8n-service |
| staging | Staging | n8n-service-staging |

Shared resources (across both workspaces):

- WIF pool: `gh-pool`
- WIF provider: `github-provider`
- Service account: `<TERRAFORM_SERVICE_ACCOUNT_EMAIL>`

Workspace commands:

```bash
terraform workspace list         # List all workspaces
terraform workspace show         # Show current workspace
terraform workspace select NAME  # Switch workspace
```

## Troubleshooting

### Error 403: Permission Denied

Cause: Terraform service account is missing required IAM permissions.

Solution: Re-run IAM grants from Step 1.

### Terraform State Contains Deleted Resources

Symptom: `terraform plan` tries to manage resources removed from `.tf` files.

Solution: Remove orphaned resources from Terraform state.

```bash
# List resources
terraform state list

# Remove specific resource (does NOT delete from GCP)
terraform state rm <resource_name>

# Example: remove WIF resources if they were previously managed by Terraform
terraform state rm google_iam_workload_identity_pool.github_pool
terraform state rm google_iam_workload_identity_pool_provider.github_provider
```

### Impersonation Not Working

Symptom: Commands run as your personal identity instead of the Terraform service account.

Check:

```powershell
# PowerShell
echo $env:GOOGLE_IMPERSONATE_SERVICE_ACCOUNT
```

```bash
# Bash
echo $GOOGLE_IMPERSONATE_SERVICE_ACCOUNT
```

Solution: Set the impersonation environment variable before running Terraform.

### GitHub Actions Authentication Fails

Cause: WIF configuration is incorrect or required GitHub secrets are missing.

Verify:

1. GitHub secrets exist: `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_SERVICE_ACCOUNT`
2. WIF binding:

```bash
gcloud iam service-accounts get-iam-policy <TERRAFORM_SERVICE_ACCOUNT_EMAIL> \
  --project=<GCP_PROJECT_ID>
```

3. `roles/iam.workloadIdentityUser` binding includes your repository.

## Quick Reference

### Check Terraform Service Account Permissions

```bash
gcloud projects get-iam-policy <GCP_PROJECT_ID> \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:<TERRAFORM_SERVICE_ACCOUNT_EMAIL>" \
  --format="table(bindings.role)"
```

### Verify WIF Configuration

```bash
# List WIF pools
gcloud iam workload-identity-pools list --location=global --project=<GCP_PROJECT_ID>

# Describe WIF provider
gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=gh-pool \
  --project=<GCP_PROJECT_ID>

# Check WIF binding on Terraform service account
gcloud iam service-accounts get-iam-policy <TERRAFORM_SERVICE_ACCOUNT_EMAIL> \
  --project=<GCP_PROJECT_ID>
```

### Get WIF Provider Full Name

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=gh-pool \
  --project=<GCP_PROJECT_ID> \
  --format="value(name)"
```

### Required IAM Roles for Terraform Service Account

- `roles/compute.admin`
- `roles/run.admin`
- `roles/serviceusage.serviceUsageAdmin`
- `roles/storage.admin`
- `roles/secretmanager.admin`
- `roles/iam.serviceAccountAdmin`
- `roles/iam.serviceAccountUser`
- `roles/resourcemanager.projectIamAdmin`

## Summary

Best practices:

1. Keep Terraform service account, WIF pool, and WIF provider outside Terraform management.
2. Store WIF configuration as values in `terraform.tfvars`, not as Terraform-managed resources.
3. Always use service-account impersonation for local and CI/CD Terraform execution.
4. Destroy and recreate infrastructure in both workspaces (`staging` and `default`).
5. Never commit `terraform.tfvars` to version control.

Benefits:

- No chicken-and-egg issue: authentication resources remain intact.
- Clean reproducibility: `terraform destroy` + `terraform apply` remains reliable.
- CI/CD stability: GitHub Actions authentication is preserved.
- Multi-environment support: shared WIF resources for staging and production.
