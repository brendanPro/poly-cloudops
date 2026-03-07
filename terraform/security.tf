# ============================================================================
# SECRET MANAGER CONFIGURATION
# ============================================================================
# This file references secrets that must be created manually in GCP Secret Manager
# before running terraform apply.
# Note: Database secrets are now managed automatically in database.tf
# ============================================================================

# ============================================================================
# DATA SOURCES FOR EXISTING SECRETS
# ============================================================================

# Reference to n8n encryption key secret (must exist)
data "google_secret_manager_secret" "n8n_encryption_key" {
  project   = var.project_id
  secret_id = var.secret_n8n_encryption_key

  depends_on = [
    google_project_service.required_apis
  ]
}

# Reference to DeepL API key secret (must exist)
data "google_secret_manager_secret" "deepl_api_key" {
  project   = var.project_id
  secret_id = var.secret_deepl_api_key

  depends_on = [
    google_project_service.required_apis
  ]
}

# ============================================================================
# NOTES
# ============================================================================
# - n8n_encryption_key and deepl_api_key must be created manually before terraform apply
# - Database secrets are automatically created and managed by Terraform (see database.tf)
# - The Cloud Run service account needs secretAccessor role (granted in iam.tf and database.tf)
# - Secrets are mounted as environment variables in Cloud Run (see cloudrun.tf)

