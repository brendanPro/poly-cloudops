# ============================================================================
# MAIN TERRAFORM CONFIGURATION
# ============================================================================
# This file contains project-level configuration and API enablement

# ============================================================================
# LOCAL VARIABLES
# ============================================================================

locals {
  # Common labels for all resources
  common_labels = {
    project     = "poly-cloudops"
    environment = var.environment
    managed_by  = "terraform"
  }

  # Services/APIs to enable
  required_services = [
    "run.googleapis.com",                  # Cloud Run
    "artifactregistry.googleapis.com",     # Artifact Registry
    "secretmanager.googleapis.com",        # Secret Manager
    "storage.googleapis.com",              # Cloud Storage
    "iam.googleapis.com",                  # IAM
    "cloudresourcemanager.googleapis.com", # Resource Manager
    "compute.googleapis.com",              # Required for VPC and Networking
  ]
}

# ============================================================================
# ENABLE REQUIRED GOOGLE CLOUD APIS
# ============================================================================

resource "google_project_service" "required_apis" {
  for_each = toset(local.required_services)

  project = var.project_id
  service = each.value

  # Don't disable the service if the resource is destroyed
  disable_on_destroy = false

  # Don't fail if the service is already enabled
  disable_dependent_services = false
}

# NOTE: data "google_project" "project" is managed in iam.tf 
# to avoid duplication errors.


resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
}

# ============================================================================
# TEMPORARY: Commented out - needs proper GitHub Actions OIDC configuration
# ============================================================================
# resource "google_iam_workload_identity_pool_provider" "github_provider" {
#   workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
#   workload_identity_pool_provider_id = "github-provider"
#   attribute_mapping = {
#     "google.subject"       = "assertion.sub"
#     "attribute.repository" = "assertion.repository"
#     "attribute.actor"      = "assertion.actor"
#   }
#   oidc {
#     issuer_uri = "https://token.actions.githubusercontent.com"
#   }
# }

# resource "google_service_account_iam_member" "wif_binding" {
#   service_account_id = "projects/polycloudops/serviceAccounts/terraform-sa@polycloudops.iam.gserviceaccount.com"
#   role               = "roles/iam.workloadIdentityUser"
#   member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/brendanPro/poly-cloudops"
# }