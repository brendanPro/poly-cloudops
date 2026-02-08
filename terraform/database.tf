# ============================================================================
# DATABASE ACCESS PERMISSIONS (EXISTING SECRETS)
# ============================================================================

# We only grant IAM access to the existing secret. 
# We DO NOT create a secret version here because the value is already 
# managed manually in the Google Cloud Console.
resource "google_secret_manager_secret_iam_member" "n8n_db_secret_access" {
  project   = var.project_id
  secret_id = var.secret_db_connection_string # Name of your existing secret
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}