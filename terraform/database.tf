# ==========================================================================
# DATABASE ACCESS CONFIGURATION (EXTERNAL NEON INSTANCE)
# ==========================================================================
# This module manages the secure connection between Google Cloud and Neon.tech.
# Since Neon provides a serverless PostgreSQL database externally, this 
# configuration focuses on Identity and Access Management (IAM) to ensure
# the application can retrieve credentials securely.

# Note: The data "google_project" "project" block is managed in a central 
# file (e.g., iam.tf or main.tf) to avoid duplication errors.

# IAM Policy: Grant Secret Access to the Application
# This resource implements the 'Principle of Least Privilege' by allowing 
# the Cloud Run service account to access only the specific secret 
# containing the database connection string.
resource "google_secret_manager_secret_iam_member" "n8n_db_secret_access" {
  project   = var.project_id
  secret_id = var.secret_db_connection_string
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"

  # Ensures IAM is applied only after the Secret Manager API is active
  # and the service account has been successfully provisioned.
  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloudrun_sa
  ]
}