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

# ============================================================================
# PROJECT METADATA
# ============================================================================

# no metadata resources needed at this time
