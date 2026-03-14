# Infrastructure Reproducibility Guide

## Overview

This document describes how to completely destroy and recreate all infrastructure with Terraform. The main challenge is Google Cloud Platform's soft-delete behavior for Workload Identity Federation resources.

## The Problem

When you run `terraform destroy`, GCP soft-deletes WIF pools and providers for 30 days. During this period, the resource name is reserved and you cannot create a new resource with the same name.

**Result**: `terraform apply` after `terraform destroy` fails with HTTP 409 "already exists" error.

## Prerequisites

- IAM role: `roles/iam.workloadIdentityPoolAdmin` (required for undelete operation)
- Alternative roles: `roles/editor` + `roles/iam.securityAdmin` + `roles/resourcemanager.projectIamAdmin`

## Solution 1: Undelete Resources (Recommended)

### Step 1: Destroy Infrastructure

```bash
cd terraform
terraform workspace select WORKSPACE_NAME
terraform destroy
```

### Step 2: Undelete WIF Resources

## Note that you can also do this via the GCP console UI, i recommend doing it from there.

```bash
# Undelete the pool
gcloud iam workload-identity-pools undelete gh-pool \
  --location=global

# For staging workspace
gcloud iam workload-identity-pools undelete gh-pool-staging \
  --location=global

# Undelete the provider
gcloud iam workload-identity-pools providers undelete github-provider \
  --location=global \
  --workload-identity-pool=gh-pool

# For staging workspace
gcloud iam workload-identity-pools providers undelete github-provider \
  --location=global \
  --workload-identity-pool=gh-pool-staging
```

### Step 3: run apply :

```bash
terraform apply
```

this apply will fail because we didnt import the provider and the pool yet, but that is expected, since the import will need resources to exist, and this first apply run will help creating them. 


### Step 4: Import into Terraform State

```bash
# Import pool
terraform import google_iam_workload_identity_pool.github_pool \
  projects/PROJECT_ID/locations/global/workloadIdentityPools/gh-pool

# Import provider
terraform import google_iam_workload_identity_pool_provider.github_provider \
  projects/PROJECT_ID/locations/global/workloadIdentityPools/gh-pool/providers/github-provider
```

### Step 5: Recreate Infrastructure

```bash
terraform apply
```

### Step 5: Verify

```bash
terraform plan
# Should show "No changes"
```

## Solution 2: Change Resource Names

### Step 1: Update Variables

Edit `terraform.tfvars`:

```hcl
wif_pool_id = "gh-pool-v2"
wif_provider_id = "github-provider-v2"
```

### Step 2: Apply

```bash
terraform apply
```

### Step 3: Update GitHub Secrets

```bash
# Get new WIF provider name
terraform output wif_provider_name

# Update GitHub secret
gh secret set GCP_WIF_PROVIDER --body "NEW_PROVIDER_NAME" --repo OWNER/REPO
```

## Quick Reference

**Check for soft-deleted resources**:
```bash
gcloud iam workload-identity-pools list --location=global --show-deleted
```

**Undelete pool**:
```bash
gcloud iam workload-identity-pools undelete POOL_NAME --location=global
```

**Undelete provider**:
```bash
gcloud iam workload-identity-pools providers undelete PROVIDER_NAME \
  --location=global \
  --workload-identity-pool=POOL_NAME
```

**Import to Terraform**:
```bash
terraform import google_iam_workload_identity_pool.github_pool \
  projects/PROJECT_ID/locations/global/workloadIdentityPools/POOL_NAME

terraform import google_iam_workload_identity_pool_provider.github_provider \
  projects/PROJECT_ID/locations/global/workloadIdentityPools/POOL_NAME/providers/PROVIDER_NAME
```
