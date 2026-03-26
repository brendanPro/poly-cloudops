# ============================================================================
# SERVICE ACCOUNTS
# ============================================================================

# Dedicated service account for Cloud Run n8n service
resource "google_service_account" "cloudrun_sa" {
  project      = var.project_id
  account_id   = "${var.cloudrun_service_account_name}${local.env_suffix}"
  display_name = var.cloudrun_service_account_display_name
  description  = "Service account for n8n Cloud Run service with least privilege access"

  # Ensure IAM API is enabled first
  depends_on = [
    google_project_service.required_apis
  ]
}

# ============================================================================
# IAM ROLE BINDINGS FOR CLOUD RUN SERVICE ACCOUNT
# ============================================================================

# Grant access to Secret Manager secrets (n8n encryption key and DeepL API key)
# Note: Database secrets are managed in database.tf with their own IAM permissions
resource "google_secret_manager_secret_iam_member" "cloudrun_sa_secret_accessor" {
  for_each = toset([
    var.secret_n8n_encryption_key,
    var.secret_deepl_api_key,
  ])

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"

  # Ensure secrets exist before binding
  depends_on = [
    google_service_account.cloudrun_sa
  ]
}

# Grant Cloud Run service account the ability to act as itself (workload identity)
resource "google_service_account_iam_member" "cloudrun_sa_user" {
  service_account_id = google_service_account.cloudrun_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Grant logging permissions
resource "google_project_iam_member" "cloudrun_sa_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Grant metrics writing permissions
resource "google_project_iam_member" "cloudrun_sa_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# ============================================================================
# DATA SOURCES
# ============================================================================

# Get current project information
data "google_project" "project" {
  project_id = var.project_id
}
