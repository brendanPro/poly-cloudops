# ============================================================================
# SECRET MANAGER CONFIGURATION
# ============================================================================
# This file references secrets that must be created manually in GCP Secret Manager
# before running terraform apply.
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

# Reference to database connection string secret (must exist)
data "google_secret_manager_secret" "db_connection_string" {
  project   = var.project_id
  secret_id = var.secret_db_connection_string

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
# SECRET VERSIONS (LATEST)
# ============================================================================

# Get the latest version of n8n encryption key
data "google_secret_manager_secret_version" "n8n_encryption_key_latest" {
  secret  = data.google_secret_manager_secret.n8n_encryption_key.id
  version = "latest"
}

# Get the latest version of database connection string
data "google_secret_manager_secret_version" "db_connection_string_latest" {
  secret  = data.google_secret_manager_secret.db_connection_string.id
  version = "latest"
}

# Get the latest version of DeepL API key
data "google_secret_manager_secret_version" "deepl_api_key_latest" {
  secret  = data.google_secret_manager_secret.deepl_api_key.id
  version = "latest"
}

# ============================================================================
# NOTES
# ============================================================================
# - Secrets must be created manually before running terraform apply
# - The Cloud Run service account needs secretAccessor role (granted in iam.tf)
# - Secrets are mounted as environment variables in Cloud Run (see cloudrun.tf)
